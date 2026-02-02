from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.modules.animals.models import Animal
from app.modules.animals.repository import AnimalRepository


class AnimalService:
    """Service for animal business logic."""
    
    def __init__(self, db: Session):
        self.repository = AnimalRepository(db)
        self.db = db
    
    def create_animal(self, user_id: UUID, animal_data: dict) -> Animal:
        """Create a new animal."""
        animal_dict = {
            "owner_user_id": user_id,
            **animal_data,
        }
        
        # Map frontend field names
        if "dateOfBirth" in animal_dict:
            animal_dict["dob_estimated"] = animal_dict.pop("dateOfBirth")
        if "imageUrl" in animal_dict:
            animal_dict["photo_url"] = animal_dict.pop("imageUrl")
        if "tagNumber" in animal_dict:
            animal_dict["tag_number"] = animal_dict.pop("tagNumber")
        
        animal = self.repository.create(animal_dict)
        self.db.commit()
        self.db.refresh(animal)
        return animal
    
    def get_user_animals(self, user_id: UUID) -> List[Animal]:
        """Get animals for a user."""
        return self.repository.get_user_animals(user_id)
    
    def get_animal(self, animal_id: UUID) -> Optional[Animal]:
        """Get animal by ID."""
        return self.repository.get_by_id(animal_id)
