from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from app.modules.ai.schemas import AIAssessmentResponse


class CaseCreate(BaseModel):
    """Case creation schema - matches frontend multipart format."""
    animal_type: str
    symptoms: str = Field(..., description="Comma-separated symptoms or JSON array")  # Frontend sends as string or array
    notes: Optional[str] = None
    location: Optional[str] = None
    district: Optional[str] = None
    animal_id: Optional[str] = None


class CaseResponse(BaseModel):
    """Case response schema - matches frontend CaseDto exactly."""
    id: str  # UUID as string
    animalType: str  # Matches frontend
    imageUrls: List[str] = []  # Matches frontend
    symptoms: List[str] = []  # Matches frontend
    notes: Optional[str] = None
    location: Optional[str] = None
    district: Optional[str] = None
    status: str
    aiAssessment: Optional[AIAssessmentResponse] = None  # Matches frontend
    animalId: Optional[str] = None
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            UUID: lambda v: str(v),
        }


class CaseAssignVet(BaseModel):
    """Schema for assigning a vet to a case."""
    vet_user_id: str


class CaseListResponse(BaseModel):
    """Case list response."""
    cases: List[CaseResponse]
    total: int = 0
