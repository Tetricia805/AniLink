"""ScanRecord model for FMD scan persistence."""

from sqlalchemy import Column, String, DateTime, ForeignKey, Float, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.db import Base


class ScanRecord(Base):
    """FMD scan record persisted for Records timeline."""

    __tablename__ = "scan_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    animal_id = Column(UUID(as_uuid=True), ForeignKey("animals.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    scan_type = Column(String(32), nullable=False)
    threshold_used = Column(Float, nullable=False)
    cattle_prob = Column(Float, nullable=False)
    non_cattle_prob = Column(Float, nullable=False)
    passed_gate = Column(Boolean, nullable=False)
    gate_rule = Column(String(256), nullable=True)
    fmd_label = Column(String(32), nullable=True)
    fmd_confidence = Column(Float, nullable=True)
    raw_json = Column(JSONB, nullable=True)
    image_ref = Column(String(512), nullable=True)
