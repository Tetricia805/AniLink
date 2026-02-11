from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.db import get_db
from app.core.security import get_current_active_user
from app.modules.users.models import User
from app.modules.animals.schemas import AnimalCreate, AnimalResponse
from app.modules.animals.service import AnimalService
from app.modules.animals.models import Animal
from app.modules.cases.models import Case

router = APIRouter()


def _animal_to_response(animal: Animal) -> AnimalResponse:
    """Convert Animal to AnimalResponse matching frontend AnimalDto."""
    # Get vaccination records from JSONB
    vaccination_records = animal.vaccination_records if isinstance(animal.vaccination_records, list) else []
    treatment_records = animal.treatment_records if isinstance(animal.treatment_records, list) else []
    
    # Get case IDs
    case_ids = [str(case.id) for case in animal.cases] if animal.cases else []
    
    return AnimalResponse(
        id=str(animal.id),
        name=animal.name,
        type=animal.type,
        breed=animal.breed,
        dateOfBirth=animal.dob_estimated,  # Map dob_estimated to dateOfBirth
        gender=animal.sex,
        color=animal.color,
        tagNumber=animal.tag_number,
        imageUrl=animal.photo_url,  # Map photo_url to imageUrl
        vaccinationRecords=vaccination_records,
        treatmentRecords=treatment_records,
        caseIds=case_ids,
        createdAt=animal.created_at,
        updatedAt=animal.updated_at,
    )


@router.post("", response_model=AnimalResponse, status_code=status.HTTP_201_CREATED)
async def create_animal(
    animal_data: AnimalCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Create a new animal record.
    Matches frontend: POST /animals
    """
    try:
        service = AnimalService(db)
        animal = service.create_animal(current_user.id, animal_data.dict())
        return _animal_to_response(animal)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("", response_model=List[AnimalResponse])
async def list_animals(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    List animals for current user.
    Matches frontend: GET /animals
    """
    service = AnimalService(db)
    animals = service.get_user_animals(current_user.id)
    return [_animal_to_response(animal) for animal in animals]


@router.get("/{animal_id}", response_model=AnimalResponse)
async def get_animal(
    animal_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Get animal by ID.
    Matches frontend: GET /animals/:id
    """
    try:
        animal_uuid = UUID(animal_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid animal ID",
        )
    
    service = AnimalService(db)
    animal = service.get_animal(animal_uuid)
    
    if not animal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Animal not found",
        )
    
    # Authorization: only owner can view
    if animal.owner_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized",
        )
    
    return _animal_to_response(animal)
