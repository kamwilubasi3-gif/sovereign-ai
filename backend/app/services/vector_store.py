from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct
from app.config import get_settings
import uuid

settings = get_settings()


def get_qdrant_client() -> QdrantClient:
    return QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)


def ensure_collection():
    client = get_qdrant_client()
    collections = [c.name for c in client.get_collections().collections]
    if settings.QDRANT_COLLECTION not in collections:
        client.create_collection(
            collection_name=settings.QDRANT_COLLECTION,
            vectors_config=VectorParams(size=768, distance=Distance.COSINE),
        )


async def store_vectors(
    chunks: list[str],
    embeddings: list[list[float]],
    metadata: list[dict],
):
    ensure_collection()
    client = get_qdrant_client()
    points = []
    for i, (chunk, emb, meta) in enumerate(zip(chunks, embeddings, metadata)):
        payload = {"text": chunk, **meta}
        points.append(
            PointStruct(id=str(uuid.uuid4()), vector=emb, payload=payload)
        )

    batch_size = 100
    for start in range(0, len(points), batch_size):
        client.upsert(
            collection_name=settings.QDRANT_COLLECTION,
            points=points[start : start + batch_size],
        )


async def search_similar(query_embedding: list[float], top_k: int = 5) -> list[dict]:
    ensure_collection()
    client = get_qdrant_client()
    results = client.query_points(
        collection_name=settings.QDRANT_COLLECTION,
        query=query_embedding,
        limit=top_k,
    )
    return [
        {"text": r.payload.get("text", ""), "source": r.payload.get("filename", "unknown"), "score": r.score}
        for r in results.points
    ]
