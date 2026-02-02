# "View details" Notification Routing & UI Audit

**Date:** 2025-01  
**Scope:** NotificationsPage "View details →" click behavior, routing, and destination page behavior.

---

## 1. Trace of Click Behavior

### Location
- **File:** `src/pages/NotificationsPage.tsx`
- **Component:** `NotificationCard`
- **Button:** "View details →" (line 117)

### Handler Flow
1. **onClick** → `handleViewDetails` (NotificationCard, lines 76–81)
   - If unread: `markAsRead.mutate(notification.id)`
   - Calls `onNavigate(notification)`

2. **onNavigate** → `handleNavigate` (NotificationsPage, lines 131–136)
   - Gets `href` from `getNotificationHref(notification, user?.role)`
   - If `href` exists: `navigate(href)`

### Route Resolution
- **Primary:** Uses `notification.actionUrl` when present (backend-provided).
- **Fallback:** Builds route from `entityType` + `entityId`/`relatedId` + `userRole` when `actionUrl` is missing.

### Exact Route Used
- When backend sends `payload.action_url`: that value is returned as-is.
- When fallback is used: route depends on `entityType` and role (see routing map below).

---

## 2. Routing Map

| Notification type | Who receives | Backend action_url | Fallback route | Destination page | UI shown |
|-------------------|--------------|--------------------|----------------|------------------|----------|
| **BOOKING** (new request) | Vet | `/vet/appointments?status=requested&focus={id}` | Same | VetAppointmentsPage | List + Requested tab + Sheet drawer with Accept/Decline + card ring highlight |
| **BOOKING** (owner created) | Owner | `/appointments?status=pending&focus={id}` | `/appointments?status=upcoming&focus={id}` | AppointmentsPage | List + Pending tab + AppointmentDetailsSheet drawer |
| **BOOKING** (vet accepted) | Owner | `/appointments?status=upcoming&focus={id}` | Same | AppointmentsPage | List + Upcoming tab + AppointmentDetailsSheet drawer |
| **BOOKING** (vet declined) | Owner | `/appointments?status=cancelled&focus={id}` | Same | AppointmentsPage | List + Cancelled tab + AppointmentDetailsSheet drawer |
| **ORDER** (new order) | Seller | `/seller/orders?focus={id}` | Same | SellerOrdersPage | List + OrderDetailsSheet drawer |
| **ORDER** (confirmed) | Owner | `/orders/{id}` (seed) | Same | OrderDetailPage | Full detail page with Cancel button |
| **CASE** (vet) | Vet | (backend does not create) | `/vet/cases?focus={id}` | VetCasesPage | List + card ring highlight (no drawer) |
| **CASE** (owner) | Owner | (backend does not create) | `/records?focusCase={id}` | RecordsPage | **Gap:** page does not handle `focusCase` |
| **SYSTEM** (admin) | Admin | `/admin/vets` (seed) | `undefined` | — | If no `action_url`, no "View details" button |

---

## 3. Role-Awareness & Source of Truth

| Aspect | Answer |
|--------|--------|
| Role-aware? | Yes. Fallback uses `userRole` (VET/SELLER/OWNER) for booking, order, case, product. |
| Backend-driven? | Yes. `action_url` from `payload` is used first when present. |
| Fallback logic | Uses `entityType` + `entityId` + role when `action_url` is absent. |

---

## 4. Destination Page Behavior

### AppointmentsPage (Owner) — ✅ Correct
- Parses `?status=` and `?focus=`
- Sets tab from status (pending/upcoming/past/cancelled)
- When `focus` matches a booking: opens `AppointmentDetailsSheet` (drawer)
- Shows Cancel / Reschedule from drawer
- No Accept/Decline (owner cannot change status)

### VetAppointmentsPage — ✅ Correct
- Parses `?status=` and `?focus=`
- Sets tab from status (requested/confirmed/completed/all)
- When `focus` matches: opens Sheet drawer with Accept/Decline
- Card with matching id gets ring highlight + scroll into view

