import os
import tempfile

# config.py reads the environment at import time and requires RECIPIENT_PUBKEY;
# give the test process sane values before anything imports it.
os.environ.setdefault("RECIPIENT_PUBKEY", "BsoAownwuf8JJbtzB9Rr1YL1Y19K9ko6kPRPYMzt7f2e")
os.environ.setdefault("PUBLIC_SERVER_URL", "http://localhost:5000/pay")
os.environ.setdefault("LOG_FILE", os.path.join(tempfile.gettempdir(), "gummytap-test.log"))
