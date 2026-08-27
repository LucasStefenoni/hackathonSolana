import logging
import os

from dotenv import load_dotenv

load_dotenv()

# on by default: this project talks to real wallets/RPC nodes over the network,
# where "it just doesn't work" is the common failure mode - verbose logs by
# default make that debuggable without having to first know to turn it on.
# set DEBUG=0 in .env to quiet it down.
DEBUG = os.environ.get("DEBUG", "1") not in ("0", "false", "False", "")

# the main terminal is used to show the Solana Pay QR code and read prompts -
# mixing verbose logs into it makes the QR unscannable. So logs go to a file by
# default; run `make logs` (tail -f) in a second terminal to watch them live.
# set LOG_TO_STDOUT=1 to get the old behaviour (logs back on the console).
LOG_FILE = os.environ.get("LOG_FILE", os.path.join(os.path.dirname(__file__), "server.log"))
LOG_TO_STDOUT = os.environ.get("LOG_TO_STDOUT", "0") not in ("0", "false", "False", "")

_formatter = logging.Formatter(
    fmt="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
_handlers = [logging.FileHandler(LOG_FILE)]
if LOG_TO_STDOUT:
    _handlers.append(logging.StreamHandler())
for _h in _handlers:
    _h.setFormatter(_formatter)

logging.basicConfig(
    level=logging.DEBUG if DEBUG else logging.INFO,
    handlers=_handlers,
)

# keep Flask's dev-server startup banner out of the QR-code terminal
try:
    import flask.cli

    flask.cli.show_server_banner = lambda *a, **k: None
except Exception:
    pass


def _require(name):
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"missing required env var {name} (see .env.example)")
    return value


def _int(name, default):
    return int(os.environ.get(name, str(default)))


RPC_URL = os.environ.get("RPC_URL", "https://api.devnet.solana.com")

RECIPIENT = _require("RECIPIENT_PUBKEY")

# base58-encoded OR solana-keygen JSON byte-array secret key for RECIPIENT -
# only needed to send refunds. leave unset if this machine should never be
# able to move funds out.
RECIPIENT_SECRET_KEY = os.environ.get("RECIPIENT_SECRET_KEY")

LAMPORTS_PER_ML = _int("LAMPORTS_PER_ML", 200)

LABEL = os.environ.get("LABEL", "GummyTap pay-as-you-consume")

# --- robustness knobs (see .env.example for what each one does) ---
# commitment used for all reads and for accepting a payment as final enough to pour
RPC_COMMITMENT = os.environ.get("RPC_COMMITMENT", "confirmed")
# HTTP-level retry budget for a single RPC call (transient network / 429 / 5xx)
RPC_MAX_RETRIES = _int("RPC_MAX_RETRIES", 4)
# give up waiting for the buyer to pay after this long, then free the kiosk
PAYMENT_TIMEOUT_S = _int("PAYMENT_TIMEOUT_S", 180)
# unpaid orders older than this are dropped from the in-memory store
ORDER_TTL_S = _int("ORDER_TTL_S", 600)
# worst-case flow rate we expect from the meter; sets the dispense safety deadline
MIN_FLOW_ML_S = float(os.environ.get("MIN_FLOW_ML_S", "5"))
# slack added on top of the computed dispense deadline
DISPENSE_GRACE_S = _int("DISPENSE_GRACE_S", 10)
# no pulse for this long mid-pour => treat as a stalled sensor / no water, cut off
STALL_S = float(os.environ.get("STALL_S", "4"))
# durable log of refunds we owe but haven't confirmed on-chain yet
REFUND_JOURNAL = os.environ.get("REFUND_JOURNAL", os.path.join(os.path.dirname(__file__), "refunds.jsonl"))

# the public URL wallets hit to fetch/build the payment transaction (Solana Pay
# transaction request spec) - must be reachable from the buyer's phone, e.g. an
# ngrok/cloudflared tunnel to this machine's Flask server on port 5000.
PUBLIC_SERVER_URL = os.environ.get("PUBLIC_SERVER_URL", "https://your-tunnel-url.example.com/pay")

if "your-tunnel-url.example.com" in PUBLIC_SERVER_URL:
    logging.getLogger(__name__).warning(
        "PUBLIC_SERVER_URL is still the placeholder (%s) - wallets scanning the QR "
        "code cannot reach this machine and every payment will fail. Set "
        "PUBLIC_SERVER_URL in .env to a real public tunnel URL (ngrok, cloudflared, etc).",
        PUBLIC_SERVER_URL,
    )
elif "localhost" in PUBLIC_SERVER_URL or "127.0.0.1" in PUBLIC_SERVER_URL:
    logging.getLogger(__name__).info(
        "PUBLIC_SERVER_URL is set to localhost (%s) - fine for scripts/simulate_buyer.py, "
        "but a real wallet app on a phone can never reach this. Swap in a real tunnel URL "
        "before testing with an actual wallet.",
        PUBLIC_SERVER_URL,
    )


def startup_checks():
    """Fail fast on misconfiguration that would otherwise only surface mid-order.

    Called once from main() before the kiosk loop starts. Config that can't be
    fixed at runtime raises; anything recoverable just logs a warning.
    """
    log = logging.getLogger("config")

    from solders.pubkey import Pubkey

    try:
        Pubkey.from_string(RECIPIENT)
    except Exception as exc:
        raise RuntimeError(f"RECIPIENT_PUBKEY is not a valid Solana address: {RECIPIENT!r} ({exc})")

    if RECIPIENT_SECRET_KEY:
        # validate the refund key loads AND matches the recipient now, not at the
        # first refund (when the buyer is already owed money and it's too late).
        from payments.refund import load_recipient_keypair

        payer = load_recipient_keypair()
        if str(payer.pubkey()) != RECIPIENT:
            raise RuntimeError(
                f"RECIPIENT_SECRET_KEY is for {payer.pubkey()} but RECIPIENT_PUBKEY is "
                f"{RECIPIENT} - refunds must be paid from the wallet that received the "
                "deposits. Fix .env."
            )
        log.info("refund signing enabled (payer %s)", payer.pubkey())
    else:
        log.warning(
            "RECIPIENT_SECRET_KEY not set - this machine cannot sign refunds. "
            "Under-delivered orders will be journalled to %s but not paid out.",
            REFUND_JOURNAL,
        )

    from payments.solana_rpc import RpcError, get_health

    try:
        get_health()
        log.info("RPC reachable at %s", RPC_URL)
    except RpcError as exc:
        log.warning("RPC health check failed for %s (%s) - continuing anyway", RPC_URL, exc)
