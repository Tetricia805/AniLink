from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.db import get_db
from app.core.security import get_current_active_user
from app.modules.users.models import User
from app.modules.ai.schemas import AIAssessmentResponse
from app.modules.ai.models import AIAssessment, PredictionLabel, Severity
from app.modules.cases.models import Case

router = APIRouter()


@router.post("/fmd/predict", response_model=AIAssessmentResponse)
async def predict_fmd(
    case_id: str,
    images: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    AI FMD prediction endpoint.
    For now returns PENDING, but structured for future ML integration.
    Matches frontend: POST /ai/fmd/predict
    """
    try:
        case_uuid = UUID(case_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid case ID",
        )
    
    # Get case
    case = db.query(Case).filter(Case.id == case_uuid).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found",
        )
    
    # Authorization
    if case.owner_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized",
        )
    
    # Use AI service
    service = AIService(db)
    assessment = await service.predict_fmd(case_uuid, images)
    
    return AIAssessmentResponse(
        status=assessment.prediction_label.value,
        confidence=assessment.confidence,
        severity=assessment.severity.value if assessment.severity else None,
        notes="AI assessment pending. ML model integration coming soon.",
        completedAt=assessment.created_at,
    )
