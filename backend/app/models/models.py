from sqlalchemy import Column, Integer, String, Text, DateTime, func
from app.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(512), nullable=False)
    department = Column(String(128), default="general")
    access_level = Column(String(64), default="standard")
    chunk_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(128), default="anonymous")
    query = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    sources = Column(Text, default="")
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
