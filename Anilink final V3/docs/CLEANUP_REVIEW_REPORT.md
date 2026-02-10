# Cleanup Review Report

**Date:** 2025-02-09  
**Scope:** Review-step cleanup only. No refactors, no feature changes, no behavior changes.

---

## 1. What was removed

All items below had **zero** references (no imports, no Docker/runtime use).

### Frontend (anilink-web)

| File | Reason |
|------|--------|
| `anilink-web/src/components/ui/ProductCard.tsx` | No imports anywhere; marketplace uses inline Card layout. |
| `anilink-web/src/components/ui/Chip.tsx` | No imports anywhere. |
| `anilink-web/src/components/ui/RatingStars.tsx` | No imports anywhere. |
| `anilink-web/src/components/ui/SectionHeader.tsx` | No imports in anilink-web; app uses PageHeader. (apps/mobile has its own SectionHeader.) |

### Backend / root

| File | Reason |
|------|--------|
| `backend/assets/models/cattle_detection.onnx` | Not used by Docker or code; model-service mounts `Updated_detection_Models` only. |
| `backend/assets/models/fmd_detection.onnx` | Same. |
| `backend/scripts/smoke_test.py` | Not in docker-compose or any import; manual test script only. |
| `Updated_detection_Models/convert_to_selfcontained.py` | No Docker or Python import; usage only in self-doc. |

**Note:** No empty directories were removed in this step (e.g. `backend/assets/models/` may still exist and is harmless).

---

## 2. What was kept and why

| Item | Reason |
|------|--------|
| **Updated_detection_Models/app_onnx.py** | Referenced in `backend/model-service/inference.py` and `utils.py` as the logic reference ("Reference: Updated_detection_Models/app_onnx.py", "Matches app_onnx.py"). Kept to avoid losing the reference implementation. |
| **Cattle&FMD_detection_trained_models/** (entire folder) | Referenced by `Updated_detection_Models/app_onnx.py` (`MODELS_DIR = ... 'Cattle&FMD_detection_trained_models'`). Used when app_onnx.py is run. Not used by Docker; Docker uses only `Updated_detection_Models` for model-service. |
| **Updated_detection_Models/cattle_detection.onnx** | **Guardrail:** Used by Docker model-service; not touched. |
| **Updated_detection_Models/fmd_detection.onnx** | **Guardrail:** Used by Docker model-service; not touched. |
| **SellerInventoryPage.tsx** | **Guardrail:** Not a candidate; file must remain (route missing bug). |

---

## 3. Proof of build checks

| Check | Result |
|-------|--------|
| **anilink-web:** `npm run build` | **Passed.** `tsc && vite build` completed successfully; no broken imports. |
| **backend:** `docker compose config` | **Valid.** Config parses; model-service still mounts `Updated_detection_Models` to `/models`; env `MODEL_CATTLE_PATH` / `MODEL_FMD_PATH` point to `/models/cattle_detection.onnx` and `/models/fmd_detection.onnx` (files in Updated_detection_Models, unchanged). |

No import fixes were required; removed components had no references.

---

## 4. Refused to delete (intentional)

- **app_onnx.py** — Referenced in comments in inference.py and utils.py; kept as reference implementation.
- **Cattle&FMD_detection_trained_models/** — Referenced by app_onnx.py; deleting would break running app_onnx.py.
- **Updated_detection_Models/*.onnx** — Explicit guardrail; Docker model-service uses them.
- **SellerInventoryPage.tsx** — Explicit guardrail; route bug; file kept.

---

## 5. Audit document

- **docs/CLEANUP_REVIEW_AUDIT.md** — Lists each candidate, search results for references, and SAFE_REMOVE vs KEEP verdict.

---

*Review cleanup complete. No behavior, routes, or logic changed.*
