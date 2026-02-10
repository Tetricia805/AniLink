# Model Service Migration Report

## Summary

FMD detection has been migrated from browser-side ONNX (onnxruntime-web, WASM) to a dedicated **model-service** container that runs ONNX inference in Python. The main backend calls model-service over the Docker network; the frontend only calls the backend API.

---

## 1. Frontend Changes — Removed

| Item | Status |
|------|--------|
| `onnxruntime-web` dependency | Removed from package.json and package-lock.json |
| Postinstall script copying WASM | None (scripts/copy-onnx-wasm.cjs removed) |
| `/public/onnx` folder | Not used |
| `/public/models/*.onnx` | Removed (no browser inference) |
| `src/lib/onnx/*` (config, inference, etc.) | Removed (lib/onnx did not exist in current tree; pages no longer import from it) |
| Model Debug Panel (threshold slider, Run analysis) | Removed from QuickScanPage |
| Debug Output card | Removed |
| Browser ONNX inference | All scan pages now use backend API only |
| Deprecated docs `ONNX_WASM_FIX_REPORT.md`, `ONNX_WEB_INTEGRATION_REPORT.md` | Deleted |

---

## 2. New / Updated Files

### Model Service (`backend/model-service/`)

| File | Purpose |
|------|---------|
| `Dockerfile` | Builds Python image with ONNX Runtime |
| `requirements-base.txt` | fastapi, uvicorn, pillow, numpy, python-multipart |
| `requirements.txt` | onnxruntime==1.18.0 |
| `main.py` | FastAPI app: GET /health, POST /infer |
| `inference.py` | Cattle gate + FMD inference (matches app_onnx.py logic) |
| `utils.py` | Image load + preprocess (224x224, ImageNet mean/std, CHW) |

### Backend (`backend/app/`)

| File | Purpose |
|------|---------|
| `modules/ai_scan/models.py` | `ScanRecord` model for DB persistence |
| `modules/ai_scan/service.py` | `call_model_service()`, `persist_scan_record()` |
| `modules/ai_scan/router.py` | Refactored to call model-service, persist, return record |
| `modules/ai_scan/schemas.py` | Added `ScanRecordDto` |
| `core/config.py` | Added `MODEL_SERVICE_URL` |
| `alembic/versions/011_scan_records.py` | Migration for `scan_records` table |
| `alembic/env.py` | Import `ScanRecord` model |
| `requirements.txt` | Added httpx |

### Frontend (`anilink-web/`)

| File | Purpose |
|------|---------|
| `src/api/scan.ts` | `analyzeScanImage()`, `fetchScanRecords()` |
| `src/hooks/useScanRecords.ts` | `useScanRecords()` – fetches GET /v1/ai-scan/records |
| `src/lib/queryClient.ts` | Added `SCAN_RECORDS_QUERY_KEY` |
| `src/pages/records.tsx` | Merges API scan records + local store |
| `src/pages/home.tsx` | Same scan records merge for dashboard |
| `src/pages/QuickScanPage.tsx` | Invalidate scan records on analyze success |
| `src/pages/RecordsScanPage.tsx` | Invalidate scan records on analyze success |

### Deleted

| File | Reason |
|------|--------|
| `backend/app/modules/ai_scan/onnx_inference.py` | Inference moved to model-service |
| `anilink-web/docs/ONNX_WASM_FIX_REPORT.md` | Legacy ONNX docs |
| `anilink-web/docs/ONNX_WEB_INTEGRATION_REPORT.md` | Legacy ONNX docs |

---

## 3. Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` (model-service) | Health check |
| POST | `/infer` (model-service) | Multipart: file, threshold; returns cattle/FMD result |
| POST | `/v1/ai-scan/analyze` | Auth required; multipart image + optional threshold, animal_id; persists and returns analysis + record |
| GET | `/v1/ai-scan/records` | Auth required; list user's scan records |

---

## 4. Docker Compose

| Service | Changes |
|---------|---------|
| `model-service` | New; build `./model-service`, mount `../Updated_detection_Models:/models:ro`, expose 9002 |
| `backend` | `depends_on: model-service`; env `MODEL_SERVICE_URL=http://model-service:9002`; removed Pillow/onnxruntime from command |

---

## 5. How to Run

1. **Migrations**

   ```bash
   cd backend
   docker compose up -d db minio
   docker compose run --rm init
   ```

   Or use `docker compose up` to start the full stack (init runs automatically).

2. **Stack**

   ```bash
   cd backend
   docker compose up --build -d
   ```

3. **Frontend** (separate)

   ```bash
   cd anilink-web
   npm install
   npm run dev
   ```

---

## 6. Verification

- Login as owner → /scan → upload cattle image → Analyze → result appears
- Result shows label, confidence, cattle probability, not-cattle warning, recommended actions
- Record appears in /records timeline under Scans tab (fetched from GET /v1/ai-scan/records)
- No browser ONNX or WASM assets
- No “Run analysis” or threshold debug panel
- AI Health Scan = FMD detection (no separate FMD button)
