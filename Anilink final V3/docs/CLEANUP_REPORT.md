# AniLink Cleanup Report

**Date:** 2025-02-09  
**Scope:** Production-safe cleanup only (no refactors, no new features).

---

## 1. Files removed

| Path | Reason |
|------|--------|
| `anilink-web/src/pages/CartPage.tsx` | Duplicate; route uses `cart.tsx` for CartPage. |
| `anilink-web/src/app/components/ui/badge.tsx` | Duplicate; app uses `@/components/ui/*`. |
| `anilink-web/src/app/components/ui/button.tsx` | Duplicate. |
| `anilink-web/src/app/components/ui/card.tsx` | Duplicate. |
| `anilink-web/src/app/components/ui/input.tsx` | Duplicate. |
| `anilink-web/src/data/vets.ts` | Unused; vets loaded via API (`useVets`). |
| `anilink-web/src/assets/illustrations/empty-farm.svg` | Unreferenced. |
| `anilink-web/src/assets/illustrations/empty-search.svg` | Unreferenced. |
| `scripts/convert-onnx-to-embedded.py` | Not referenced by Docker or runtime. |
| `scripts/export_onnx_embedded.py` | Not referenced by Docker or runtime. |
| `scripts/requirements-export.txt` | Used only by removed export scripts. |

**Empty directories removed:**

- `anilink-web/src/app/` (and `app/components/`, `app/components/ui/`)
- `anilink-web/src/assets/illustrations/`
- `anilink-web/src/assets/` (after illustrations removed)

---

## 2. Files kept intentionally

- **SellerInventoryPage.tsx** — Linked from Seller dashboard; route `/seller/inventory` is missing in AppRoutes (pre-existing; adding route is out of scope for this cleanup).
- **ProductCard, Chip, RatingStars, SectionHeader** — Unused UI components; left in place (marked “review” in audit).
- **backend/assets/models/** — Not used by Docker (compose uses `Updated_detection_Models/`); left in place (review).
- **backend/docs/, backend *.md** — Kept.
- **docs/** — No docs deleted.
- **Cattle&FMD_detection_trained_models/** — Not in Docker; kept (review).
- **Updated_detection_Models/** — In use by Docker model-service; only `.onnx` and docs used; `app_onnx.py` and `convert_to_selfcontained.py` left in place (review).
- **packages/shared** — Monorepo package; kept.
- **backend/scripts/seed_data.py**, **backend/scripts/smoke_test.py** — seed_data used by Docker init; smoke_test kept as test script.

---

## 3. Confirmation that no functionality was removed

- **Routes:** All routes in `AppRoutes.tsx` unchanged. Cart still uses `@/pages/cart` → `cart.tsx` (CartPage).
- **React Query hooks:** No hooks removed or changed.
- **Backend:** No modules or routers removed; `main.py` unchanged.
- **Docker:** `docker-compose.yml` unchanged. Init still runs `backend/scripts/seed_data.py`. Model-service still mounts `Updated_detection_Models/`.
- **Scan flow:** No changes to scan pages, API, or model-service. AI scan → save → records flow intact.
- **Notifications:** No changes to notification routing or NotificationsPage; “View Details” still uses existing routes.

**Fix applied during verification:**

- **QuickScanPage.tsx:** Removed unused imports `ANIMALS_QUERY_KEY` and `ScanAnalyzeResponse` so `npm run build` passes (pre-existing TS6133; not introduced by cleanup).

---

## 4. Verification

| Check | Result |
|-------|--------|
| `npm run build` (anilink-web) | Passes (tsc + vite build). |
| `docker compose config` (backend) | Valid. |
| No broken imports from removed files | Confirmed (no references to removed paths). |

*Manual checks recommended:* `npm run dev` (web), `docker compose up` (backend), full scan flow (upload → result → save → records), and Notifications → View Details in the app.

---

## 5. Remaining intentional technical debt

- **Missing route:** `/seller/inventory` is linked from Seller dashboard but has no route in `AppRoutes`; `SellerInventoryPage` exists. Fix: add a route under the Seller layout (out of scope for this cleanup).
- **Unused UI components:** `ProductCard`, `Chip`, `RatingStars`, `SectionHeader` are never imported; can be removed in a future cleanup or used when needed.
- **Root `scripts/` folder:** Now empty; can be removed or repurposed.
- **backend/assets/models/** and **Cattle&FMD_detection_trained_models/**: Not used by current Docker setup; left for reference/backup.

---

*Cleanup completed. No logic or UI behavior was refactored or redesigned.*
