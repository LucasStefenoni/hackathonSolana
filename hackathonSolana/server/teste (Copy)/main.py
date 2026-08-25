import logging
import threading
import time
from urllib.parse import quote

import qrcode
from solders.keypair import Keypair

from config import LAMPORTS_PER_ML, PUBLIC_SERVER_URL
from sensors.flow_meter import FlowMeter
from hardware.valve import Valve
from payments.transaction_request_server import register_order, run_server_in_background, get_order_buyer
from payments.solana_rpc import find_payment_by_reference
from payments.refund import send_refund

log = logging.getLogger(__name__)


def build_solana_pay_url(reference_str):
    endpoint = f"{PUBLIC_SERVER_URL}?reference={reference_str}"
    return "solana:" + quote(endpoint, safe="")


def show_qr_in_terminal(data):
    qr = qrcode.QRCode(border=1)
    qr.add_data(data)
    qr.make()
    qr.print_ascii(invert=True)


def run_order(volume_ml, flow_meter, valve):
    # volume_ml is a cap: the buyer deposits enough for up to this much water,
    # but is only charged for what actually flows through the meter.
    deposit_lamports = int(volume_ml * LAMPORTS_PER_ML)
    reference_keypair = Keypair()
    reference_str = str(reference_keypair.pubkey())

    note = f"up to {volume_ml}ml agua filtrada"
    register_order(reference_str, deposit_lamports, note)
    log.debug("registered order reference=%s deposit_lamports=%s note=%r", reference_str, deposit_lamports, note)

    pay_url = build_solana_pay_url(reference_str)
    log.debug("solana pay url: %s", pay_url)
    print(f"\ndeposit for up to {volume_ml}ml -> {deposit_lamports} lamports ({deposit_lamports / 1_000_000_000:.6f} SOL)")
    print(f"reference: {reference_str}")
    print("scan to pay, or locally: python -m scripts.simulate_buyer " + reference_str)
    show_qr_in_terminal(pay_url)

    print("waiting for payment to confirm on-chain...")
    signature = None
    poll_count = 0
    while not signature:
        poll_count += 1
        try:
            signature = find_payment_by_reference(reference_str)
        except Exception:
            log.exception("error polling for payment (reference=%s, attempt=%d)", reference_str, poll_count)
            raise
        log.debug("poll #%d for reference=%s -> %s", poll_count, reference_str, signature or "not found yet")
        if not signature:
            if poll_count == 5 and "your-tunnel-url.example.com" in PUBLIC_SERVER_URL:
                log.warning(
                    "still waiting after %d polls and PUBLIC_SERVER_URL is still the placeholder - "
                    "the wallet has no real endpoint to reach. Set PUBLIC_SERVER_URL in .env.",
                    poll_count,
                )
            time.sleep(2)
    print(f"payment confirmed: {signature}")

    print("dispensing...")
    flow_meter.reset()
    valve.open()

    pour_thread = None
    stop_event = None
    if flow_meter.simulate:
        stop_event = threading.Event()
        pour_thread = threading.Thread(
            target=flow_meter.simulate_pour,
            kwargs={"ml_per_second": 20, "duration_seconds": max(volume_ml / 20, 0.5), "stop_event": stop_event},
            daemon=True,
        )
        pour_thread.start()

    last_ml, last_t = 0.0, time.monotonic()
    while True:
        current_ml = flow_meter.volume_ml()
        now = time.monotonic()
        dt = now - last_t
        if dt >= 0.2:
            rate_ml_s = (current_ml - last_ml) / dt if dt > 0 else 0.0
            cost_so_far = int(current_ml * LAMPORTS_PER_ML)
            print(f"\r{current_ml:.1f}ml poured  {rate_ml_s:.1f}ml/s  {cost_so_far}/{deposit_lamports} lamports", end="", flush=True)
            last_ml, last_t = current_ml, now
        # stop as soon as either the requested volume or the paid deposit is reached,
        # whichever comes first - protects against meter drift dispensing past what was paid
        if current_ml >= volume_ml or current_ml * LAMPORTS_PER_ML >= deposit_lamports:
            break
        time.sleep(0.05)
    print()

    if stop_event is not None:
        stop_event.set()
    if pour_thread is not None:
        pour_thread.join()

    valve.close()

    dispensed_ml = flow_meter.volume_ml()
    charged_lamports = min(int(dispensed_ml * LAMPORTS_PER_ML), deposit_lamports)
    refund_lamports = deposit_lamports - charged_lamports
    print(f"done - dispensed {dispensed_ml:.0f}ml, charged {charged_lamports} lamports, receipt tx: {signature}")

    if refund_lamports > 0:
        buyer = get_order_buyer(reference_str)
        print(f"under-delivered by {volume_ml - dispensed_ml:.1f}ml - refunding {refund_lamports} lamports to {buyer}")
        try:
            refund_signature = send_refund(buyer, refund_lamports, note=f"refund for order {reference_str}")
            print(f"refund sent: {refund_signature}")
        except Exception as exc:
            print(f"refund FAILED ({exc}) - {refund_lamports} lamports still owed to {buyer}")


if __name__ == "__main__":
    run_server_in_background()
    flow_meter = FlowMeter()
    valve = Valve()

    try:
        while True:
            raw = input("\nvolume to dispense in ml (or 'q' to quit): ")
            if raw.strip().lower() == "q":
                break
            run_order(int(raw), flow_meter, valve)
    finally:
        flow_meter.cleanup()
        valve.cleanup()
