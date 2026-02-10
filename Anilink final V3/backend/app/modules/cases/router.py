from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
import json

from app.core.db import get_db
from app.core.security import get_current_active_user
from app.modules.users.models import User
from app.modules.cases.schemas import CaseResponse, CaseListResponse, CaseAssignVet
from app.modules.cases.service import CaseService
from app.modules.cases.models import Case, CaseStatus
from app.modules.ai.schemas import AIAssessmentResponse

router = APIRouter()


def _case_to_response(case: Case) -> CaseResponse:
    """Convert Case model to CaseResponse matching frontend CaseDto."""
    # Get image URLs
    image_urls = [img.image_url for img in case.images]
    
    # Get symptoms (from JSONB)
    symptoms = case.symptoms if isinstance(case.symptoms, list) else []
    
    # Get AI assessment
    ai_assessment = None
    if case.ai_assessment:
        ai_assessment = AIAssessmentResponse(
            status=case.ai_assessment.prediction_label.value,
            confidence=case.ai_assessment.confidence,
            severity=case.ai_assessment.severity.value if case.ai_assessment.severity else None,
            notes=None,  # Could add notes field
            completedAt=case.ai_assessment.created_at,
        )
    
    return CaseResponse(
        id=str(case.id),
        animalType=case.animal_type,
        imageUrls=image_urls,
        symptoms=symptoms,
        notes=case.notes,
        location=case.location,
        district=case.district,
        status=case.status.value,
        aiAssessment=ai_assessment,
        animalId=str(case.animal_id) if case.animal_id else None,
        createdAt=case.created_at,
        updatedAt=case.updated_at,
    )


@router.post("", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
async def create_case(
    animal_type: str = Form(...),
    symptoms: str = Form(...),
    notes: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    district: Optional[str] = Form(None),
    animal_id: Optional[str] = Form(None),
    images: List[UploadFile] = File(default=[]),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Create a new case with images.
    Matches frontend: POST /cases (multipart)
    """
    try:
        case_data = {
            "animal_type": animal_type,
            "symptoms": symptoms,
            "notes": notes,
            "location": location,
            "district": district,
            "animal_id": animal_id,
        }
        
        service = CaseService(db)
        case = await service.create_case(current_user.id, case_data, images)
        return _case_to_response(case)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/{case_id}", response_model=CaseResponse)
async def get_case(
    case_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Get case by ID.
    Matches frontend: GET /cases/:id
    """
    try:
        case_uuid = UUID(case_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid case ID",
        )
    
    service = CaseService(db)
    case = service.get_case(case_uuid)
    
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found",
        )
    
    # Authorization: owner can view their own cases
    if case.owner_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this case",
        )
    
    return _case_to_response(case)


@router.post("/{case_id}/request-ai", response_model=CaseResponse)
async def request_ai_assessment(
    case_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Request AI assessment for a case.
    Matches frontend: POST /cases/:id/request-ai
    """
    try:
        case_uuid = UUID(case_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid case ID",
        )
    
    service = CaseService(db)
    case = service.get_case(case_uuid)
    
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
    
    case = await service.request_ai_assessment(case_uuid)
    return _case_to_response(case)


@router.post("/{case_id}/images", response_model=CaseResponse)
async def upload_case_images(
    case_id: str,
    images: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Upload additional images to an existing case.
    Matches requirement: POST /cases/{id}/images
    """
    try:
        case_uuid = UUID(case_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid case ID",
        )
    
    service = CaseService(db)
    case = service.get_case(case_uuid)
    
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
    
    # Upload images
    if images:
        from app.shared.storage import storage_service
        from app.modules.cases.models import CaseImage
        
        image_urls = await storage_service.upload_multiple_files(
            images,
            folder="cases",
        )
        
        # Create case image records
        for url in image_urls:
            case_image = CaseImage(
                case_id=case.id,
                image_url=url,
            )
            db.add(case_image)
        
        db.commit()
        db.refresh(case)
    
    return _case_to_response(case)


@router.post("/{case_id}/close", response_model=CaseResponse)
async def close_case(
    case_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Close a case. Notifies the owner (idempotent).
    Matches requirement: POST /cases/{id}/close
    """
    try:
        case_uuid = UUID(case_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid case ID",
        )

    service = CaseService(db)
    try:
        case = service.close_case(case_uuid, current_user.id)
    except ValueError as e:
        if "not found" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Case not found",
            )
        if "not authorized" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to close this case",
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    return _case_to_response(case)


@router.post("/{case_id}/assign", response_model=CaseResponse)
async def assign_vet(
    case_id: str,
    body: CaseAssignVet,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Assign a vet to a case. Vet or Admin only.
    Notifies the assigned vet (idempotent if same vet).
    """
    try:
        case_uuid = UUID(case_id)
        vet_uuid = UUID(body.vet_user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid case ID or vet ID",
        )

    service = CaseService(db)
    case = service.get_case(case_uuid)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found",
        )

    if current_user.role.value not in ("VET", "ADMIN"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only vets or admins can assign cases",
        )
    if current_user.role.value == "VET" and current_user.id != vet_uuid:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vets can only assign cases to themselves",
        )

    try:
        case = service.assign_vet(case_uuid, vet_uuid)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    return _case_to_response(case)


@router.get("", response_model=List[CaseResponse])
async def list_cases(
    animal_id: Optional[str] = None,
    status: Optional[str] = None,
    scope: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    List cases for current user.
    Matches frontend: GET /cases?animal_id=&status=&scope=
    - scope=vet: vet sees only cases where vet_user_id == current_user.id
    - scope=owner or omitted: owner sees their cases (owner_user_id == current_user.id)
    - Admin: not yet distinguished; follows owner behavior.
    """
    service = CaseService(db)

    if scope and scope.lower() == "vet":
        if current_user.role.value != "VET":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="scope=vet is only available for vets",
            )
        cases = service.get_vet_cases(current_user.id, status)
    else:
        animal_uuid = None
        if animal_id:
            try:
                animal_uuid = UUID(animal_id)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid animal ID",
                )
        cases = service.get_user_cases(current_user.id, animal_uuid, status)

    return [_case_to_response(case) for case in cases]
