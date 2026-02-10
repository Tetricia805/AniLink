from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.modules.cases.models import Case, CaseStatus


class CaseRepository:
    """Repository for case operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, case_data: dict) -> Case:
        """Create a new case."""
        case = Case(**case_data)
        self.db.add(case)
        return case
    
    def get_by_id(self, case_id: UUID) -> Optional[Case]:
        """Get case by ID."""
        return (
            self.db.query(Case)
            .options(
                # Eagerly load related data
            )
            .filter(Case.id == case_id)
            .first()
        )
    
    def get_user_cases(
        self,
        user_id: UUID,
        animal_id: Optional[UUID] = None,
        status: Optional[str] = None,
    ) -> List[Case]:
        """Get cases for an owner."""
        query = self.db.query(Case).filter(Case.owner_user_id == user_id)

        if animal_id:
            query = query.filter(Case.animal_id == animal_id)

        if status:
            try:
                status_enum = CaseStatus[status]
                query = query.filter(Case.status == status_enum)
            except KeyError:
                pass

        return query.order_by(Case.created_at.desc()).all()

    def get_vet_cases(
        self,
        vet_user_id: UUID,
        status: Optional[str] = None,
    ) -> List[Case]:
        """Get cases assigned to a vet."""
        query = self.db.query(Case).filter(Case.vet_user_id == vet_user_id)

        if status:
            try:
                status_enum = CaseStatus[status]
                query = query.filter(Case.status == status_enum)
            except KeyError:
                pass

        return query.order_by(Case.created_at.desc()).all()
