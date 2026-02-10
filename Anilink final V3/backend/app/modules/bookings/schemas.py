from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class BookingCreate(BaseModel):
    """Booking creation schema."""
    vetId: str
    caseId: Optional[str] = None
    visitType: str  # CLINIC, FARM
    scheduledAt: datetime
    notes: Optional[str] = None


class BookingResponse(BaseModel):
    """Booking response - matches frontend BookingDto exactly."""
    id: str
    vetId: str
    userId: str
    visitType: str
    scheduledAt: datetime
    caseId: Optional[str] = None
    notes: Optional[str] = None
    status: str
    vetName: Optional[str] = None
    clinicName: Optional[str] = None
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            UUID: lambda v: str(v),
        }
