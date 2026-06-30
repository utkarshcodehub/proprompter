"""
PromptCraft — Config
=====================
All environment variables in one place.
Copy .env.example → .env and fill in values before running.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    # ── Core ─────────────────────────────────────────────────
    ENV: str = "development"            # development | production
    SECRET_KEY: str = "change-me"       # Used to sign rate-limit tokens

    # ── Groq ─────────────────────────────────────────────────
    GROQ_API_KEY: str                   # Required — no default
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    GROQ_TEMPERATURE: float = 0.2
    GROQ_MAX_TOKENS: int = 1000

    # ── Rate limiting ────────────────────────────────────────
    # Free tier: 10 optimizations/day | Compare: 3/day
    FREE_OPTIMIZE_LIMIT: int = 10
    FREE_COMPARE_LIMIT: int = 3
    # Pro tier: unlimited (set very high)
    PRO_OPTIMIZE_LIMIT: int = 9999
    PRO_COMPARE_LIMIT: int = 9999

    # ── CORS ─────────────────────────────────────────────────
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    # ── Supabase (Phase 2 — auth + history) ─────────────────
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
