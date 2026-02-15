from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
from uuid import UUID


class AnimalCreate(BaseModel):
    """Animal creation schema."""
    name: str
    type: str
    breed: Optional[str] = None
    dateOfBirth: Optional[date] = None  # Frontend: dateOfBirth
    gender: Optional[str] = None
    color: Optional[str] = None
    tagNumber: Optional[str] = None
    imageUrl: Optional[str] = None
    notes: Optional[str] = None


class AnimalResponse(BaseModel):
    """Animal response - matches frontend AnimalDto exactly."""
    id: str
    name: str
    type: str
    breed: Optional[str] = None
    dateOfBirth: Optional[date] = None  # Frontend expects dateOfBirth
    gender: Optional[str] = None
    color: Optional[str] = None
    tagNumber: Optional[str] = None
    imageUrl: Optional[str] = None  # Frontend: imageUrl
    vaccinationRecords: Optional[List[str]] = []
    treatmentRecords: Optional[List[str]] = []
    caseIds: Optional[List[str]] = []
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            date: lambda v: v.isoformat(),
            UUID: lambda v: str(v),
        }
