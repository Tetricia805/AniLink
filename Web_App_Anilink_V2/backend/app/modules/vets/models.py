from sqlalchemy import Column, String, DateTime, ForeignKey, Float, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.db import Base
from app.modules.users.models import User


class Vet(Base):
    """Vet model - linked to user."""
    __tablename__ = "vets"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    clinic_name = Column(String, nullable=False)
    license_number = Column(String, nullable=True)
    services = Column(JSONB, nullable=True, default=list)  # List of strings
    specializations = Column(JSONB, nullable=True, default=list)  # List of strings
    is_24_7 = Column(Boolean, default=False)
    farm_visits = Column(Boolean, default=False)
    avg_rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)
    location_label = Column(String, nullable=True)
    address = Column(String, nullable=True)
    district = Column(String, nullable=True)
    verified = Column(Boolean, default=False)
    rejection_reason = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="vet_profile")
    availability_slots = relationship("VetAvailabilitySlot", back_populates="vet", cascade="all, delete-orphan")


class VetAvailabilitySlot(Base):
    """Vet availability slots (legacy / public listing)."""
    __tablename__ = "vet_availability_slots"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vet_user_id = Column(UUID(as_uuid=True), ForeignKey("vets.user_id", ondelete="CASCADE"), nullable=False)
    day_of_week = Column(Integer, nullable=False)  # 0-6 (Monday-Sunday)
    start_time = Column(String, nullable=False)  # HH:MM format
    end_time = Column(String, nullable=False)  # HH:MM format
    slot_minutes = Column(Integer, default=60)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    vet = relationship("Vet", back_populates="availability_slots")


class VetAvailability(Base):
    """Vet availability (me): weekly_schedule JSON + toggles. One row per vet (user_id = vet user)."""
    __tablename__ = "vet_availability"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    accept_farm_visits = Column(Boolean, default=False)
    is_emergency_247 = Column(Boolean, default=False)
    weekly_schedule = Column(JSONB, nullable=True)  # {"mon":[{"start":"08:00","end":"17:00"}], ...}
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
