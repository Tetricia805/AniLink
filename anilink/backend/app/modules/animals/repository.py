from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.modules.animals.models import Animal


class AnimalRepository:
    """Repository for animal operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, animal_data: dict) -> Animal:
        """Create a new animal."""
        animal = Animal(**animal_data)
        self.db.add(animal)
        return animal
    
    def get_by_id(self, animal_id: UUID) -> Optional[Animal]:
        """Get animal by ID."""
        return self.db.query(Animal).filter(Animal.id == animal_id).first()
    
    def get_user_animals(self, user_id: UUID) -> List[Animal]:
        """Get animals for a user."""
        return (
            self.db.query(Animal)
            .filter(Animal.owner_user_id == user_id)
            .order_by(Animal.created_at.desc())
            .all()
        )
