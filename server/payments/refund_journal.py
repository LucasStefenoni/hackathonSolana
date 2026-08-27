import json
import logging
import os
import threading
import time

import config

log = logging.getLogger(__name__)

_lock = threading.Lock()


def _path():
    return config.REFUND_JOURNAL


def _append(record):
    record["ts"] = time.time()
    line = json.dumps(record, separators=(",", ":"))
    with _lock, open(_path(), "a") as f:
        f.write(line + "\n")
        f.flush()
        os.fsync(f.fileno())


def record_owed(reference, buyer, lamports, reason):
    _append({"kind": "owed", "reference": reference, "buyer": buyer, "lamports": lamports, "reason": reason})


def mark_settled(reference, signature):
    _append({"kind": "settled", "reference": reference, "signature": signature})


def pending():
    """Return {reference: owed_record} for refunds owed but not yet settled."""
    if not os.path.exists(_path()):
        return {}
    owed, settled = {}, set()
    with _lock, open(_path()) as f:
        for raw in f:
            raw = raw.strip()
            if not raw:
                continue
            try:
                rec = json.loads(raw)
            except ValueError:
                log.warning("skipping corrupt line in %s: %r", _path(), raw)
                continue
            if rec.get("kind") == "owed":
                owed[rec["reference"]] = rec
            elif rec.get("kind") == "settled":
                settled.add(rec["reference"])
    return {ref: rec for ref, rec in owed.items() if ref not in settled}


def retry_pending(send_fn):
    """Attempt every outstanding refund. send_fn(buyer, lamports, note) -> signature."""
    outstanding = pending()
    if not outstanding:
        return
    log.info("retrying %d pending refund(s) from journal", len(outstanding))
    for ref, rec in outstanding.items():
        try:
            sig = send_fn(rec["buyer"], rec["lamports"], note=f"refund for order {ref}")
        except Exception as exc:
            log.error("pending refund for order %s still failing: %s", ref[:8], exc)
            continue
        mark_settled(ref, sig)
        log.info("settled pending refund for order %s: %s", ref[:8], sig)
