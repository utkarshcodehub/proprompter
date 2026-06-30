"""
PromptCraft — FastAPI Backend
==============================
Entry point. Wires together routes, middleware, and startup config.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.routers import optimize, health
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print(f"PromptCraft API starting — env: {settings.ENV}")
    yield
    # Shutdown (add DB cleanup here later if needed)
    print("PromptCraft API shutting down")


app = FastAPI(
    title="PromptCraft API",
    description="Transform vague inputs into lean or structured AI prompts.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.ENV != "production" else None,  # Hide docs in prod
    redoc_url=None,
)

# ── CORS ──────────────────────────────────────────────────────
# In production, replace "*" with your actual frontend domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ── ROUTERS ───────────────────────────────────────────────────
app.include_router(health.router)
app.include_router(optimize.router, prefix="/api/v1")
