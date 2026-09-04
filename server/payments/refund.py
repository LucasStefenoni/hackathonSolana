import base64
import json
import logging
import time

from solders.hash import Hash
from solders.instruction import Instruction
from solders.keypair import Keypair
from solders.pubkey import Pubkey
from solders.system_program import TransferParams, transfer
from solders.transaction import Transaction

from config import RECIPIENT, RECIPIENT_SECRET_KEY
from payments.solana_rpc import RpcTransientError, get_latest_blockhash, send_transaction

MEMO_PROGRAM_ID = Pubkey.from_string("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr")

log = logging.getLogger(__name__)

_REFUND_SEND_ATTEMPTS = 5


def _load_keypair(secret):
    stripped = secret.strip()
    if stripped.startswith("["):
        return Keypair.from_bytes(bytes(json.loads(stripped)))
    return Keypair.from_base58_string(stripped)


def load_recipient_keypair():
    """The keypair that signs refunds. Raises if RECIPIENT_SECRET_KEY is unset."""
    if not RECIPIENT_SECRET_KEY:
        raise RuntimeError(
            "RECIPIENT_SECRET_KEY is not set - this machine can't sign refunds. "
            "Set it in .env to enable automatic refunds."
        )
    return _load_keypair(RECIPIENT_SECRET_KEY)


def send_refund(buyer_pubkey_str, lamports, note="refund"):
    if lamports <= 0:
        raise ValueError("refund lamports must be positive")

    payer = load_recipient_keypair()
    if str(payer.pubkey()) != RECIPIENT:
        raise RuntimeError(
            f"RECIPIENT_SECRET_KEY does not match RECIPIENT_PUBKEY: secret key is for "
            f"{payer.pubkey()}, but RECIPIENT_PUBKEY is {RECIPIENT}. Refunds must be paid "
            "out of the wallet that actually received the deposits - fix .env."
        )
    buyer = Pubkey.from_string(buyer_pubkey_str)
    log.debug("refund: payer=%s buyer=%s lamports=%s", payer.pubkey(), buyer, lamports)

    last_exc = None
    for attempt in range(1, _REFUND_SEND_ATTEMPTS + 1):
        # fresh blockhash per attempt - an old one may have expired between tries
        blockhash = Hash.from_string(get_latest_blockhash())
        transfer_ix = transfer(TransferParams(from_pubkey=payer.pubkey(), to_pubkey=buyer, lamports=lamports))
        memo_ix = Instruction(MEMO_PROGRAM_ID, note.encode("utf-8"), [])
        tx = Transaction.new_signed_with_payer([transfer_ix, memo_ix], payer.pubkey(), [payer], blockhash)
        tx_b64 = base64.b64encode(bytes(tx)).decode("utf-8")
        try:
            signature = send_transaction(tx_b64)
            log.info("refund sent: %s (attempt %d)", signature, attempt)
            return signature
        except RpcTransientError as exc:
            last_exc = exc
            log.warning(
                "refund send attempt %d/%d failed transiently: %s", attempt, _REFUND_SEND_ATTEMPTS, exc
            )
            if attempt < _REFUND_SEND_ATTEMPTS:
                time.sleep(min(2 ** (attempt - 1), 8))
    raise RuntimeError(f"refund send failed after {_REFUND_SEND_ATTEMPTS} attempts: {last_exc}")
