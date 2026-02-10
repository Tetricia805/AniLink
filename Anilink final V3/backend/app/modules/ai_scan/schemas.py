"""Schemas for POST /v1/ai-scan/analyze and scan records."""

from datetime import datetime
from typing import Literal, Optional, Any

from pydantic import BaseModel


class ScanRecordCreate(BaseModel):
    """Payload for saving scan result (client-side inference)."""

    animal_id: Optional[str] = None
    type: Literal["FMD_SCAN"] = "FMD_SCAN"
    cattle_prob: float
    non_cattle_prob: float
    fmd_label: Optional[Literal["Healthy", "Infected"]] = None
    fmd_confidence: Optional[float] = None
    threshold_used: float
    raw_probs: dict[str, Any]
    image_ref: Optional[str] = None


class ScanRecordResponse(BaseModel):
    """Response after saving scan record."""

    id: str
    status: str = "saved"


class ScanRecordDto(BaseModel):
    """Scan record for API response."""

    id: str
    user_id: str
    animal_id: Optional[str] = None
    created_at: datetime
    scan_type: str
    threshold_used: float
    cattle_prob: float
    non_cattle_prob: float
    passed_gate: bool
    gate_rule: Optional[str] = None
    fmd_label: Optional[str] = None
    fmd_confidence: Optional[float] = None

    class Config:
        from_attributes = True


class ScanAnalyzeNotCattleResponse(BaseModel):
    """Response when image does not contain cattle."""

    ok: Literal[False] = False
    reason: Literal["NOT_CATTLE"] = "NOT_CATTLE"
    probCattle: float
    record: Optional[ScanRecordDto] = None


class ScanAnalyzeDiagnosis(BaseModel):
    """FMD diagnosis when cattle is detected."""

    condition: Literal["FOOT_AND_MOUTH_DISEASE", "HEALTHY"]
    confidence: float
    probs: dict[str, float]  # healthy, infected


class ScanAnalyzeCattleResponse(BaseModel):
    """Response when cattle is detected and FMD analysis completed."""

    ok: Literal[True] = True
    animalType: Literal["CATTLE"] = "CATTLE"
    probCattle: float
    diagnosis: ScanAnalyzeDiagnosis
    record: Optional[ScanRecordDto] = None
