from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import documents, chat, audit, health

app = FastAPI(
    title="Sovereign AI Platform",
    description="On-premise AI assistant with RAG — nothing leaves the building",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:80"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(documents.router)
app.include_router(chat.router)
app.include_router(audit.router)


@app.on_event("startup")
async def startup():
    Base.metadata.create_all(bind=engine)
    try:
        from app.services.vector_store import ensure_collection
        ensure_collection()
    except Exception:
        pass


@app.get("/")
async def root():
    return {"message": "Sovereign AI Platform API", "docs": "/docs"}
