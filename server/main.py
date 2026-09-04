import atexit
import logging
import select
import signal
import sys
import termios
import threading
import time
import tty
from contextlib import contextmanager
from urllib.parse import quote

import qrcode
from solders.keypair import Keypair

from config import (
    DISPENSE_GRACE_S,
    LAMPORTS_PER_ML,
    MIN_FLOW_ML_S,
    ORDER_TTL_S,
    PAYMENT_TIMEOUT_S,
    PUBLIC_SERVER_URL,
    RECIPIENT,
    STALL_S,
    startup_checks,
)
from hardware.valve import Valve
from orders import store
from payments import refund_journal
from payments.refund import send_refund
from payments.solana_rpc import PaymentInvalid, RpcError, RpcTransientError, verify_payment
from payments.transaction_request_server import get_order_buyer, run_server_in_background
from pricing import format_brl, get_sol_brl, lamports_to_sol
from sensors.flow_meter import FlowMeter

log = logging.getLogger(__name__)

# set by the signal handler; every wait loop checks it so shutdown is prompt
_shutdown = threading.Event()

# width of the visual fill bar drawn during a pour
BAR_WIDTH = 24


@contextmanager
def _raw_stdin():
    """
    Put stdin in cbreak mode so a single keypress is readable without Enter.
    """
    if not sys.stdin.isatty():
        yield lambda: False
        return
    fd = sys.stdin.fileno()
    old = termios.tcgetattr(fd)
    tty.setcbreak(fd)

    def pressed_space():
        hit = False
        while select.select([sys.stdin], [], [], 0)[0]:
            if sys.stdin.read(1) == " ":
                hit = True
        return hit

    try:
        yield pressed_space
    finally:
        termios.tcsetattr(fd, termios.TCSADRAIN, old)


def build_solana_pay_url(reference_str):
    endpoint = f"{PUBLIC_SERVER_URL}?reference={reference_str}"
    return "solana:" + quote(endpoint, safe="")


def show_qr_in_terminal(data):
    qr = qrcode.QRCode(border=1)
    qr.add_data(data)
    qr.make()
    qr.print_ascii(invert=True)


def await_payment(order):
    """Poll the chain until a valid payment lands. Returns a PaymentVerification,
    or None if the order should be abandoned (timeout, invalid payment, fatal
    RPC error, or shutdown)."""
    deadline = time.monotonic() + PAYMENT_TIMEOUT_S
    delay = 1.0
    while not _shutdown.is_set():
        if time.monotonic() > deadline:
            store.expire(order.reference)
            print(f"\npayment timed out after {PAYMENT_TIMEOUT_S}s - order cancelled, kiosk free")
            return None
        try:
            verification = verify_payment(order.reference, RECIPIENT, order.deposit_lamports)
        except PaymentInvalid as exc:
            store.fail(order.reference, str(exc))
            print(f"\npayment rejected: {exc}")
            return None
        except RpcTransientError as exc:
            log.warning("payment poll hit a transient RPC error, will retry: %s", exc)
            verification = None
        except RpcError as exc:
            store.fail(order.reference, f"rpc error: {exc}")
            print(f"\nRPC error while verifying payment: {exc}")
            return None
        if verification is not None:
            print(f"\npayment confirmed: {verification.signature}")
            return verification
        _shutdown.wait(delay)
        delay = min(delay * 1.5, 3.0)
    return None