### SellerOrdersPage — ✅ Correct
- Parses `?order=` or `?focus=`
- Opens `OrderDetailsSheet` (drawer) for the order
- Status update controls in drawer
- Clears URL params after opening (focus lost on refresh; acceptable for deep-link flow)

### OrderDetailPage (Owner) — ✅ Correct
- Route `/orders/:id` shows full order detail
- Cancel button when status allows
- Read-only info otherwise

### VetCasesPage — ⚠️ Partial
- Parses `?focus=`
- Highlights matching case card with ring
- **No drawer** — case details are inline in the card
- UX: acceptable if card content is enough; inconsistent vs appointments/orders

### RecordsPage — ✅ Fixed
- Fallback uses `/records?focusCase={id}`
- **RecordsPage handles `focusCase`** (implemented): finds case, opens RecordDetailsSheet, highlights timeline item, scrolls into view, selects animal when case has animalId

---

## 5. Validation vs UX Intent

| Question | Answer |
|----------|--------|
| Does "View details" show details? | Yes for bookings, orders; partial for vet cases (highlight only); no for owner cases (RecordsPage). |
| Consistent with other deep-links? | Bookings and orders follow list + focus + drawer; cases do not fully. |
| Consistent across roles? | Owner/Vet/Seller differ by design (different pages), but patterns are mostly consistent within each. |
| UX gaps | 1) RecordsPage ignores `focusCase`. 2) VetCasesPage has no drawer (optional improvement). 3) SYSTEM without `action_url` has no "View details" button. |

---

## 6. Confirmation

| Area | Status |
|------|--------|
| Bookings (Owner ↔ Vet) | ✅ Correct |
| Orders (Owner ↔ Seller) | ✅ Correct |
| Vet cases | ⚠️ Acceptable (card highlight, no drawer) |
| Owner records/cases | ✅ Fixed — `focusCase` handled |
| System notifications | ✅ Correct when backend sends `action_url` |

---

## 7. Fix Proposal (Minimal)

### A. RecordsPage: Handle `focusCase` — ✅ Implemented

**Change applied:** In `RecordsPage`:

1. Read `searchParams.get("focusCase")`.
2. When `focusCaseId` exists and cases loaded: find case by id (UUID string; supports prefix match).
3. Map case to `TimelineRecord` via `caseToTimelineRecord`.
4. Set `selectedRecord`, `recordDetailsOpen`, `focusedRecordId`.
5. Set `selectedAnimal` from `case.animalId` when present; else first animal so timeline renders.
6. Set `timelineTab` to "scan" so the case appears.
7. Ring highlight on focused timeline item; `scrollIntoView({ behavior: "smooth" })`.
8. Non-existent id: toast "Case not found".
9. `focusCase` param kept in URL (consistent with AppointmentsPage).

### B. VetCasesPage: Drawer for focused case (optional)

**Problem:** Vet cases show highlight only, no drawer.

**Change:** Add a Sheet for `focusedCase` similar to VetAppointmentsPage, with case details and possible future actions (e.g. close).

### C. No changes needed

- Bookings: working as intended.
- Orders: working as intended.
- NotificationsDropdown: "View all" only, no per-notification "View details" — acceptable.

---

## 8. Summary

| Notification type | Route | Page | UI | Fix needed? |
|-------------------|-------|------|-----|-------------|
| Appointment update (Owner) | `/appointments?status=...&focus=` | AppointmentsPage | Drawer + tab | No |
| New booking (Vet) | `/vet/appointments?status=requested&focus=` | VetAppointmentsPage | Drawer + Accept/Decline | No |
| New order (Seller) | `/seller/orders?focus=` | SellerOrdersPage | Drawer | No |
| Order confirmed (Owner) | `/orders/{id}` | OrderDetailPage | Full page | No |
| Case (Owner) | `/records?focusCase=` | RecordsPage | — | **Yes — add focusCase handling** |
| Case (Vet) | `/vet/cases?focus=` | VetCasesPage | Card highlight | Optional — drawer |
