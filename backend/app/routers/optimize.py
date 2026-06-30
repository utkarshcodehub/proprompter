"""
PromptCraft — Optimize Router
==============================
Handles:
  POST /api/v1/optimize  — single mode optimization
  POST /api/v1/compare   — side-by-side lean vs structured
  GET  /api/v1/usage     — remaining quota for the session
"""

import logging
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse

from app.schemas import (
    OptimizeRequest,
    CompareRequest,
    OptimizeResult,
    CompareResult,
)
from app.services.groq_service import run_optimize, run_compare
from app.middleware.rate_limiter import check_rate_limit, get_usage

logger = APIRouter()
router = APIRouter(tags=["Optimization"])


# ── POST /optimize ────────────────────────────────────────────

@router.post(
    "/optimize",
    response_model=OptimizeResult,
    summary="Optimize a prompt",
    description="""
Transform a vague or bloated input into a lean or structured prompt.

- **lean** mode: strips redundancy, adds only what's missing. Token-efficient.
- **structured** mode: applies the full model-specific framework. Production-ready.

Free tier: 10 optimizations per day.
""",
    responses={
        200: {"description": "Optimization successful"},
        400: {"description": "Input validation failed"},
        429: {"description": "Daily rate limit exceeded"},
        502: {"description": "Groq API error"},
    }
)
async def optimize(request: Request, body: OptimizeRequest) -> OptimizeResult:
    # ── Rate limit check ─────────────────────────────────────
    check_rate_limit(request, endpoint="optimize", is_pro=False)
    # Phase 2: replace `is_pro=False` with `is_pro=await get_user_tier(request)`

    # ── Call engine ──────────────────────────────────────────
    try:
        result = await run_optimize(
            raw_input=body.input,
            mode=body.mode.value,
            model=body.model.value,
        )
        return result

    except RuntimeError as e:
        error_map = {
            "rate_limit":       (429, "Groq rate limit hit. Try again in a few seconds."),
            "connection_error": (502, "Could not reach Groq API. Check your connection."),
            "api_error":        (502, "Groq API returned an error."),
        }
        status, message = error_map.get(str(e), (500, "Unexpected error."))
        raise HTTPException(status_code=status, detail={"code": str(e), "message": message})

    except ValueError as e:
        raise HTTPException(
            status_code=502,
            detail={"code": "malformed_response", "message": "Engine returned invalid JSON.", "hint": str(e)}
        )

    except Exception as e:
        logger.error(f"Unexpected error in /optimize: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail={"code": "internal_error", "message": "Something went wrong."})


# ── POST /compare ─────────────────────────────────────────────

@router.post(
    "/compare",
    response_model=CompareResult,
    summary="Compare both modes side by side",
    description="""
Runs both lean and structured optimization on the same input and returns
both results plus a recommendation.

**Costs 2 API calls.** Free tier: 3 compares per day.
Gate behind auth in Phase 2.
""",
    responses={
        200: {"description": "Comparison successful"},
        429: {"description": "Daily compare limit exceeded"},
        502: {"description": "Groq API error"},
    }
)
async def compare(request: Request, body: CompareRequest) -> CompareResult:
    # ── Rate limit (stricter — costs 2 calls) ────────────────
    check_rate_limit(request, endpoint="compare", is_pro=False)

    try:
        result = await run_compare(
            raw_input=body.input,
            model=body.model.value,
        )
        return result

    except RuntimeError as e:
        error_map = {
            "rate_limit":       (429, "Groq rate limit hit. Try again shortly."),
            "connection_error": (502, "Could not reach Groq API."),
            "api_error":        (502, "Groq API returned an error."),
        }
        status, message = error_map.get(str(e), (500, "Unexpected error."))
        raise HTTPException(status_code=status, detail={"code": str(e), "message": message})

    except Exception as e:
        logger.error(f"Unexpected error in /compare: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail={"code": "internal_error", "message": "Something went wrong."})


# ── GET /usage ────────────────────────────────────────────────

@router.get(
    "/usage",
    summary="Get remaining daily quota",
    description="Returns how many optimizations and compares the user has left today."
)
async def usage(request: Request) -> dict:
    return {
        "optimize": get_usage(request, "optimize"),
        "compare":  get_usage(request, "compare"),
    }
