# AniLink Cleanup Audit

**Date:** 2025-02-09  
**Scope:** Frontend (anilink-web/), Backend (backend/), Docs (docs/).  
**Rule:** Do NOT delete anything in this step. This document lists candidates for removal and their risk level.

---

## 1. Reference summary

### Routes (AppRoutes.tsx)

All page components imported and used: landing, login, register, PermissionsPage, TermsPage, PrivacyPage, ForgotPasswordPage, ResetPasswordPage, home, vets, vets-map, vet-details, marketplace, ProductDetailPage, **cart** (import path `@/pages/cart` → `cart.tsx`), OrdersPage, OrderDetailPage, QuickScanPage, SymptomCheckerPage, RecordsScanPage, records, appointments, NotificationsPage, profile, SettingsPage, checkout, Vet*, Admin*, SellerDashboardPage, SellerProductsPage, SellerOrdersPage, SellerPayoutsPage, SellerProfilePage.

**Note:** `/seller/inventory` is linked from SellerDashboardPage but has **no route** in AppRoutes. SellerInventoryPage.tsx exists and is the intended page; the route is missing (bug). **Do not remove** SellerInventoryPage.

### Backend routers (main.py)

All included: auth, users, vets, bookings, animals, cases, ai, ai_scan, marketplace, orders, notifications, seller, admin.

### Docker (backend/docker-compose.yml)

Services: model-service (uses `Updated_detection_Models/`), db, minio, init (runs migrations + seed_data.py), backend, pgadmin. No reference to root `scripts/`, root `Cattle&FMD_detection_trained_models/`, or `backend/assets/`.

---

## 2. Frontend (anilink-web/)

| File path | Why it appears unused | What replaced it (if applicable) | Risk |
|-----------|------------------------|-----------------------------------|------|
| `src/pages/CartPage.tsx` | Route imports `CartPage` from `@/pages/cart` (i.e. `cart.tsx`). This file is never imported. | `cart.tsx` (full cart with store, items, checkout link) | **safe** |
| `src/app/components/ui/badge.tsx` | Duplicate of `src/components/ui/badge.tsx`. No import references `app/components` anywhere. | `@/components/ui/*` used app-wide | **safe** |
| `src/app/components/ui/button.tsx` | Same as above. | `@/components/ui/button.tsx` | **safe** |
| `src/app/components/ui/card.tsx` | Same as above. | `@/components/ui/card.tsx` | **safe** |
| `src/app/components/ui/input.tsx` | Same as above. | `@/components/ui/input.tsx` | **safe** |
| `src/data/vets.ts` | No file imports from `@/data/vets`. Vets are loaded via API (`useVets`). | API + useVets hook | **safe** |
| `src/assets/illustrations/empty-farm.svg` | No import or path reference in codebase. EmptyState supports `illustration` prop but no caller passes these assets. | None (unused) | **safe** |
| `src/assets/illustrations/empty-search.svg` | Same as above. | None (unused) | **safe** |
| `src/components/ui/ProductCard.tsx` | No file imports ProductCard. Marketplace uses inline Card layout. | Inline product cards in marketplace.tsx | **review** |
| `src/components/ui/Chip.tsx` | No file imports Chip. | Not replaced (unused component) | **review** |
| `src/components/ui/RatingStars.tsx` | No file imports RatingStars. | Not replaced (unused component) | **review** |
| `src/components/ui/SectionHeader.tsx` | No file imports SectionHeader. PageHeader (layout) is used instead. | PageHeader in layout | **review** |
| `src/STRUCTURE.md` | Documentation only; not referenced by build or code. | N/A | **keep** |

---

## 3. Backend (backend/)

| File path | Why it appears unused | What replaced it (if applicable) | Risk |
|-----------|------------------------|-----------------------------------|------|
| `assets/models/cattle_detection.onnx` | Not referenced in Python code or docker-compose. Model-service mounts `../Updated_detection_Models` only. | Updated_detection_Models/ used by Docker | **review** |
| `assets/models/fmd_detection.onnx` | Same as above. | Updated_detection_Models/ used by Docker | **review** |
| `BACKEND_COMPLIANCE_ANALYSIS.md` | Doc at backend root; not referenced by runtime. | N/A | **keep** |
| `BACKEND_IMPLEMENTATION_SUMMARY.md` | Same. | N/A | **keep** |
| `BACKEND_STATUS.md` | Same. | N/A | **keep** |
| `FINAL_STATUS.md` | Same. | N/A | **keep** |
| `docs/CASE_NOTIFICATIONS_QA.md` | Doc under backend/docs; not referenced by runtime. | N/A | **keep** |
| `scripts/seed_data.py` | **Used by Docker** (init service: `python scripts/seed_data.py`). | — | **keep** |
| `scripts/smoke_test.py` | Not referenced in Docker or main app. Manual/test script. | N/A | **review** |

---

## 4. Docs (docs/)

All under `docs/` are documentation only. None are imported by frontend or backend code. Superseded content (per MODEL_SERVICE_MIGRATION_REPORT): ONNX_WASM_FIX_REPORT.md and ONNX_WEB_INTEGRATION_REPORT.md were already deleted. Remaining docs are kept unless explicitly deprecated by another doc.

