import logging
import os

from dotenv import load_dotenv

load_dotenv()

# on by default: this project talks to real wallets/RPC nodes over the network,
# where "it just doesn't work" is the common failure mode - verbose logs by
# default make that debuggable without having to first know to turn it on.
# set DEBUG=0 in .env to quiet it down.
DEBUG = os.environ.get("DEBUG", "1") not in ("0", "false", "False", "")

logging.basicConfig(
    level=logging.DEBUG if DEBUG else logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)


def _require(name):
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"missing required env var {name} (see .env.example)")
    return value


RPC_URL = os.environ.get("RPC_URL", "https://api.devnet.solana.com")

RECIPIENT = _require("RECIPIENT_PUBKEY")

# base58-encoded OR solana-keygen JSON byte-array secret key for RECIPIENT -
# only needed to send refunds. leave unset if this machine should never be
# able to move funds out.
RECIPIENT_SECRET_KEY = os.environ.get("RECIPIENT_SECRET_KEY")

LAMPORTS_PER_ML = int(os.environ.get("LAMPORTS_PER_ML", "200"))

LABEL = os.environ.get("LABEL", "Bebedouro pay-as-you-consume")

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
