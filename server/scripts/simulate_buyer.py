"""
Stands in for a wallet app scanning the Solana Pay QR code, so the full
payment flow can be tested against localhost without a public tunnel URL.

Usage:
    python -m main                     # terminal 1: starts the machine, prints a reference
    python -m scripts.simulate_buyer <reference>   # terminal 2: "pays" for that order
"""
import base64
import json
import sys
import time

import requests
from solders.keypair import Keypair
from solders.hash import Hash
from solders.transaction import Transaction

from payments.solana_rpc import get_latest_blockhash, get_balance, request_airdrop, send_transaction

LOCAL_PAY_ENDPOINT = "http://localhost:5000/pay"
KEYPAIR_PATH = ".local_buyer_keypair.json"
MIN_BALANCE_LAMPORTS = 100_000_000  # 0.1 SOL
AIRDROP_LAMPORTS = 1_000_000_000  # 1 SOL


def load_or_create_buyer_keypair():
    try:
        with open(KEYPAIR_PATH) as f:
            return Keypair.from_bytes(bytes(json.load(f)))
    except FileNotFoundError:
        keypair = Keypair()
        with open(KEYPAIR_PATH, "w") as f:
            json.dump(list(bytes(keypair)), f)
        print(f"created new local buyer keypair at {KEYPAIR_PATH}: {keypair.pubkey()}")
        return keypair


def ensure_funded(pubkey_str):
    balance = get_balance(pubkey_str)
    print(f"buyer {pubkey_str} balance: {balance} lamports")
    if balance >= MIN_BALANCE_LAMPORTS:
        return

    # the devnet faucet is flaky/rate-limited - retry a few times before giving up
    for attempt in range(1, 4):
        print(f"requesting devnet airdrop of {AIRDROP_LAMPORTS} lamports (attempt {attempt}/3)...")
        try:
            request_airdrop(pubkey_str, AIRDROP_LAMPORTS)
        except (RuntimeError, requests.RequestException) as e:
            print(f"airdrop request failed: {e}")
            time.sleep(3 * attempt)
            continue

        for _ in range(15):
            time.sleep(1)
            if get_balance(pubkey_str) >= MIN_BALANCE_LAMPORTS:
                print(f"buyer funded: {get_balance(pubkey_str)} lamports")
                return
        print("airdrop accepted but balance hasn't landed yet, retrying...")

    raise RuntimeError(
        f"could not fund {pubkey_str} via devnet airdrop after 3 attempts - "
        "the faucet may be rate-limited for this IP. Fund it manually at "
        f"https://faucet.solana.com (paste the pubkey above), then rerun this script."
    )


def pay(reference_str):
    buyer = load_or_create_buyer_keypair()
    ensure_funded(str(buyer.pubkey()))

    response = requests.post(
        LOCAL_PAY_ENDPOINT,
        params={"reference": reference_str},
        json={"account": str(buyer.pubkey())},
        timeout=10,
    )
    response.raise_for_status()
    body = response.json()
    if "error" in body:
        raise RuntimeError(f"server rejected payment request: {body['error']}")

    tx = Transaction.from_bytes(base64.b64decode(body["transaction"]))
    blockhash = Hash.from_string(get_latest_blockhash())
    tx.sign([buyer], blockhash)

    signed_tx_b64 = base64.b64encode(bytes(tx)).decode("utf-8")
    signature = send_transaction(signed_tx_b64)
    print(f"payment sent: {signature}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("usage: python -m scripts.simulate_buyer <reference>")
        sys.exit(1)
    pay(sys.argv[1])
