from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class VetResponse(BaseModel):
    """Vet response schema - matches frontend VetDto exactly."""
    id: str  # user_id as string - matches frontend requirement
    name: str  # From user.name
    clinicName: str
    specialization: Optional[str] = None
    rating: float = 0.0
    reviewCount: int = 0
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    district: Optional[str] = None
    locationLabel: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    profileImageUrl: Optional[str] = None
    services: Optional[List[str]] = []
    offersFarmVisits: Optional[bool] = False
    is24Hours: Optional[bool] = False
    isVerified: Optional[bool] = False
    availability: Optional[str] = None
    createdAt: Optional[datetime] = None
    distance_km: Optional[float] = None  # Calculated distance
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            UUID: lambda v: str(v),
        }


class VetUpdateRequest(BaseModel):
    """Vet profile update request - matches frontend VetUpdateRequestDto."""
    name: Optional[str] = None
    clinicName: Optional[str] = None
    specialization: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    district: Optional[str] = None
    locationLabel: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    services: Optional[List[str]] = None
    offersFarmVisits: Optional[bool] = None
    is24Hours: Optional[bool] = None
    availability: Optional[str] = None


# Weekly schedule: mon/tue/.../sun -> list of {start, end} HH:MM
WeeklyScheduleDict = dict


class VetAvailabilityResponse(BaseModel):
    """GET /vets/me/availability response."""
    acceptFarmVisits: bool = False
    isEmergency247: bool = False
    weeklySchedule: Optional[WeeklyScheduleDict] = None


class VetAvailabilityUpdate(BaseModel):
    """PUT /vets/me/availability request."""
    acceptFarmVisits: Optional[bool] = None
    isEmergency247: Optional[bool] = None
    weeklySchedule: Optional[WeeklyScheduleDict] = None


class AvailabilitySlotResponse(BaseModel):
    """Vet availability slot response."""
    id: str
    dayOfWeek: int  # 0-6 (Monday-Sunday)
    startTime: str  # HH:MM
    endTime: str  # HH:MM
    slotMinutes: int
    
    class Config:
        from_attributes = True
        json_encoders = {
            UUID: lambda v: str(v),
        }


class AvailabilitySlotCreate(BaseModel):
    """Create availability slot."""
    dayOfWeek: int  # 0-6
    startTime: str  # HH:MM
    endTime: str  # HH:MM
    slotMinutes: int = 60
