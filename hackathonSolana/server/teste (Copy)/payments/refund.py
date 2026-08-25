import base64
import json
import logging

from solders.keypair import Keypair
from solders.pubkey import Pubkey
from solders.system_program import transfer, TransferParams
from solders.instruction import Instruction
from solders.hash import Hash
from solders.transaction import Transaction

from config import RECIPIENT, RECIPIENT_SECRET_KEY
from payments.solana_rpc import get_latest_blockhash, send_transaction

MEMO_PROGRAM_ID = Pubkey.from_string("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr")

log = logging.getLogger(__name__)


def _load_keypair(secret):
    stripped = secret.strip()
    if stripped.startswith("["):
        return Keypair.from_bytes(bytes(json.loads(stripped)))
    return Keypair.from_base58_string(stripped)


def send_refund(buyer_pubkey_str, lamports, note="refund"):
    if not RECIPIENT_SECRET_KEY:
        raise RuntimeError(
            "RECIPIENT_SECRET_KEY is not set - this machine can't sign refunds. "
            "Set it in .env to enable automatic refunds."
        )
    if lamports <= 0:
        raise ValueError("refund lamports must be positive")

    payer = _load_keypair(RECIPIENT_SECRET_KEY)
    if str(payer.pubkey()) != RECIPIENT:
        raise RuntimeError(
            f"RECIPIENT_SECRET_KEY does not match RECIPIENT_PUBKEY: secret key is for "
            f"{payer.pubkey()}, but RECIPIENT_PUBKEY is {RECIPIENT}. Refunds must be paid "
            "out of the wallet that actually received the deposits - fix .env."
        )
    log.debug("refund: payer=%s buyer=%s lamports=%s", payer.pubkey(), buyer_pubkey_str, lamports)
    buyer = Pubkey.from_string(buyer_pubkey_str)
    blockhash = Hash.from_string(get_latest_blockhash())

    transfer_ix = transfer(TransferParams(from_pubkey=payer.pubkey(), to_pubkey=buyer, lamports=lamports))
    memo_ix = Instruction(MEMO_PROGRAM_ID, note.encode("utf-8"), [])

    tx = Transaction.new_signed_with_payer(
        [transfer_ix, memo_ix], payer.pubkey(), [payer], blockhash
    )

    tx_b64 = base64.b64encode(bytes(tx)).decode("utf-8")
    signature = send_transaction(tx_b64)
    log.debug("refund sent: %s", signature)
    return signature
