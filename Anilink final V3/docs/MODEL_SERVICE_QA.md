# Model Service QA Checklist

## Overview

The FMD/AI scan runs in a dedicated `model-service` container (Python ONNX) and is called by the main backend. The frontend never runs ONNX inference.

---

## 1. Start the Stack

From the project root:

```bash
cd backend
docker compose up --build -d
```

(Based on `backend/docker-compose.yml`.)

This starts:
- **db** (Postgres)
- **minio** (object storage)
- **init** (runs migrations + seed)
- **model-service** (ONNX inference on port 9002)
- **backend** (FastAPI on port 8000)

---

## 2. Test Model Service Directly

Port 9002 is internal by default. For local testing, uncomment `ports: ["9002:9002"]` in `backend/docker-compose.yml` under `model-service`, then:

```bash
curl -F "file=@path/to/cattle.jpg" -F "threshold=0.75" http://localhost:9002/infer
```

Example response (cattle detected, FMD healthy):

```json
{
  "ok": true,
  "threshold": 0.75,
  "cattle_prob": 0.92,
  "non_cattle_prob": 0.08,
  "passed_gate": true,
  "gate_rule": "passed",
  "fmd": {
    "label": "HEALTHY",
    "confidence": 0.89,
    "probs": { "healthy": 0.89, "infected": 0.11 }
  }
}
```

---

## 3. Test via Backend (Auth Required)

1. Login to get a token:

```bash
curl -X POST http://localhost:8000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@example.com","password":"password123"}'
```

2. Use the `accessToken` from the response:

```bash
curl -H "Authorization: Bearer <TOKEN>" \
  -F "image=@path/to/cattle.jpg" \
  -F "threshold=0.75" \
  http://localhost:8000/v1/ai-scan/analyze
```

---

## 4. UI Verification

1. **Login** as owner (e.g. `owner@example.com` / `password123`)
2. Go to **/scan** (Quick Scan)
3. Upload a cattle image
4. Click **Analyze**
5. Confirm result appears (label, confidence, cattle probability, recommended actions)
6. Go to **/records**
7. Confirm the scan appears in the timeline under the "Scans" tab

---

## 5. Health Check

```bash
curl http://localhost:9002/health
# {"ok": true}
```
