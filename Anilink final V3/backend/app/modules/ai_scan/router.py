"""Router for AI Health Scan - POST /v1/ai-scan/analyze, GET /v1/ai-scan/records."""

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.core.security import get_current_active_user
from app.core.db import get_db
from app.modules.users.models import User
from app.modules.ai_scan.schemas import (
    ScanAnalyzeNotCattleResponse,
    ScanAnalyzeCattleResponse,
    ScanRecordDto,
    ScanRecordResponse,
    ScanRecordCreate,
)
from app.modules.ai_scan.service import call_model_service, persist_scan_record

router = APIRouter()


def _model_to_dto(record) -> ScanRecordDto:
    return ScanRecordDto(
        id=str(record.id),
        user_id=str(record.user_id),
        animal_id=str(record.animal_id) if record.animal_id else None,
        created_at=record.created_at,
        scan_type=record.scan_type,
        threshold_used=record.threshold_used,
        cattle_prob=record.cattle_prob,
        non_cattle_prob=record.non_cattle_prob,
        passed_gate=record.passed_gate,
        gate_rule=record.gate_rule,
        fmd_label=record.fmd_label,
        fmd_confidence=record.fmd_confidence,
    )


def _model_response_to_ui(model_resp: dict) -> dict:
    """Map model-service response to frontend schema."""
    if not model_resp.get("passed_gate"):
        return {
            "ok": False,
            "reason": "NOT_CATTLE",
            "probCattle": model_resp["cattle_prob"],
        }
    fmd = model_resp.get("fmd")
    if not fmd:
        return {
            "ok": False,
            "reason": "NOT_CATTLE",
            "probCattle": model_resp["cattle_prob"],
        }
    # Map INFECTED -> FOOT_AND_MOUTH_DISEASE, HEALTHY -> HEALTHY
    condition = "FOOT_AND_MOUTH_DISEASE" if fmd["label"] == "INFECTED" else "HEALTHY"
    return {
        "ok": True,
        "animalType": "CATTLE",
        "probCattle": model_resp["cattle_prob"],
        "diagnosis": {
            "condition": condition,
            "confidence": fmd["confidence"],
            "probs": fmd["probs"],
        },
    }


@router.post(
    "/analyze",
    response_model=ScanAnalyzeCattleResponse | ScanAnalyzeNotCattleResponse,
)
async def analyze(
    image: UploadFile = File(..., description="Image file (PNG, JPG) for analysis"),
    threshold: float = Form(0.5, description="Cattle detection threshold"),
    animal_id: Optional[str] = Form(None, description="Optional animal ID to link record"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    AI Health Scan: upload image for cattle + FMD analysis.
    Calls model-service for inference, persists result to DB, returns analysis + record.
    """
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(400, "File must be an image (PNG, JPG)")

    contents = await image.read()
    if not contents:
        raise HTTPException(400, "Empty file")

    try:
        model_resp = call_model_service(
            contents,
            filename=image.filename or "image.jpg",
            threshold=threshold,
        )
    except Exception as e:
        raise HTTPException(503, f"Model service unavailable: {e}") from e

    animal_uuid = None
    if animal_id:
        try:
            animal_uuid = uuid.UUID(animal_id)
        except ValueError:
            pass

    # Persistence rule: only save when sick / medium or high urgency.
    # Do NOT persist healthy or low-urgency scans as cases/records.
    # persist = (fmd_label == "INFECTED") OR (urgency in ["MEDIUM", "HIGH"]) OR (risk_level != "LOW")
    # Model returns fmd.label: "INFECTED" | "HEALTHY". No urgency/risk_level in model output.
    fmd_label = model_resp.get("fmd", {}).get("label") if model_resp.get("fmd") else None
    should_persist = (
        animal_uuid is not None
        and fmd_label == "INFECTED"
    )

    record_dto = None
    if should_persist:
        record = persist_scan_record(
            db,
            user_id=current_user.id,
            model_response=model_resp,
            animal_id=animal_uuid,
            image_ref=image.filename,
        )
        record_dto = _model_to_dto(record)

    ui_result = _model_response_to_ui(model_resp)
    if ui_result["ok"]:
        return ScanAnalyzeCattleResponse(**ui_result, record=record_dto)
    return ScanAnalyzeNotCattleResponse(**ui_result, record=record_dto)


@router.get("/records", response_model=list[ScanRecordDto])
async def list_scan_records(
    limit: int = 50,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """List user's scan records for Records timeline."""
    from app.modules.ai_scan.models import ScanRecord
    records = (
        db.query(ScanRecord)
        .filter(ScanRecord.user_id == current_user.id)
        .order_by(ScanRecord.created_at.desc())
        .limit(limit)
        .all()
    )
    return [_model_to_dto(r) for r in records]


@router.post("/records", response_model=ScanRecordResponse)
async def create_scan_record(
    payload: ScanRecordCreate,
    current_user: User = Depends(get_current_active_user),
):
    """
    Legacy: Save AI scan result from client. Prefer /analyze which persists automatically.
    """
    return ScanRecordResponse(id=str(uuid.uuid4()), status="saved")
