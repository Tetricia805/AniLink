from sqlalchemy import Column, String, DateTime, ForeignKey, Date
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.db import Base


class Animal(Base):
    """Animal model."""
    __tablename__ = "animals"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String, nullable=False)  # Cattle, Goat, Sheep, etc.
    breed = Column(String, nullable=True)
    name = Column(String, nullable=False)
    sex = Column(String, nullable=True)  # MALE, FEMALE
    dob_estimated = Column(Date, nullable=True)
    color = Column(String, nullable=True)
    tag_number = Column(String, nullable=True)
    photo_url = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    vaccination_records = Column(JSONB, nullable=True, default=list)
    treatment_records = Column(JSONB, nullable=True, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    cases = relationship("Case", back_populates="animal", foreign_keys="Case.animal_id")