def dispense(order, flow_meter, valve, rate=None):
    """Open the valve and meter the pour. Guarantees the valve is closed on exit
    (context manager) and cannot run past a wall-clock safety deadline. Returns
    the volume actually dispensed in ml. `rate` is the SOL/BRL price (or None)
    used only to annotate the live cost line."""
    volume_ml = order.requested_ml
    deposit_lamports = order.deposit_lamports
    flow_meter.reset()
    deadline = time.monotonic() + volume_ml / MIN_FLOW_ML_S + DISPENSE_GRACE_S

    print("dispensing...  [espaço] = parar e reembolsar o restante")
    stop_event = None
    pour_thread = None
    reason = "target reached"
    with valve.dispensing(), _raw_stdin() as pressed_space:
        if flow_meter.simulate:
            stop_event = threading.Event()
            pour_thread = threading.Thread(
                target=flow_meter.simulate_pour,
                kwargs={
                    "ml_per_second": 20,
                    "duration_seconds": max(volume_ml / 20, 0.5),
                    "stop_event": stop_event,
                },
                daemon=True,
            )
            pour_thread.start()

        last_ml, last_t = 0.0, time.monotonic()
        while True:
            current_ml = flow_meter.volume_ml()
            now = time.monotonic()
            dt = now - last_t
            if dt >= 0.2:
                rate_mls = (current_ml - last_ml) / dt if dt > 0 else 0.0
                cost = int(current_ml * LAMPORTS_PER_ML)
                frac = min(current_ml / volume_ml, 1.0) if volume_ml else 0.0
                filled = int(frac * BAR_WIDTH)
                bar = "█" * filled + "░" * (BAR_WIDTH - filled)
                print(
                    f"\r[{bar}] {frac * 100:3.0f}%  {current_ml:6.1f}/{volume_ml}ml  "
                    f"{rate_mls:4.1f}ml/s  {cost}/{deposit_lamports} lamports{format_brl(cost, rate)}",
                    end="",
                    flush=True,
                )
                last_ml, last_t = current_ml, now

            # stop on whichever comes first: requested volume, the paid deposit
            # (guards against meter drift dispensing past what was paid), a
            # stalled sensor, or the hard safety deadline.
            if current_ml >= volume_ml or current_ml * LAMPORTS_PER_ML >= deposit_lamports:
                reason = "target/deposit reached"
                break
            if now > deadline:
                reason = "SAFETY TIMEOUT (sensor stall or no water)"
                log.error("dispense wall-clock timeout at %.1fml of %s requested", current_ml, volume_ml)
                break
            if current_ml > 0 and flow_meter.stalled_for(STALL_S):
                reason = "flow stalled"
                log.warning("dispense stalled at %.1fml (no pulses for %ss)", current_ml, STALL_S)
                break
            if pressed_space():
                reason = "parado pelo operador (barra de espaço)"
                log.info("dispense stopped by operator at %.1fml of %s", current_ml, volume_ml)
                break
            if _shutdown.is_set():
                reason = "shutdown"
                break
            time.sleep(0.05)
        print()

        if stop_event is not None:
            stop_event.set()
        if pour_thread is not None:
            pour_thread.join(timeout=2)

    dispensed_ml = flow_meter.volume_ml()
    log.info("dispense finished (%s): %.1fml", reason, dispensed_ml)
    return dispensed_ml


def settle(order, dispensed_ml, rate=None):
    reference = order.reference
    deposit = order.deposit_lamports
    store.mark_settling(reference, dispensed_ml)

    charged = min(int(dispensed_ml * LAMPORTS_PER_ML), deposit)
    refund_lamports = deposit - charged
    print(
        f"done - dispensed {dispensed_ml:.0f}ml, charged {charged} lamports"
        f"{format_brl(charged, rate)}, receipt {order.paid_signature}"
    )

    if refund_lamports <= 0:
        store.mark_settled(reference, charged, 0, None)
        return

    buyer = get_order_buyer(reference)
    print(
        f"under-delivered by {order.requested_ml - dispensed_ml:.1f}ml - "
        f"refunding {refund_lamports} lamports{format_brl(refund_lamports, rate)} to {buyer}"
    )
    # journal BEFORE attempting the transfer so the obligation survives a crash
    refund_journal.record_owed(reference, buyer, refund_lamports, f"under-delivered order {reference}")
    if not buyer:
        store.mark_settled(reference, charged, refund_lamports, None)  # -> REFUND_OWED
        log.error("refund for order %s owed but buyer unknown - journalled, needs manual payout", reference[:8])
        print(f"refund OWED ({refund_lamports} lamports) - buyer address unknown, journalled for manual review")
        return
    try:
        sig = send_refund(buyer, refund_lamports, note=f"refund for order {reference}")
    except Exception as exc:
        store.mark_settled(reference, charged, refund_lamports, None)  # -> REFUND_OWED
        log.error("refund failed for order %s: %s", reference[:8], exc)
        print(f"refund FAILED ({exc}) - {refund_lamports} lamports journalled, will retry automatically")
        return
    refund_journal.mark_settled(reference, sig)
    store.mark_settled(reference, charged, refund_lamports, sig)
    print(f"refund sent{format_brl(refund_lamports, rate)}: {sig}")


