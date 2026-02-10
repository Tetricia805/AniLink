# Role Label: Owner → Farmer (UI Only)

**Date:** 2025-02-09  
**Status:** Implemented

## Summary

The user-facing role label "Owner" was renamed to "Farmer" across the AniLink web app. **Internal role keys, enums, and token values remain unchanged** (`OWNER`, `owner_user_id`, etc.).

---

## Centralized Role Label Mapper

**File:** `anilink-web/src/lib/userUtils.ts`

Added `getRoleLabel(role: string | undefined): string`:

| Internal role | Display label |
|---------------|---------------|
| `OWNER`       | Farmer        |
| `VET`         | Vet           |
| `SELLER`      | Seller        |
| `ADMIN`       | Admin         |
| `undefined`   | Farmer (fallback) |

---

## Files Changed

| File | Change |
|------|--------|
| `anilink-web/src/lib/userUtils.ts` | Added `getRoleLabel()` mapper |
| `anilink-web/src/pages/home.tsx` | Replaced local `roleLabel` with `getRoleLabel` |
| `anilink-web/src/pages/admin/AdminDashboardPage.tsx` | Replaced local `roleLabel` with `getRoleLabel` |
| `anilink-web/src/pages/admin/AdminUsersPage.tsx` | Role select options: `Owner` → `Farmer` (value stays `OWNER`) |
| `anilink-web/src/pages/vet/VetHomePage.tsx` | Replaced local `roleLabel` with `getRoleLabel` |
| `anilink-web/src/pages/vet/VetCasesPage.tsx` | "owners" → "farmers" in description text |
| `anilink-web/src/pages/vet/VetAppointmentsPage.tsx` | "Owner Appointment" → "Farmer Appointment"; "owners" → "farmers" in empty state |
| `anilink-web/src/pages/seller/SellerDashboardPage.tsx` | Replaced local `roleLabel` with `getRoleLabel` |
| `anilink-web/src/pages/profile.tsx` | "AniLink Owner" → "AniLink Farmer"; role badge uses `getRoleLabel` |
| `anilink-web/src/pages/register.tsx` | Role selector label: `Owner` → `Farmer` (value stays `OWNER`) |
| `anilink-web/src/components/appointments/AppointmentDetailsSheet.tsx` | "Message owner" → "Message farmer" |
| `anilink-web/src/components/appointments/AppointmentCard.tsx` | "Message owner" → "Message farmer" |
| `anilink-web/src/components/profile/EditProfileSheet.tsx` | Comment: "Owner, Seller" → "Farmer, Seller" |
| `backend/app/modules/bookings/service.py` | Notification: "An owner has requested" → "A farmer has requested" |

---

## Strings Updated

| Location | Before | After |
|----------|--------|-------|
| Home/Vet/Seller/Admin dashboard badge | "Owner" (for OWNER role) | "Farmer" |
| Admin Users role dropdown | "Owner" option | "Farmer" option |
| Vet Cases page | "Cases submitted by owners" | "Cases submitted by farmers" |
| Vet Cases empty state | "When owners submit scans" | "When farmers submit scans" |
| Vet Appointments | "Owner Appointment" | "Farmer Appointment" |
| Vet Appointments empty state | "owners" | "farmers" |
| Profile page | "AniLink Owner" | "AniLink Farmer" |
| Register page role selector | "Owner" tab | "Farmer" tab |
| Appointment details/card | "Message owner" | "Message farmer" |
| Backend vet notification | "An owner has requested an appointment" | "A farmer has requested an appointment" |

---

## Internal Role Keys Unchanged

- **Backend:** `OWNER` enum, `owner_user_id` columns, `role.value == "OWNER"` checks
- **Frontend:** `role === "OWNER"`, `value="OWNER"` in forms, `mode="owner"` in appointment components
- **Auth/tokens:** Role in JWT remains `OWNER`; no API changes
- **Database:** No migrations; `owner_user_id` and related FK names unchanged

---

## Verification

- [ ] Log in as Farmer (OWNER role) → dashboards show "Farmer" badge
- [ ] Register: select "Farmer" tab → account created with role `OWNER`
- [ ] Admin Users: create/edit user, select "Farmer" → saved as `OWNER`
- [ ] Vet Cases: description says "farmers"
- [ ] Vet Appointments: "Farmer Appointment", empty state mentions "farmers"
- [ ] Profile: "AniLink Farmer" and "Farmer" badge
- [ ] Vet receives booking notification: "A farmer has requested an appointment"
- [ ] Appointment card/details: "Message farmer" button
