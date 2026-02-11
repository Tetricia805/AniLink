from sqlalchemy import Column, String, DateTime, ForeignKey, Float, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from app.core.db import Base


class CaseStatus(str, enum.Enum):
    """Case status enumeration."""
    SUBMITTED = "SUBMITTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    CLOSED = "CLOSED"


class Case(Base):
    """Animal health case model."""
    __tablename__ = "cases"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    vet_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    animal_id = Column(UUID(as_uuid=True), ForeignKey("animals.id", ondelete="SET NULL"), nullable=True, index=True)
    animal_type = Column(String, nullable=False)  # Matches frontend
    suspected_disease = Column(String, default="FMD")
    symptoms = Column(JSONB, nullable=False, default=list)  # List of strings - matches frontend
    notes = Column(String, nullable=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    location = Column(String, nullable=True)  # String location for frontend
    district = Column(String, nullable=True)
    status = Column(SQLEnum(CaseStatus), default=CaseStatus.SUBMITTED)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    animal = relationship("Animal", back_populates="cases", foreign_keys=[animal_id])
    images = relationship("CaseImage", back_populates="case", cascade="all, delete-orphan")
    ai_assessment = relationship("AIAssessment", back_populates="case", uselist=False, cascade="all, delete-orphan")


class CaseImage(Base):
    """Case image model."""
    __tablename__ = "case_images"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    image_url = Column(String, nullable=False)
    meta = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    case = relationship("Case", back_populates="images")
