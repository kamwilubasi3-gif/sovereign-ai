from fastapi import APIRouter
import httpx
from app.config import get_settings

settings = get_settings()
router = APIRouter(prefix="/health", tags=["health"])


@router.get("/")
async def health_check():
    status = {"backend": "ok", "ollama": "unknown", "qdrant": "unknown", "postgres": "unknown"}

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
            status["ollama"] = "ok" if r.status_code == 200 else "error"
    except Exception:
        status["ollama"] = "unreachable"

    try:
        from qdrant_client import QdrantClient
        qclient = QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)
        qclient.get_collections()
        status["qdrant"] = "ok"
    except Exception:
        status["qdrant"] = "unreachable"

    try:
        from app.database import engine
        with engine.connect() as conn:
            conn.execute(__import__("sqlalchemy").text("SELECT 1"))
        status["postgres"] = "ok"
    except Exception:
        status["postgres"] = "unreachable"

    all_ok = all(v == "ok" for v in status.values())
    return {"status": "healthy" if all_ok else "degraded", "services": status}
