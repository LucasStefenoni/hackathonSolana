import base64
import logging
import threading

from flask import Flask, jsonify, request
from solders.hash import Hash
from solders.instruction import AccountMeta, Instruction
from solders.message import Message
from solders.pubkey import Pubkey
from solders.system_program import TransferParams, transfer
from solders.transaction import Transaction

from config import DEBUG, LABEL, RECIPIENT
from orders import OrderState, store
from payments.solana_rpc import RpcError, get_latest_blockhash

MEMO_PROGRAM_ID = Pubkey.from_string("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr")

log = logging.getLogger(__name__)

app = Flask(__name__)


# kept as thin wrappers so main.py's imports don't change
def register_order(reference_str, lamports, note):
    store.create(reference_str, lamports, note)


def get_order_buyer(reference_str):
    order = store.get(reference_str)
    return order.buyer if order else None


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


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/pay", methods=["GET"])
def pay_info():
    # shown by the wallet app before the user approves anything
    log.debug("GET /pay reference=%s from %s", request.args.get("reference"), request.remote_addr)
    return jsonify({"label": LABEL, "icon": "https://your-server.com/icon.png"})


@app.route("/pay", methods=["POST"])
def pay_build_transaction():
    reference_str = request.args.get("reference")
    log.debug("POST /pay reference=%s from %s", reference_str, request.remote_addr)

    order = store.get(reference_str)
    if order is None:
        log.warning("POST /pay unknown reference=%s", reference_str)
        return jsonify({"error": "unknown or expired order"}), 404
    if order.state != OrderState.AWAITING_PAYMENT:
        log.warning(
            "POST /pay reference=%s in state %s, not accepting payment", reference_str, order.state.value
        )
        return jsonify({"error": f"order is {order.state.value}"}), 409

    body = request.get_json(force=True, silent=True) or {}
    buyer_pubkey_str = body.get("account")
    if not buyer_pubkey_str:
        return jsonify({"error": "missing buyer account"}), 400
    try:
        Pubkey.from_string(buyer_pubkey_str)
    except Exception:
        return jsonify({"error": "invalid buyer account"}), 400

    store.set_buyer(reference_str, buyer_pubkey_str)

    try:
        tx_b64 = build_payment_transaction(
            buyer_pubkey_str=buyer_pubkey_str,
            lamports=order.deposit_lamports,
            note=order.note,
            reference_str=reference_str,
        )
    except RpcError as exc:
        log.warning("POST /pay reference=%s: RPC unavailable building tx: %s", reference_str, exc)
        return jsonify({"error": "rpc temporarily unavailable, retry"}), 503
    except Exception:
        log.exception("failed to build payment transaction for reference=%s", reference_str)
        return jsonify({"error": "internal error"}), 500

    log.debug(
        "built transaction for reference=%s buyer=%s lamports=%s",
        reference_str,
        buyer_pubkey_str,
        order.deposit_lamports,
    )
    return jsonify({"transaction": tx_b64, "message": order.note})


def run_server_in_background(host="0.0.0.0", port=5000):
    log.info("starting payment server on %s:%s (debug=%s)", host, port, DEBUG)
    thread = threading.Thread(
        target=lambda: app.run(host=host, port=port, debug=DEBUG, use_reloader=False, threaded=True),
        daemon=True,
        name="payment-server",
    )
    thread.start()
    return thread
