from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Document
from app.services.document_processor import extract_text_from_pdf, chunk_text
from app.services.embeddings import embed_chunks
from app.services.vector_store import store_vectors

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    department: str = Form("general"),
    access_level: str = Form("standard"),
    db: Session = Depends(get_db),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="File is empty")

    text = extract_text_from_pdf(file_bytes)
    if not text.strip():
        raise HTTPException(status_code=400, detail="No text could be extracted from the PDF")

    chunks = chunk_text(text)
    if not chunks:
        raise HTTPException(status_code=400, detail="No chunks produced from document text")

    embeddings = await embed_chunks(chunks)

    metadata = [
        {
            "filename": file.filename,
            "department": department,
            "access_level": access_level,
        }
        for _ in chunks
    ]
    await store_vectors(chunks, embeddings, metadata)

    doc = Document(
        filename=file.filename,
        department=department,
        access_level=access_level,
        chunk_count=len(chunks),
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    return {
        "id": doc.id,
        "filename": doc.filename,
        "department": doc.department,
        "chunk_count": doc.chunk_count,
        "status": "ingested",
    }


@router.get("/")
async def list_documents(db: Session = Depends(get_db)):
    docs = db.query(Document).order_by(Document.created_at.desc()).all()
    return [
        {
            "id": d.id,
            "filename": d.filename,
            "department": d.department,
            "access_level": d.access_level,
            "chunk_count": d.chunk_count,
            "created_at": d.created_at.isoformat() if d.created_at else None,
        }
        for d in docs
    ]
