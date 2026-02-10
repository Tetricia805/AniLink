"""Model Service: ONNX inference for cattle + FMD detection."""

import os
from fastapi import FastAPI, File, Form, UploadFile, HTTPException

from inference import run_inference

app = FastAPI(
    title="AniLink Model Service",
    description="ONNX inference for cattle detection and FMD classification",
    version="1.0.0",
)

CATTLE_PATH = os.getenv("MODEL_CATTLE_PATH", "/models/cattle_detection.onnx")
FMD_PATH = os.getenv("MODEL_FMD_PATH", "/models/fmd_detection.onnx")


@app.get("/health")
async def health():
    return {"ok": True}


@app.post("/infer")
async def infer(
    file: UploadFile = File(..., description="Image file (PNG, JPG)"),
    threshold: float = Form(0.5, description="Cattle detection threshold"),
):
    """Run cattle + FMD inference on uploaded image."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(400, "File must be an image (PNG, JPG)")

    contents = await file.read()
    if not contents:
        raise HTTPException(400, "Empty file")

    if not os.path.exists(CATTLE_PATH):
        raise HTTPException(503, f"Cattle model not found at {CATTLE_PATH}")
    if not os.path.exists(FMD_PATH):
        raise HTTPException(503, f"FMD model not found at {FMD_PATH}")

    try:
        result = run_inference(
            contents,
            threshold=threshold,
            cattle_path=CATTLE_PATH,
            fmd_path=FMD_PATH,
        )
        return result
    except Exception as e:
        raise HTTPException(500, f"Inference failed: {e}") from e
