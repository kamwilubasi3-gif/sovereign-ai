from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models.models import AuditLog
from app.services.embeddings import get_embedding
from app.services.vector_store import search_similar
from app.services.llm_service import build_prompt, call_ollama_llm

router = APIRouter(tags=["chat"])


class ChatRequest(BaseModel):
    query: str
    user_id: str = "anonymous"


class ChatResponse(BaseModel):
    answer: str
    sources: list[str]
    user_id: str


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest, db: Session = Depends(get_db)):
    query_embedding = await get_embedding(req.query)
    chunks = await search_similar(query_embedding, top_k=5)

    prompt = build_prompt(chunks, req.query)
    answer = await call_ollama_llm(prompt)

    sources = list(set(c["source"] for c in chunks))

    audit = AuditLog(
        user_id=req.user_id,
        query=req.query,
        response=answer,
        sources=", ".join(sources),
    )
    db.add(audit)
    db.commit()

    return ChatResponse(answer=answer, sources=sources, user_id=req.user_id)
