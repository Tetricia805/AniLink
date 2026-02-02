from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from fastapi import UploadFile

from app.modules.cases.models import Case, CaseImage, CaseStatus
from app.modules.cases.repository import CaseRepository
from app.modules.notifications.models import Notification
from app.shared.storage import storage_service
import json


class CaseService:
    """Service for case business logic."""
    
    def __init__(self, db: Session):
        self.repository = CaseRepository(db)
        self.db = db

    def _case_notification_exists(
        self, user_id: UUID, title: str, case_id: UUID
    ) -> bool:
        """Check if a similar case notification already exists (idempotency)."""
        notifications = (
            self.db.query(Notification)
            .filter(
                Notification.user_id == user_id,
                Notification.type == "CASE",
                Notification.title == title,
            )
            .all()
        )
        case_id_str = str(case_id)
        for n in notifications:
            if n.payload and n.payload.get("entity_id") == case_id_str:
                return True
        return False

    def _notify_owner_case_created(self, case: Case) -> None:
        """Notify owner when a case is created."""
        self.db.add(
            Notification(
                user_id=case.owner_user_id,
                type="CASE",
                title="New case created",
                message="A case was created for your animal.",
                payload={
                    "entity_type": "case",
                    "entity_id": str(case.id),
                    "action_url": f"/records?focusCase={case.id}",
                },
                read=False,
            )
        )

    def _notify_vet_case_assigned(self, case: Case, vet_user_id: UUID) -> None:
        """Notify vet when a case is assigned to them (idempotent)."""
        if self._case_notification_exists(
            vet_user_id, "New case assigned", case.id
        ):
            return
        self.db.add(
            Notification(
                user_id=vet_user_id,
                type="CASE",
                title="New case assigned",
                message="A case has been assigned to you for review.",
                payload={
                    "entity_type": "case",
                    "entity_id": str(case.id),
                    "action_url": f"/vet/cases?focus={case.id}",
                },
                read=False,
            )
        )

    def _notify_owner_case_closed(self, case: Case) -> None:
        """Notify owner when a case is closed (idempotent)."""
        if self._case_notification_exists(
            case.owner_user_id, "Case closed", case.id
        ):
            return
        self.db.add(
            Notification(
                user_id=case.owner_user_id,
                type="CASE",
                title="Case closed",
                message="Your case has been closed.",
                payload={
                    "entity_type": "case",
                    "entity_id": str(case.id),
                    "action_url": f"/records?focusCase={case.id}",
                },
                read=False,
            )
        )

    async def create_case(
        self,
        user_id: UUID,
        case_data: dict,
        image_files: List[UploadFile],
    ) -> Case:
        """Create a new case with images."""
        # Parse symptoms (frontend may send as comma-separated string or list)
        symptoms_str = case_data.get("symptoms", "")
        if isinstance(symptoms_str, str):
            if symptoms_str.startswith("["):
                # Try to parse as JSON array
                try:
                    symptoms = json.loads(symptoms_str)
                except:
                    symptoms = [s.strip() for s in symptoms_str.split(",") if s.strip()]
            else:
                symptoms = [s.strip() for s in symptoms_str.split(",") if s.strip()]
        else:
            symptoms = symptoms_str if isinstance(symptoms_str, list) else []
        
        # Prepare case data
        case_dict = {
            "owner_user_id": user_id,
            "animal_type": case_data.get("animal_type", "Cattle"),
            "suspected_disease": "FMD",
            "symptoms": symptoms,
            "notes": case_data.get("notes"),
            "location": case_data.get("location"),
            "district": case_data.get("district"),
            "animal_id": UUID(case_data["animal_id"]) if case_data.get("animal_id") else None,
            "status": CaseStatus.SUBMITTED,
        }
        
        # Extract lat/lng from location if needed (basic parsing)
        if case_data.get("location"):
            # Could parse location string here if needed
            pass
        
        # Create case
        case = self.repository.create(case_dict)
        self.db.flush()
        
        # Upload images
        if image_files:
            image_urls = await storage_service.upload_multiple_files(
                image_files,
                folder="cases",
            )
            
            # Create case image records
            for url in image_urls:
                case_image = CaseImage(
                    case_id=case.id,
                    image_url=url,
                )
                self.db.add(case_image)

        self._notify_owner_case_created(case)

        self.db.commit()
        self.db.refresh(case)
        return case
    
    def get_case(self, case_id: UUID) -> Optional[Case]:
        """Get case by ID."""
        return self.repository.get_by_id(case_id)
    
    def get_user_cases(
        self,
        user_id: UUID,
        animal_id: Optional[UUID] = None,
        status: Optional[str] = None,
    ) -> List[Case]:
        """Get cases for an owner."""
        return self.repository.get_user_cases(user_id, animal_id, status)

    def get_vet_cases(
        self,
        vet_user_id: UUID,
        status: Optional[str] = None,
    ) -> List[Case]:
        """Get cases assigned to a vet."""
        return self.repository.get_vet_cases(vet_user_id, status)

    def assign_vet(self, case_id: UUID, vet_user_id: UUID) -> Case:
        """Assign a vet to a case. Notifies the vet (idempotent)."""
        case = self.repository.get_by_id(case_id)
        if not case:
            raise ValueError("Case not found")
        if case.vet_user_id == vet_user_id:
            return case
        case.vet_user_id = vet_user_id
        self.db.flush()
        self._notify_vet_case_assigned(case, vet_user_id)
        self.db.commit()
        self.db.refresh(case)
        return case

    def close_case(self, case_id: UUID, owner_user_id: UUID) -> Case:
        """Close a case. Notifies the owner (idempotent)."""
        case = self.repository.get_by_id(case_id)
        if not case:
            raise ValueError("Case not found")
        if case.owner_user_id != owner_user_id:
            raise ValueError("Not authorized to close this case")
        if case.status == CaseStatus.CLOSED:
            self.db.refresh(case)
            return case
        case.status = CaseStatus.CLOSED
        self.db.flush()
        self._notify_owner_case_closed(case)
        self.db.commit()
        self.db.refresh(case)
        return case

    async def request_ai_assessment(self, case_id: UUID) -> Case:
        """Request AI assessment for a case."""
        case = self.repository.get_by_id(case_id)
        if not case:
            raise ValueError("Case not found")
        
        # Create or update AI assessment
        if not case.ai_assessment:
            from app.modules.ai.models import AIAssessment, PredictionLabel
            ai_assessment = AIAssessment(
                case_id=case.id,
                prediction_label=PredictionLabel.PENDING,
                model_version="v1.0",
            )
            self.db.add(ai_assessment)
        else:
            # Update existing to PENDING if needed
            if case.ai_assessment.prediction_label.value != "PENDING":
                from app.modules.ai.models import PredictionLabel
                case.ai_assessment.prediction_label = PredictionLabel.PENDING
        
        self.db.commit()
        self.db.refresh(case)
        return case
