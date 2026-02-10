# AI Scan UX Fix Report

## Summary

This report documents the UX and data fixes applied to the AI Health Scan flow, Records page, and save-to-records behavior.

---

## 1. Changes Made

### A) Records Scan UI

| Change | Description |
|--------|-------------|
| **Scans / AI Cases section** | When no animal is selected on Records page, the right panel now shows a dedicated "Scans / AI Cases" section listing all backend scan records from `GET /v1/ai-scan/records` |
| **Scan cards** | Each scan is rendered as a card with: label (FMD result or NOT_CATTLE), date, animal name (if linked), and "View Details" button |
| **ScanRecordDetailsSheet** | New drawer component for scan details: date, label, cattle confidence, FMD result, gate rule, animal name. Includes "Start Scan" and "Book Vet" actions |
| **focusScan URL support** | `/records?focusScan=<id>` switches to scan view, scrolls to the scan card, and auto-opens the details drawer |
| **handleViewDetails** | Distinguishes scan records from case records; opens `ScanRecordDetailsSheet` for scans, `RecordDetailsSheet` for cases |

### B) Notification Routing

| Change | Description |
|--------|-------------|
| **entityType: 'scan'** | Added to `getNotificationHref()`: scan notifications route to `/records?focusScan=<entityId>` for OWNER role |
| **Home page** | Latest scan card "View details" now uses `/records?focusScan=${latestScan.id}` instead of `animalId` + `highlight` |

### C) Scan Flow Split

| Change | Description |
|--------|-------------|
| **Navbar "Scan"** | Routes to `/scan` (QuickScanPage) — upload → analyze → result. No symptoms step |
| **Symptom Checker** | Separate route `/scan/symptoms` (SymptomCheckerPage) |
| **RecordsScanPage** | Removed symptoms step. Flow: select-animal → photos → results (3 steps, was 4) |
| **RecordsScanPage subtitle** | Updated to "select animal, upload photo" |

### D) Save Logic (Animal Required)

| Change | Description |
|--------|-------------|
| **Backend** | `POST /v1/ai-scan/analyze` only persists when `animal_id` is provided. Returns analysis without record when `animal_id` is null |
| **QuickScanPage** | Analyze called without `animal_id` → no persistence. "Save to Records" opens `SaveToRecordsModal` |
| **SaveToRecordsModal** | If animals exist: show animal picker; on select, re-call analyze with `animal_id` to persist. If no animals: show "Register an animal to save this scan" with "Register Animal" (opens AddAnimalSheet) and "Not now" |
| **Register Animal flow** | AddAnimalSheet → on success → auto-save scan with newly created animal (re-call analyze with new animal_id) |
| **RecordsScanPage** | Always has selected animal when reaching results; analyze is called with `animal_id`, so record is persisted. "Save to Records" navigates to `/records?focusScan=<id>` |

### E) Data Correctness

| Change | Description |
|--------|-------------|
| **Backend persistence** | `persist_scan_record()` only called when `animal_uuid is not None` |
| **Query invalidation** | After save: `SCAN_RECORDS_QUERY_KEY`, `ANIMALS_QUERY_KEY` invalidation where applicable |

---

## 2. Routes and Focus Params

| Route | Purpose |
|-------|---------|
| `/scan` | AI Health Scan (QuickScanPage): upload → analyze → result |
| `/scan/symptoms` | Symptom Checker (separate feature) |
| `/records` | Records page |
| `/records?animalId=<id>` | Records with animal pre-selected |
| `/records?focusCase=<caseId>` | Records with case focused; opens case details |
| `/records?focusScan=<scanId>` | Records with scan focused; opens scan details drawer |

---

## 3. How to Test

### Test 1: AI Scan without animals
1. Login as owner
2. Ensure no animals are registered (or use a fresh account)
3. Go to `/scan`
4. Upload a cattle image
5. Click **Analyze**
6. Verify result appears (no persistence)
7. Click **Save to Records**
8. Verify modal: "Register an animal to save this scan" with "Register Animal" and "Not now"
9. Click **Register Animal** → fill form → submit
10. Verify scan is saved and linked to new animal
11. Go to `/records` → verify scan appears in "Scans / AI Cases" section

### Test 2: AI Scan with animals
1. Login as owner with at least one animal
2. Go to `/scan`
3. Upload cattle image
4. Click **Analyze**
5. Click **Save to Records**
6. Verify animal picker modal
7. Select animal → verify save and toast
8. Go to `/records` → verify scan appears

### Test 3: Records Scan wizard (no symptoms)
1. Go to `/records`
2. Select an animal
3. Click "Add record" → "Start Scan" (or `/records/scan?animalId=...`)
4. Verify flow: Select Animal → Upload Photos → Analyze (no symptoms step)
5. Complete scan → verify record saved and navigation to records

### Test 4: focusScan URL
1. Complete a scan (with animal)
2. Note the scan record id from the URL after "Save to Records" (e.g. `/records?focusScan=xxx`)
3. Or: go to `/records`, click a scan card "View Details"
4. Copy URL with `focusScan`
5. Open in new tab or navigate away and back
6. Verify: scan tab/content shown, scan card highlighted, details drawer open

### Test 5: Home page scan card
1. Have at least one scan record
2. Go to `/home`
3. Click the "Health scan completed" card in Recent Activity
4. Verify navigation to `/records?focusScan=<id>` and scan details open

### Test 6: No persistence without animal
1. Go to `/scan`
2. Upload image, Analyze (no animal selected)
3. Check backend/DB: no new scan record should exist
4. Click "Save to Records" → select animal
5. Check backend/DB: new scan record with `animal_id` should exist

---

## 4. Files Changed

| File | Changes |
|------|---------|
| `backend/app/modules/ai_scan/router.py` | Only persist when `animal_id` provided |
| `anilink-web/src/lib/notificationRouting.ts` | Added `entityType: 'scan'` → `focusScan` |
| `anilink-web/src/hooks/useScanRecords.ts` | Added `useScanRecordsRaw`, exported `scanRecordToTimeline` |
| `anilink-web/src/pages/QuickScanPage.tsx` | Save modal, AddAnimalSheet, no persistence on analyze without animal |
| `anilink-web/src/pages/RecordsScanPage.tsx` | Removed symptoms step; 3-step flow |
| `anilink-web/src/pages/records.tsx` | Scans section, focusScan, ScanRecordDetailsSheet |
| `anilink-web/src/pages/home.tsx` | Latest scan href → `focusScan` |
| `anilink-web/src/components/scan/SaveToRecordsModal.tsx` | New: animal picker / register modal |
| `anilink-web/src/components/records/ScanRecordDetailsSheet.tsx` | New: scan details drawer |
