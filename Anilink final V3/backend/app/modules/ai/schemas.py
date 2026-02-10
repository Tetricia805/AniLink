from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class AIAssessmentResponse(BaseModel):
    """AI Assessment response - matches frontend AiAssessmentDto exactly."""
    status: str = "PENDING"  # FMD, NOT_FMD, UNCLEAR, PENDING
    confidence: Optional[float] = None
    severity: Optional[str] = None  # LOW, MEDIUM, EMERGENCY
    notes: Optional[str] = None
    completedAt: Optional[datetime] = None
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            UUID: lambda v: str(v),
        }


class AIAssessmentRequest(BaseModel):
    """Request for AI assessment."""
    case_id: str
    images: list[str]  # Image URLs