| File path | Note | Risk |
|-----------|------|------|
| `docs/ADMIN_AUDIT.md` | Current/reference | **keep** |
| `docs/ADMIN_QA.md` | Current/reference | **keep** |
| `docs/AI_SCAN_UX_FIX_REPORT.md` | Current/reference | **keep** |
| `docs/AUTH_*.md` | Current/reference | **keep** |
| `docs/COMPLIANCE_REPORT.md` | Current/reference | **keep** |
| `docs/DESIGN_REFERENCE_ANILINK.md` | Current/reference | **keep** |
| `docs/DEV_MOBILE.md` | Current/reference | **keep** |
| `docs/FRONTEND_BACKEND_*.md` | Current/reference | **keep** |
| `docs/FULL_IMPLEMENTATION_STATUS.md` | May supersede older status docs; no explicit deprecation | **keep** |
| `docs/INTEGRATION_*.md` | Current/reference | **keep** |
| `docs/MODEL_SERVICE_*.md` | Current/reference | **keep** |
| `docs/MOBILE_WEB_PARITY.md` | Current/reference | **keep** |
| `docs/NAVIGATION_GUIDE.md` | Current/reference | **keep** |
| `docs/NOTIFICATIONS_NAV_AND_SCAN_PERSISTENCE_FIX.md` | Current/reference | **keep** |
| `docs/QUICKSTART.md` | Current/reference | **keep** |
| `docs/ROLE_LABEL_FARMER_CHANGE.md` | Current/reference | **keep** |
| `docs/SCREEN_LIST.md` | Current/reference | **keep** |
| `docs/TROUBLESHOOTING_AUTH.md` | Current/reference | **keep** |
| `docs/VET_LOCATION_IMPLEMENTATION.md` | Current/reference | **keep** |
| `docs/WEB_CONNECTION_FIX.md` | Current/reference | **keep** |
| `docs/ui-*.png` | Screenshots | **keep** |

No docs marked for removal in this audit (cleanup-only; no “obsolete doc” sweep without explicit replacement).

---

## 5. Repository root / scripts / model assets

| File path | Why it appears unused | What replaced it (if applicable) | Risk |
|-----------|------------------------|-----------------------------------|------|
| `scripts/convert-onnx-to-embedded.py` | Not referenced by Docker or backend runtime. Export/embedding script. | Backend uses model-service; no browser ONNX | **safe** |
| `scripts/export_onnx_embedded.py` | Same. | Same | **safe** |
| `scripts/requirements-export.txt` | Used only by export scripts above. | N/A | **safe** (remove with scripts if scripts removed) |
| `Updated_detection_Models/app_onnx.py` | Not in Docker. model-service uses `backend/model-service/inference.py`. | backend/model-service/inference.py | **review** |
| `Updated_detection_Models/convert_to_selfcontained.py` | Not in Docker. Utility script. | N/A | **review** |
| `Updated_detection_Models/REACT_NATIVE_INTEGRATION.md` | Doc. | N/A | **keep** |
| `Updated_detection_Models/README.md` | Doc. | N/A | **keep** |
| `Cattle&FMD_detection_trained_models/` (entire folder) | Not mounted in Docker. Docker uses `Updated_detection_Models/` for ONNX files. | Updated_detection_Models/ | **review** |

**Note:** `Updated_detection_Models/cattle_detection.onnx` and `fmd_detection.onnx` are **in use** by Docker model-service. Do not remove those two files or the folder’s use by compose.

---

## 6. Intentionally kept (not unused)

- **SellerInventoryPage.tsx** — Linked from SellerDashboardPage (`/seller/inventory`). Route is missing in AppRoutes (bug). File kept; adding route is out of scope for cleanup.
- **All route-registered pages** — Listed in §1; all kept.
- **All backend modules and routers** — Included in main.py; kept.
- **EmptyState, LoadingSkeleton, ErrorState** — Used across pages; kept.
- **data/scan.ts, data/speciesWithIcons.ts** — Used by scan flow and AddAnimalSheet; kept.
- **config/env.ts** — Used by api/http and LocationPickerSheet; kept.
- **lib/utils.ts** — Used by many components (cn); kept.
- **All hooks (useAdmin, useBookings, etc.)** — Used; kept.
- **packages/shared** — Monorepo package; not imported by anilink-web (web uses local types/api); keep (may be used by apps/mobile or future use).

---

## 7. Summary

| Risk level | Action |
|------------|--------|
| **safe** | Candidate for removal in Step 3 (duplicate/unused/obsolete scripts). |
| **review** | Verify before removal; optional to leave in place. |
| **keep** | Do not remove. |

**Safe to remove (Step 3):**

- `anilink-web/src/pages/CartPage.tsx`
- `anilink-web/src/app/` (entire folder: 4 UI files)
- `anilink-web/src/data/vets.ts`
- `anilink-web/src/assets/illustrations/empty-farm.svg`
- `anilink-web/src/assets/illustrations/empty-search.svg`
- `scripts/convert-onnx-to-embedded.py`
- `scripts/export_onnx_embedded.py`
- `scripts/requirements-export.txt`

**Review before removal:** ProductCard, Chip, RatingStars, SectionHeader (unused UI); backend/assets/models; scripts/smoke_test.py; Updated_detection_Models app_onnx.py & convert script; Cattle&FMD_detection_trained_models folder.

**Do not remove:** All routed pages, all backend routers, Docker-referenced paths, shared types/constants, SellerInventoryPage, seed_data.py, and docs (unless explicitly deprecated).

---

*Audit complete. No deletions performed. Proceed to Step 3 only for items marked **safe**.*
