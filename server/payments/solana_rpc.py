import logging
from dataclasses import dataclass

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from config import RPC_COMMITMENT, RPC_MAX_RETRIES, RPC_URL

log = logging.getLogger(__name__)


class RpcError(RuntimeError):
    """Base class for anything that went wrong talking to the RPC node."""


class RpcTransientError(RpcError):
    """Network blip, timeout, 429 or 5xx that survived the retry budget.

    Callers polling in a loop (waiting for payment) should log and keep going
    rather than crash - the next poll may well succeed.
    """


class RpcResponseError(RpcError):
    """The node answered with a JSON-RPC ``error`` object. Usually not retryable."""


class PaymentInvalid(RpcError):
    """A transaction referencing the order exists, but it is not a valid payment
    (failed on-chain, wrong recipient, or underpaid). The order must be rejected."""


@dataclass
class PaymentVerification:
    signature: str
    amount_lamports: int
    buyer: str | None = None


# JSON-RPC error 'err' values that mean "try again with a fresh blockhash" rather
# than "this transaction is bad". The refund send loop rebuilds the tx with a new
# blockhash on every attempt, so these are safe (and expected) to retry.
_TRANSIENT_TX_ERRS = ("BlockhashNotFound",)


def _build_session():
    session = requests.Session()
    retry = Retry(
        total=RPC_MAX_RETRIES,
        connect=RPC_MAX_RETRIES,
        read=RPC_MAX_RETRIES,
        status=RPC_MAX_RETRIES,
        backoff_factor=0.5,
        status_forcelist=(408, 429, 500, 502, 503, 504),
        allowed_methods=frozenset(["POST"]),
        respect_retry_after_header=True,
        raise_on_status=False,
    )
    adapter = HTTPAdapter(max_retries=retry, pool_connections=4, pool_maxsize=4)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    return session

_session = _build_session()


def rpc_call(method, params=None):
    log.debug("RPC -> %s %s", method, params)
    try:
        response = _session.post(
            RPC_URL,
            json={"jsonrpc": "2.0", "id": 1, "method": method, "params": params or []},
            timeout=(5, 15),
        )
    except requests.RequestException as exc:
        raise RpcTransientError(f"{method}: {exc}") from exc

    if response.status_code >= 500 or response.status_code in (408, 429):
        raise RpcTransientError(f"{method}: HTTP {response.status_code} after retries")
    try:
        response.raise_for_status()
    except requests.HTTPError as exc:
        raise RpcResponseError(f"{method}: HTTP {response.status_code}") from exc

    try:
        result = response.json()
    except ValueError as exc:
        raise RpcTransientError(f"{method}: non-JSON response") from exc

    log.debug("RPC <- %s %s", method, result)
    if "error" in result:
        err = result["error"] or {}
        data_err = (err.get("data") or {}).get("err") if isinstance(err, dict) else None
        message = err.get("message", "") if isinstance(err, dict) else str(err)
        if data_err in _TRANSIENT_TX_ERRS or "blockhash not found" in message.lower():
            raise RpcTransientError(f"{method}: {message or data_err} (retry with fresh blockhash)")
        raise RpcResponseError(f"RPC error calling {method}: {result['error']}")
    return result["result"]


def get_health():
    return rpc_call("getHealth")


def get_latest_blockhash():
    return rpc_call("getLatestBlockhash", [{"commitment": RPC_COMMITMENT}])["value"]["blockhash"]


def get_transaction(signature):
    return rpc_call(
        "getTransaction",
        [
            signature,
            {"encoding": "jsonParsed", "commitment": RPC_COMMITMENT, "maxSupportedTransactionVersion": 0},
        ],
    )


def send_transaction(signed_tx_b64):
    return rpc_call(
        "sendTransaction",
        [
            signed_tx_b64,
            {"encoding": "base64", "preflightCommitment": RPC_COMMITMENT, "maxRetries": 5},
        ],
    )


def get_balance(pubkey_str):
    return rpc_call("getBalance", [pubkey_str, {"commitment": RPC_COMMITMENT}])["value"]


def request_airdrop(pubkey_str, lamports):
    return rpc_call("requestAirdrop", [pubkey_str, lamports])

_ACCEPTED_STATUSES = ("confirmed", "finalized")

def verify_payment(reference_str, expected_recipient, min_lamports):
    """Return a PaymentVerification once a *valid* payment for this order lands.

    Returns None while nothing acceptable is on-chain yet (keep polling).
    """
    entries = rpc_call("getSignaturesForAddress", [reference_str, {"limit": 10}])
    if not entries:
        return None

    candidate = None
    for entry in entries:
        if entry.get("err") is not None:
            raise PaymentInvalid(
                f"transaction {entry['signature']} for this order failed on-chain: {entry['err']}"
            )
        if entry.get("confirmationStatus") in _ACCEPTED_STATUSES:
            candidate = entry
            break
    if candidate is None:
        return None  # seen but not confirmed yet

    signature = candidate["signature"]
    tx = get_transaction(signature)
    if tx is None:
        return None  # not queryable yet at this commitment

    meta = tx.get("meta") or {}
    if meta.get("err") is not None:
        raise PaymentInvalid(f"transaction {signature} failed on-chain: {meta['err']}")

    account_keys = tx["transaction"]["message"]["accountKeys"]

    def _key(k):
        return k["pubkey"] if isinstance(k, dict) else k

    # the fee payer / signer is always accountKeys[0] - this is who we refund,
    # regardless of whether they came through the /pay transaction-request route
    buyer = _key(account_keys[0]) if account_keys else None

    try:
        idx = next(i for i, k in enumerate(account_keys) if _key(k) == expected_recipient)
    except StopIteration:
        raise PaymentInvalid(
            f"transaction {signature} does not touch the recipient account {expected_recipient}"
        )

    delta = meta["postBalances"][idx] - meta["preBalances"][idx]
    if delta < min_lamports:
        raise PaymentInvalid(
            f"transaction {signature} paid {delta} lamports to {expected_recipient}, "
            f"expected at least {min_lamports}"
        )

    log.info("verified payment %s: %d lamports to %s from %s", signature, delta, expected_recipient, buyer)
    return PaymentVerification(signature=signature, amount_lamports=delta, buyer=buyer)
