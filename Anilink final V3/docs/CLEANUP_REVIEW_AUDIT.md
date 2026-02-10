# Cleanup Review Audit

**Date:** 2025-02-09  
**Scope:** Review candidates from previous cleanup; remove only those with zero references.

---

## 1. Frontend (anilink-web)

| Candidate | Search result (imports/usage) | References | Verdict |
|-----------|-------------------------------|------------|---------|
| `anilink-web/src/components/ui/ProductCard.tsx` | Grep for `ProductCard`, `components/ui/ProductCard`: no imports in any TS/TSX. Only definition in ProductCard.tsx and mentions in docs (CLEANUP_AUDIT, CLEANUP_REPORT). | **Zero** code references | **SAFE_REMOVE** |
| `anilink-web/src/components/ui/Chip.tsx` | Grep for `Chip`, `components/ui/Chip`: no imports. Only definition in Chip.tsx. Docs mention "ChipFilter" (different). | **Zero** code references | **SAFE_REMOVE** |
| `anilink-web/src/components/ui/RatingStars.tsx` | Grep for `RatingStars`: no imports. Only definition and doc mentions (FULL_IMPLEMENTATION_STATUS, COMPLIANCE_REPORT). | **Zero** code references | **SAFE_REMOVE** |
| `anilink-web/src/components/ui/SectionHeader.tsx` | Grep for `SectionHeader`: no import of this file in anilink-web. `apps/mobile` has its own SectionHeader; docs mention SectionHeader. anilink-web uses PageHeader instead. | **Zero** code references in anilink-web | **SAFE_REMOVE** |

---

## 2. Backend / root

| Candidate | Search result (imports/usage) | References | Verdict |
|-----------|-------------------------------|------------|---------|
| `backend/assets/models/cattle_detection.onnx` | Docker model-service mounts `Updated_detection_Models` to `/models` and sets `MODEL_CATTLE_PATH=/models/cattle_detection.onnx`. No mount or env points to `backend/assets/models`. No Python import of this path. | **Zero** (Docker uses Updated_detection_Models only) | **SAFE_REMOVE** |
| `backend/assets/models/fmd_detection.onnx` | Same as above. | **Zero** | **SAFE_REMOVE** |
| `backend/scripts/smoke_test.py` | Not in docker-compose or any Python import. Only self-doc ("Run: python scripts/smoke_test.py") and doc mentions. | **Zero** runtime references | **SAFE_REMOVE** |
| `Updated_detection_Models/app_onnx.py` | `backend/model-service/inference.py` and `utils.py` reference it in comments ("Reference: Updated_detection_Models/app_onnx.py", "Matches app_onnx.py"). Not imported, but cited as logic reference. | **Referenced** in code comments | **KEEP** |
| `Updated_detection_Models/convert_to_selfcontained.py` | No Docker or Python import. Only self-doc inside the file. | **Zero** references | **SAFE_REMOVE** |
| `Cattle&FMD_detection_trained_models/` (entire folder) | `Updated_detection_Models/app_onnx.py` sets `MODELS_DIR = os.path.join(SCRIPT_DIR, 'Cattle&FMD_detection_trained_models')` and loads ONNX from there. Folder is used when app_onnx.py is run. | **Referenced** by app_onnx.py | **KEEP** |

---

## 3. Guardrails (no action)

- **Updated_detection_Models/cattle_detection.onnx** and **Updated_detection_Models/fmd_detection.onnx** — Used by Docker model-service; **do not touch**.
- **SellerInventoryPage.tsx** — Not a candidate; **do not delete** (route missing bug; file must remain).

---

## 4. Summary

| Verdict | Items |
|---------|--------|
| **SAFE_REMOVE** | ProductCard.tsx, Chip.tsx, RatingStars.tsx, SectionHeader.tsx; backend/assets/models/cattle_detection.onnx, backend/assets/models/fmd_detection.onnx; backend/scripts/smoke_test.py; Updated_detection_Models/convert_to_selfcontained.py |
| **KEEP** | Updated_detection_Models/app_onnx.py (referenced in inference/utils comments); Cattle&FMD_detection_trained_models/ (referenced by app_onnx.py) |
