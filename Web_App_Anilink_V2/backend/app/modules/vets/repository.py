from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.modules.vets.models import Vet


class VetRepository:
    """Repository for vet operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def search(
        self,
        specialization: Optional[str] = None,
        farm_visits: Optional[bool] = None,
        is_24_hours: Optional[bool] = None,
    ) -> List[Vet]:
        """Search vets with filters."""
        query = self.db.query(Vet)
        
        if specialization:
            # Filter by specialization (stored as JSONB array)
            query = query.filter(Vet.specializations.contains([specialization]))
        
        if farm_visits is not None:
            query = query.filter(Vet.farm_visits == farm_visits)
        
        if is_24_hours is not None:
            query = query.filter(Vet.is_24_7 == is_24_hours)
        
        return query.filter(Vet.verified == True).all()  # Only show verified vets
    
    def get_by_user_id(self, user_id: UUID) -> Optional[Vet]:
        """Get vet by user_id."""
        return self.db.query(Vet).filter(Vet.user_id == user_id).first()
    
    def create(self, vet_data: dict) -> Vet:
        """Create a new vet profile."""
        vet = Vet(**vet_data)
        self.db.add(vet)
        return vet
