from sqlalchemy import Column, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from app.core.db import Base


class VisitType(str, enum.Enum):
    """Visit type enumeration."""
    CLINIC = "CLINIC"
    FARM = "FARM"


class BookingStatus(str, enum.Enum):
    """Booking status enumeration."""
    REQUESTED = "REQUESTED"
    CONFIRMED = "CONFIRMED"
    DECLINED = "DECLINED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class Booking(Base):
    """Booking model."""
    __tablename__ = "bookings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    vet_user_id = Column(UUID(as_uuid=True), ForeignKey("vets.user_id", ondelete="CASCADE"), nullable=False, index=True)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="SET NULL"), nullable=True)
    visit_type = Column(SQLEnum(VisitType), nullable=False)
    scheduled_time = Column(DateTime(timezone=True), nullable=False)
    status = Column(SQLEnum(BookingStatus), default=BookingStatus.REQUESTED)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", foreign_keys=[owner_user_id])
    vet = relationship("Vet", foreign_keys=[vet_user_id])
    case = relationship("Case", foreign_keys=[case_id])
