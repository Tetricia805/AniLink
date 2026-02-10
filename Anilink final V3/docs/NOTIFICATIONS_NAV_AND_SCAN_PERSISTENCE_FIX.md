# Notifications Nav and Scan Persistence Fix

**Date:** 2025-02-09  
**Status:** Implemented

## Summary

This document describes changes to:
1. **Navigation**: Remove "Notifications" from the top nav bar, add "Symptom Checker", and keep notifications accessible only via the bell icon.
2. **Backend persistence**: Do not store healthy/low-urgency AI scans as cases/records; only persist when the animal is sick (FMD = INFECTED).
3. **Frontend UX**: Adjust Save-to-Records behavior so healthy scans show a "No case saved" message and hide the Save button.

---

## A) Navigation Changes

### New Nav Structure (Owner Role)

| Order | Label           | Path          | Icon     |
|-------|-----------------|---------------|----------|
| 1     | Home            | /home         | Home     |
| 2     | Scan            | /scan         | Scan     |
| 3     | Vets            | /vets         | Stethoscope |
| 4     | Shop            | /marketplace  | ShoppingCart |
| 5     | Records         | /records      | FileText |
| 6     | Symptom Checker | /scan/symptoms| HeartPulse |

**Removed:** Notifications nav link (was: `/notifications`).

**Notifications access:** Only via the bell icon in the top-right. The bell dropdown has a "View all" link that opens `/notifications`. Route unchanged.

### Routing

- Home "Symptom Checker" Quick Action card: `/scan/symptoms` (unchanged).
- New nav item "Symptom Checker": `/scan/symptoms` (same route).
- Role-based nav: **OWNER** uses the updated `OWNER_NAV_ITEMS`. **VET**, **ADMIN**, **SELLER** nav items unchanged.

---

## B) Backend Persistence Rules

### What counts as "healthy" (do NOT persist)

- `fmd.label == "HEALTHY"` (model output)
- `fmd` is `null` (e.g. NOT_CATTLE gate failed)

### What counts as "sick" (persist)

- `fmd.label == "INFECTED"`

### Logic used

```python
fmd_label = model_resp.get("fmd", {}).get("label") if model_resp.get("fmd") else None
should_persist = (
    animal_uuid is not None
    and fmd_label == "INFECTED"
)
```

- If `animal_id` is not provided, we never persist (behavior unchanged).
- If `animal_id` is provided and `fmd_label == "INFECTED"`, we persist to `ScanRecord` and return `record` in the response.
- If `animal_id` is provided and `fmd_label == "HEALTHY"` (or `fmd` is null), we **do not** persist, and return `record: null` in the response.

### Notifications

For AI scans, we only persist `ScanRecord` entries. We do **not** create "New case created" notifications for scan records. The Cases module creates notifications when a Case is created; scan records are separate and do not emit notifications.

---

## C) Frontend Save-to-Records UX

### Healthy / Low-urgency scan

- Show message: **"No case saved because scan indicates healthy/low risk."**
- Hide **"Save to Records"** button.
- Show **"View Records"** button when in Records-scan flow (links to records with animal context).
- Continue to show scan result, recommended actions, and other buttons (Book a Vet, Recommended Products, etc.).

### Sick / Medium–high urgency (FMD infected)

- Keep **"Save to Records"** button.
- Backend persists the scan record when `animal_id` is provided.
- Record appears in Records timeline; "View details" works.

---

## Files Changed

| File | Change |
|------|--------|
| `anilink-web/src/lib/navConfig.ts` | Replaced `notifications` with `symptom-checker` (path: `/scan/symptoms`, icon: HeartPulse) in `OWNER_NAV_ITEMS`. |
| `anilink-web/src/components/layout/navigation.tsx` | Removed notification badge from nav items; removed unused `useUnreadCount` import. |
| `backend/app/modules/ai_scan/router.py` | Added `should_persist` logic: only persist when `fmd_label == "INFECTED"` and `animal_uuid` is provided. |
| `anilink-web/src/lib/scan/scanResultMapper.ts` | Set `urgency: "Low"` for healthy; `urgency: "High"` for infected. Added `shouldPersist: isInfected`. |
| `anilink-web/src/types/scan.ts` | Added optional `shouldPersist?: boolean` to `ScanResult`. |
| `anilink-web/src/components/scan/ScanResultsView.tsx` | Show "No case saved" when `shouldPersist === false`; hide Save button; add optional `onViewRecords` for "View Records". |
| `anilink-web/src/pages/RecordsScanPage.tsx` | Pass `onViewRecords` to `ScanResultsView` for healthy-scan flow. |

---

## Manual Testing

### 1. Navigation

- [ ] Log in as **Owner**.
- [ ] Top nav shows: Home, Scan, Vets, Shop, Records, Symptom Checker (no Notifications).
- [ ] Bell icon is visible in top-right.
- [ ] Click bell → dropdown opens; "View all" goes to `/notifications`.
- [ ] Home Quick Actions: "Symptom Checker" links to `/scan/symptoms`.
- [ ] Nav "Symptom Checker" links to `/scan/symptoms`.

### 2. Healthy scan (no persistence)

- [ ] Open Quick Scan or Records scan.
- [ ] Use an image that yields **healthy** (no FMD signs).
- [ ] Result shows diagnosis "Healthy (no FMD signs)" and Low urgency.
- [ ] Message: "No case saved because scan indicates healthy/low risk."
- [ ] No "Save to Records" button (or "View Records" in Records flow).
- [ ] Check Records: no new scan record for this scan.
- [ ] Check notifications: no "New case created" for this scan.

### 3. Infected / sick scan (persistence)

- [ ] Open Records scan (or Quick Scan with animal selection).
- [ ] Use an image that yields **infected** (FMD signs).
- [ ] Result shows diagnosis "Foot-and-Mouth Disease risk" and High urgency.
- [ ] "Save to Records" button is visible.
- [ ] Save to Records (or auto-save in Records flow) persists the scan.
- [ ] Record appears in Records timeline.
- [ ] "View details" works for the new record.

### 4. Role-based nav

- [ ] Log in as **Vet** or **Admin** or **Seller**.
- [ ] Confirm nav items match their role (no Symptom Checker for non-owner roles).
- [ ] Confirm bell icon still works for notifications.

---

## Constraints Kept

- No new screens.
- Existing design system and components preserved.
- Routes unchanged except for nav item paths (Symptom Checker uses existing `/scan/symptoms`).
- All links updated consistently.
