"""AI Scan service: calls model-service and persists results."""

import json
import uuid
from typing import Optional

import httpx
from sqlalchemy.orm import Session

from app.core.config import settings
from app.modules.ai_scan.models import ScanRecord


def call_model_service(
    file_contents: bytes,
    filename: str,
    threshold: float = 0.5,
) -> dict:
    """
    Call model-service POST /infer with the image file.
    Returns model-service response dict.
    """
    url = f"{settings.MODEL_SERVICE_URL.rstrip('/')}/infer"
    files = {"file": (filename, file_contents, "image/jpeg")}
    data = {"threshold": str(threshold)}

    with httpx.Client(timeout=30.0) as client:
        resp = client.post(url, files=files, data=data)
        resp.raise_for_status()
        return resp.json()


def persist_scan_record(
    db: Session,
    user_id: uuid.UUID,
    model_response: dict,
    animal_id: Optional[uuid.UUID] = None,
    image_ref: Optional[str] = None,
) -> ScanRecord:
    """Save scan result to DB."""
    record = ScanRecord(
        id=uuid.uuid4(),
        user_id=user_id,
        animal_id=animal_id,
        scan_type="FMD_SCAN",
        threshold_used=model_response.get("threshold", 0.5),
        cattle_prob=model_response["cattle_prob"],
        non_cattle_prob=model_response["non_cattle_prob"],
        passed_gate=model_response["passed_gate"],
        gate_rule=model_response.get("gate_rule"),
        fmd_label=model_response.get("fmd", {}).get("label") if model_response.get("fmd") else None,
        fmd_confidence=model_response.get("fmd", {}).get("confidence") if model_response.get("fmd") else None,
        raw_json=model_response,
        image_ref=image_ref,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