def run_order(volume_ml, flow_meter, valve):
    deposit_lamports = int(volume_ml * LAMPORTS_PER_ML)
    reference_str = str(Keypair().pubkey())
    note = f"up to {volume_ml}ml agua filtrada"
    order = store.create(reference_str, deposit_lamports, note, requested_ml=volume_ml)

    rate = get_sol_brl()
    pay_url = build_solana_pay_url(reference_str)
    log.debug("order %s deposit=%s url=%s", reference_str, deposit_lamports, pay_url)
    print(
        f"\ndeposit for up to {volume_ml}ml -> {deposit_lamports} lamports "
        f"({lamports_to_sol(deposit_lamports):.6f} SOL{format_brl(deposit_lamports, rate)})"
    )
    print(f"reference: {reference_str}")
    print("scan to pay, or locally: make simulate REF=" + reference_str)
    show_qr_in_terminal(pay_url)
    print("waiting for payment to confirm on-chain...")

    verification = await_payment(order)
    if verification is None:
        return
    store.mark_paid(reference_str, verification)

    store.mark_dispensing(reference_str)
    dispensed_ml = dispense(order, flow_meter, valve, rate)

    settle(order, dispensed_ml, rate)


def _retry_refunds():
    try:
        refund_journal.retry_pending(send_refund)
    except Exception:
        log.exception("error retrying pending refunds")


def main():
    startup_checks()

    flow_meter = FlowMeter()
    valve = Valve()

    atexit.register(valve.close)

    def _handle_signal(signum, _frame):
        log.info("signal %s received - shutting down", signum)
        _shutdown.set()
        valve.close()
        raise KeyboardInterrupt

    signal.signal(signal.SIGINT, _handle_signal)
    signal.signal(signal.SIGTERM, _handle_signal)

    server_thread = run_server_in_background()

    # settle anything a previous run left owed before serving new customers
    _retry_refunds()

    try:
        while not _shutdown.is_set():
            if not server_thread.is_alive():
                log.error("payment server thread died - restarting it")
                server_thread = run_server_in_background()

            store.expire_stale(ORDER_TTL_S)
            store.purge_terminal()

            try:
                raw = input("\nvolume to dispense in ml (or 'q' to quit): ")
            except EOFError:
                break
            if raw.strip().lower() == "q":
                break
            try:
                volume_ml = int(raw)
            except ValueError:
                print("enter a whole number of ml, or 'q'")
                continue
            if volume_ml <= 0:
                print("volume must be positive")
                continue

            try:
                run_order(volume_ml, flow_meter, valve)
            except KeyboardInterrupt:
                raise
            except Exception:
                log.exception("order failed")
                print("order failed - see logs; kiosk still running")
            finally:
                valve.close()  # belt and braces - dispense() already guarantees this

            _retry_refunds()
    except KeyboardInterrupt:
        pass
    finally:
        _shutdown.set()
        flow_meter.cleanup()
        valve.cleanup()
        print("\nshut down cleanly")


if __name__ == "__main__":
    main()
