import httpx
from app.config import get_settings

settings = get_settings()


async def get_embedding(text: str) -> list[float]:
    async with httpx.AsyncClient(timeout=300.0) as client:
        resp = await client.post(
            f"{settings.OLLAMA_BASE_URL}/api/embeddings",
            json={"model": settings.OLLAMA_EMBED_MODEL, "prompt": text},
        )
        resp.raise_for_status()
        return resp.json()["embedding"]


async def embed_chunks(chunks: list[str]) -> list[list[float]]:
    embeddings = []
    for chunk in chunks:
        emb = await get_embedding(chunk)
        embeddings.append(emb)
    return embeddings
