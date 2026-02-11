from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from fastapi import UploadFile

from app.modules.ai.models import AIAssessment, PredictionLabel, Severity
from app.modules.cases.models import Case


class AIService:
    """Service for AI assessment logic."""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def predict_fmd(
        self,
        case_id: UUID,
        images: List[UploadFile],
    ) -> AIAssessment:
        """
        Predict FMD from images.
        
        For now, returns PENDING status.
        Structure allows for future ML model integration.
        """
        # Get case
        case = self.db.query(Case).filter(Case.id == case_id).first()
        if not case:
            raise ValueError("Case not found")
        
        # Check if assessment exists
        assessment = (
            self.db.query(AIAssessment)
            .filter(AIAssessment.case_id == case_id)
            .first()
        )
        
        if not assessment:
            # Create new assessment with PENDING
            assessment = AIAssessment(
                case_id=case_id,
                prediction_label=PredictionLabel.PENDING,
                model_version="v1.0",
            )
            self.db.add(assessment)
        else:
            # Update to PENDING (if not configured)
            assessment.prediction_label = PredictionLabel.PENDING
        
        # TODO: When ML model is integrated:
        # 1. Upload images to model input
        # 2. Call inference endpoint
        # 3. Parse response: label, confidence, severity
        # 4. Update assessment with results
        # Example:
        # result = ml_model.predict(images)
        # assessment.prediction_label = PredictionLabel[result.label]
        # assessment.confidence = result.confidence
        # assessment.severity = Severity[result.severity]
        # assessment.explanation = result.explanation
        
        self.db.commit()
        self.db.refresh(assessment)
        return assessment
