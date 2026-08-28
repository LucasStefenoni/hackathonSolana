import os
import tempfile

# config.py reads the environment at import time and requires RECIPIENT_PUBKEY;
# give the test process sane values before anything imports it.
os.environ.setdefault("RECIPIENT_PUBKEY", "HiW7d22xFjZQDXETSQGEnwVgMdRQM4fydfWWqH1x13kg")
os.environ.setdefault("PUBLIC_SERVER_URL", "http://localhost:5000/pay")
os.environ.setdefault("LOG_FILE", os.path.join(tempfile.gettempdir(), "gummytap-test.log"))
