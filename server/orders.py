"""In-memory order store with an explicit state machine.

One dispenser serves one buyer at a time, but the payment endpoint (Flask
thread) and the kiosk loop (main thread) both touch order state, so every
access goes through a single lock. Orders are created in AWAITING_PAYMENT and
walk forward through the states below; terminal orders are kept briefly for
inspection then purged so the dict can't grow without bound on a long run.
"""

import logging
import threading
import time
from dataclasses import dataclass, field
from enum import Enum

log = logging.getLogger(__name__)


class OrderState(str, Enum):
    AWAITING_PAYMENT = "awaiting_payment"
    PAID = "paid"
    DISPENSING = "dispensing"
    SETTLING = "settling"
    COMPLETED = "completed"  # fully delivered, nothing owed
    REFUND_OWED = "refund_owed"  # settled but the refund transfer is still pending
    EXPIRED = "expired"  # buyer never paid in time
    FAILED = "failed"  # invalid payment / aborted


TERMINAL_STATES = {
    OrderState.COMPLETED,
    OrderState.REFUND_OWED,
    OrderState.EXPIRED,
    OrderState.FAILED,
}

_ALLOWED = {
    OrderState.AWAITING_PAYMENT: {OrderState.PAID, OrderState.EXPIRED, OrderState.FAILED},
    OrderState.PAID: {OrderState.DISPENSING, OrderState.FAILED},
    OrderState.DISPENSING: {OrderState.SETTLING, OrderState.FAILED},
    OrderState.SETTLING: {OrderState.COMPLETED, OrderState.REFUND_OWED, OrderState.FAILED},
}


@dataclass
class Order:
    reference: str
    deposit_lamports: int
    note: str
    requested_ml: float = 0.0
    created_at: float = field(default_factory=time.monotonic)
    state: OrderState = OrderState.AWAITING_PAYMENT
    buyer: str | None = None
    paid_signature: str | None = None
    paid_amount: int | None = None
    dispensed_ml: float | None = None
    charged_lamports: int | None = None
    refund_lamports: int | None = None
    refund_signature: str | None = None
    settled_at: float | None = None


class OrderStore:
    def __init__(self):
        self._lock = threading.Lock()
        self._orders: dict[str, Order] = {}

    def create(self, reference, deposit_lamports, note, requested_ml=0.0):
        order = Order(
            reference=reference, deposit_lamports=deposit_lamports, note=note, requested_ml=requested_ml
        )
        with self._lock:
            self._orders[reference] = order
        return order

    def get(self, reference):
        with self._lock:
            return self._orders.get(reference)

    def _transition(self, reference, new_state, **fields):
        with self._lock:
            order = self._orders.get(reference)
            if order is None:
                raise KeyError(f"unknown order {reference}")
            if new_state not in _ALLOWED.get(order.state, set()):
                raise ValueError(
                    f"illegal order transition {order.state.value} -> {new_state.value} for {reference}"
                )
            order.state = new_state
            for k, v in fields.items():
                setattr(order, k, v)
            log.info("order %s -> %s", reference[:8], new_state.value)
            return order

    def set_buyer(self, reference, buyer):
        with self._lock:
            order = self._orders.get(reference)
            if order is None:
                raise KeyError(f"unknown order {reference}")
            order.buyer = buyer

    def mark_paid(self, reference, verification):
        fields = dict(
            paid_signature=verification.signature,
            paid_amount=verification.amount_lamports,
        )
        # fall back to the on-chain fee payer if /pay never recorded a buyer,
        # but don't clobber a value that route already set
        buyer = getattr(verification, "buyer", None)
        if buyer and self._orders.get(reference) and self._orders[reference].buyer is None:
            fields["buyer"] = buyer
        return self._transition(reference, OrderState.PAID, **fields)

    def mark_dispensing(self, reference):
        return self._transition(reference, OrderState.DISPENSING)

    def mark_settling(self, reference, dispensed_ml):
        return self._transition(reference, OrderState.SETTLING, dispensed_ml=dispensed_ml)

    def mark_settled(self, reference, charged_lamports, refund_lamports, refund_signature):
        state = OrderState.COMPLETED if refund_signature or not refund_lamports else OrderState.REFUND_OWED
        return self._transition(
            reference,
            state,
            charged_lamports=charged_lamports,
            refund_lamports=refund_lamports,
            refund_signature=refund_signature,
            settled_at=time.monotonic(),
        )

    def expire(self, reference):
        return self._transition(reference, OrderState.EXPIRED)

    def fail(self, reference, reason=None):
        if reason:
            log.warning("order %s failed: %s", reference[:8], reason)
        return self._transition(reference, OrderState.FAILED)

    def expire_stale(self, ttl_s):
        """Move orders still awaiting payment past their TTL to EXPIRED."""
        now = time.monotonic()
        with self._lock:
            stale = [
                o.reference
                for o in self._orders.values()
                if o.state == OrderState.AWAITING_PAYMENT and now - o.created_at > ttl_s
            ]
            for ref in stale:
                self._orders[ref].state = OrderState.EXPIRED
        for ref in stale:
            log.info("order %s expired (unpaid > %ds)", ref[:8], ttl_s)
        return stale

    def purge_terminal(self, max_age_s=300):
        """Drop terminal orders older than max_age_s so the dict stays bounded.

        REFUND_OWED is never purged - it's the only in-memory pointer to money
        still owed, and it stays until settlement flips it to COMPLETED.
        """
        now = time.monotonic()
        with self._lock:
            drop = [
                ref
                for ref, o in self._orders.items()
                if o.state in TERMINAL_STATES
                and o.state != OrderState.REFUND_OWED
                and now - (o.settled_at or o.created_at) > max_age_s
            ]
            for ref in drop:
                del self._orders[ref]
        return drop


# shared instance - imported by both main.py and the payment endpoint
store = OrderStore()
