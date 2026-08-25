import logging

import requests

from config import RPC_URL

log = logging.getLogger(__name__)


def rpc_call(method, params=None):
    log.debug("RPC -> %s %s", method, params)
    response = requests.post(RPC_URL, json={
        "jsonrpc": "2.0",
        "id": 1,
        "method": method,
        "params": params or [],
    }, timeout=10)
    response.raise_for_status()
    result = response.json()
    log.debug("RPC <- %s %s", method, result)
    if "error" in result:
        raise RuntimeError(f"RPC error calling {method}: {result['error']}")
    return result["result"]


def get_latest_blockhash():

    return rpc_call("getLatestBlockhash", [{"commitment": "confirmed"}])["value"]["blockhash"]


def find_payment_by_reference(reference_pubkey_str):

    signatures = rpc_call("getSignaturesForAddress", [reference_pubkey_str, {"limit": 1}])
    if not signatures:
        return None
    entry = signatures[0]
    if entry.get("err") is not None:
        raise RuntimeError(f"payment transaction failed on-chain: {entry['err']}")
    return entry["signature"]


def send_transaction(signed_tx_b64):
    return rpc_call("sendTransaction", [signed_tx_b64, {"encoding": "base64"}])


def get_balance(pubkey_str):
    return rpc_call("getBalance", [pubkey_str, {"commitment": "confirmed"}])["value"]


def request_airdrop(pubkey_str, lamports):
    return rpc_call("requestAirdrop", [pubkey_str, lamports])
