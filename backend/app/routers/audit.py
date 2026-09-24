from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.models.models import AuditLog

router = APIRouter(prefix="/audit", tags=["audit"])


@router.get("/")
async def get_audit_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str = Query("", description="Search in query or response"),
    db: Session = Depends(get_db),
):
    query = db.query(AuditLog)

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (AuditLog.query.ilike(search_filter)) | (AuditLog.response.ilike(search_filter))
        )

    total = query.count()
    logs = (
        query.order_by(desc(AuditLog.timestamp))
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "logs": [
            {
                "id": log.id,
                "user_id": log.user_id,
                "query": log.query,
                "response": log.response,
                "sources": log.sources,
                "timestamp": log.timestamp.isoformat() if log.timestamp else None,
            }
            for log in logs
        ],
    }


@router.get("/stats")
async def get_audit_stats(db: Session = Depends(get_db)):
    from sqlalchemy import func

    total_queries = db.query(func.count(AuditLog.id)).scalar()
    unique_users = db.query(func.count(func.distinct(AuditLog.user_id))).scalar()
    recent = db.query(AuditLog).order_by(desc(AuditLog.timestamp)).limit(10).all()

    return {
        "total_queries": total_queries,
        "unique_users": unique_users,
        "recent_queries": [
            {
                "id": r.id,
                "user_id": r.user_id,
                "query": r.query[:100],
                "timestamp": r.timestamp.isoformat() if r.timestamp else None,
            }
            for r in recent
        ],
    }
