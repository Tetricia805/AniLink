from sqlalchemy import Column, String, DateTime, ForeignKey, Float, Enum as SQLEnum, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from app.core.db import Base


class PredictionLabel(str, enum.Enum):
    """AI prediction label enumeration."""
    FMD = "FMD"
    NOT_FMD = "NOT_FMD"
    UNCLEAR = "UNCLEAR"
    PENDING = "PENDING"


class Severity(str, enum.Enum):
    """Severity level enumeration."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    EMERGENCY = "EMERGENCY"


class AIAssessment(Base):
    """AI assessment model."""
    __tablename__ = "ai_assessments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    model_version = Column(String, nullable=True)
    prediction_label = Column(SQLEnum(PredictionLabel), default=PredictionLabel.PENDING)
    confidence = Column(Float, nullable=True)
    severity = Column(SQLEnum(Severity), nullable=True)
    explanation = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    case = relationship("Case", back_populates="ai_assessment")
