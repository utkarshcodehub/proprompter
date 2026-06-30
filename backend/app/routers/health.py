from fastapi import APIRouter
from app.config import settings

router = APIRouter(tags=["Health"])

@router.get("/health", summary="Health check")
async def health() -> dict:
    return {
        "status": "ok",
        "env":    settings.ENV,
        "model":  settings.GROQ_MODEL,
    }