import base64
import logging
import threading
from flask import Flask, request, jsonify

from solders.pubkey import Pubkey
from solders.system_program import transfer, TransferParams
from solders.instruction import AccountMeta, Instruction
from solders.message import Message
from solders.transaction import Transaction
from solders.hash import Hash

from config import RECIPIENT, LABEL, DEBUG
from payments.solana_rpc import get_latest_blockhash

MEMO_PROGRAM_ID = Pubkey.from_string("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr")

log = logging.getLogger(__name__)

app = Flask(__name__)

PENDING_ORDERS = {}


def register_order(reference_str, lamports, note):
    PENDING_ORDERS[reference_str] = {"lamports": lamports, "note": note, "buyer": None}


def get_order_buyer(reference_str):
    order = PENDING_ORDERS.get(reference_str)
    return order["buyer"] if order else None


def build_payment_transaction(buyer_pubkey_str, lamports, note, reference_str):
    buyer = Pubkey.from_string(buyer_pubkey_str)
    recipient = Pubkey.from_string(RECIPIENT)
    reference = Pubkey.from_string(reference_str)
    blockhash = Hash.from_string(get_latest_blockhash())

    base_transfer = transfer(TransferParams(from_pubkey=buyer, to_pubkey=recipient, lamports=lamports))

    accounts_with_reference = list(base_transfer.accounts) + [
        AccountMeta(pubkey=reference, is_signer=False, is_writable=False)
    ]
    transfer_ix = Instruction(base_transfer.program_id, base_transfer.data, accounts_with_reference)

    memo_ix = Instruction(MEMO_PROGRAM_ID, note.encode("utf-8"), [])

    message = Message.new_with_blockhash([transfer_ix, memo_ix], buyer, blockhash)
    unsigned_tx = Transaction.new_unsigned(message)
    return base64.b64encode(bytes(unsigned_tx)).decode("utf-8")


@app.route("/pay", methods=["GET"])
def pay_info():
    # shown by the wallet app before the user approves anything
    log.debug("GET /pay reference=%s from %s", request.args.get("reference"), request.remote_addr)
    return jsonify({"label": LABEL, "icon": "https://your-server.com/icon.png"})


@app.route("/pay", methods=["POST"])
def pay_build_transaction():
    reference_str = request.args.get("reference")
    log.debug("POST /pay reference=%s from %s body=%s", reference_str, request.remote_addr, request.get_data(as_text=True))

    order = PENDING_ORDERS.get(reference_str)
    if order is None:
        log.warning("POST /pay unknown or expired reference=%s (known refs: %s)", reference_str, list(PENDING_ORDERS.keys()))
        return jsonify({"error": "unknown or expired order"}), 404

    body = request.get_json(force=True)
    buyer_pubkey_str = body.get("account")
    if not buyer_pubkey_str:
        log.warning("POST /pay missing buyer account, body=%s", body)
        return jsonify({"error": "missing buyer account"}), 400

    order["buyer"] = buyer_pubkey_str

    try:
        tx_b64 = build_payment_transaction(
            buyer_pubkey_str=buyer_pubkey_str,
            lamports=order["lamports"],
            note=order["note"],
            reference_str=reference_str,
        )
    except Exception:
        log.exception("failed to build payment transaction for reference=%s", reference_str)
        raise
    log.debug("built transaction for reference=%s buyer=%s lamports=%s", reference_str, buyer_pubkey_str, order["lamports"])
    return jsonify({"transaction": tx_b64, "message": order["note"]})


def run_server_in_background(host="0.0.0.0", port=5000):
    log.info("starting payment server on %s:%s (debug=%s)", host, port, DEBUG)
    thread = threading.Thread(
        target=lambda: app.run(host=host, port=port, debug=DEBUG, use_reloader=False),
        daemon=True,
    )
    thread.start()
    return thread
