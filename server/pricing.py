"""SOL -> BRL conversion for the kiosk terminal.

Best-effort: every helper degrades to "no fiat shown" rather than blocking a
sale. Prices come from CoinGecko (configurable) and are cached in-process for
PRICE_CACHE_TTL_S; on a network failure a stale cached value is preferred over
nothing, and only a cold cache yields None.
"""

import logging
import time

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from config import PRICE_API_URL, PRICE_CACHE_TTL_S

log = logging.getLogger(__name__)

LAMPORTS_PER_SOL = 1_000_000_000


def _build_session():
    session = requests.Session()
    retry = Retry(
        total=2,
        connect=2,
        read=2,
        status=2,
        backoff_factor=0.5,
        status_forcelist=(408, 429, 500, 502, 503, 504),
        allowed_methods=frozenset(["GET"]),
        respect_retry_after_header=True,
        raise_on_status=False,
    )
    adapter = HTTPAdapter(max_retries=retry, pool_connections=2, pool_maxsize=2)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    return session


_session = _build_session()

# (monotonic timestamp, BRL per 1 SOL) - None until the first successful fetch
_cache = (0.0, None)


def lamports_to_sol(lamports):
    return lamports / LAMPORTS_PER_SOL


def get_sol_brl():
    """BRL price of 1 SOL, or None if it could never be fetched.

    Serves a cached value while it is younger than PRICE_CACHE_TTL_S, and falls
    back to a stale cached value if a refresh fails. Never raises.
    """
    global _cache
    ts, value = _cache
    if value is not None and time.monotonic() - ts < PRICE_CACHE_TTL_S:
        return value

    try:
        resp = _session.get(PRICE_API_URL, timeout=(5, 15))
        resp.raise_for_status()
        rate = float(resp.json()["solana"]["brl"])
        if rate <= 0:
            raise ValueError(f"non-positive rate {rate}")
    except (requests.RequestException, ValueError, KeyError, TypeError) as exc:
        if value is not None:
            log.warning("SOL/BRL refresh failed (%s) - using cached rate %.2f", exc, value)
            return value
        log.warning("SOL/BRL price unavailable (%s) - amounts will show SOL only", exc)
        return None

    _cache = (time.monotonic(), rate)
    log.debug("SOL/BRL rate refreshed: %.2f", rate)
    return rate


def format_brl(lamports, rate):
    """`" (~R$ 1,23)"` for a lamport amount, or `""` when no rate is available."""
    if rate is None:
        return ""
    brl = lamports_to_sol(lamports) * rate
    return f" (~R$ {brl:,.2f})".replace(",", "X").replace(".", ",").replace("X", ".")
