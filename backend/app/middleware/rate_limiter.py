"""
PromptCraft — Rate Limiter
===========================
Simple in-memory rate limiter for MVP.
Tracks usage per IP address per day.

To upgrade: swap _store for a Redis client.
  pip install redis
  r = redis.Redis(host="localhost", port=6379)
  r.incr(key) / r.expire(key, 86400)
"""

from datetime import datetime, date
from collections import defaultdict
from threading import Lock
from fastapi import Request, HTTPException
from app.config import settings


# ── In-memory store ───────────────────────────────────────────
# Structure: { "ip:YYYY-MM-DD:endpoint": count }
_store: dict[str, int] = defaultdict(int)
_lock  = Lock()


def _get_key(ip: str, endpoint: str) -> str:
    today = date.today().isoformat()
    return f"{ip}:{today}:{endpoint}"


def _get_ip(request: Request) -> str:
    # Respect X-Forwarded-For when behind a proxy (Render, Vercel, etc.)
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def check_rate_limit(request: Request, endpoint: str, is_pro: bool = False) -> None:
    """
    Call this at the start of each route handler.
    Raises HTTP 429 if the daily limit is exceeded.

    Args:
        request:  FastAPI Request object
        endpoint: "optimize" | "compare"
        is_pro:   True if user has a Pro subscription (Phase 2)
    """
    if endpoint == "optimize":
        limit = settings.PRO_OPTIMIZE_LIMIT if is_pro else settings.FREE_OPTIMIZE_LIMIT
    elif endpoint == "compare":
        limit = settings.PRO_COMPARE_LIMIT if is_pro else settings.FREE_COMPARE_LIMIT
    else:
        limit = 10  # Safe default

    ip  = _get_ip(request)
    key = _get_key(ip, endpoint)

    with _lock:
        current = _store[key]
        if current >= limit:
            raise HTTPException(
                status_code=429,
                detail={
                    "code":    "rate_limit_exceeded",
                    "message": f"Daily limit of {limit} {endpoint}s reached.",
                    "hint":    "Upgrade to Pro for unlimited access." if not is_pro else "Try again tomorrow.",
                }
            )
        _store[key] += 1


def get_usage(request: Request, endpoint: str) -> dict:
    """
    Returns the user's current usage count and daily limit.
    Used by the frontend to show usage bars.
    """
    ip    = _get_ip(request)
    key   = _get_key(ip, endpoint)
    limit = settings.FREE_OPTIMIZE_LIMIT if endpoint == "optimize" else settings.FREE_COMPARE_LIMIT

    with _lock:
        used = _store[key]

    return {
        "endpoint":   endpoint,
        "used":       used,
        "limit":      limit,
        "remaining":  max(0, limit - used),
        "resets":     "midnight UTC",
    }
