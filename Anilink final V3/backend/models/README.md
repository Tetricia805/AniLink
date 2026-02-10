# Backend models

This folder holds the ONNX models used by the **model-service** container for cattle and FMD detection.

## Required files

- `cattle_detection.onnx` — cattle gate model
- `fmd_detection.onnx` — FMD detection model

They are mounted read-only into the container at `/models`; the service reads them via `MODEL_CATTLE_PATH` and `MODEL_FMD_PATH` (see `docker-compose.yml`).

## Source

If you need to refresh these files, copy them from the project’s `Updated_detection_Models/` folder (or from wherever you export/generate the ONNX models).
