# Notifications Deep-Linking Implementation Summary

## Objective
Enable notifications to deep-link to the correct entity page (appointment/case/order) with role-specific actions (e.g., Accept/Reject for vet booking requests).

---

## A) Backend Changes

### 1. Notification Model Enhancement
**File:** `backend/app/modules/notifications/schemas.py`
- ✅ Added `entityType`, `entityId`, `actionUrl` fields to `NotificationResponse`
- These fields are extracted from the `payload` JSONB column (no migration needed)

**File:** `backend/app/modules/notifications/router.py`
- ✅ Updated `_notification_to_response()` to extract entity data from `payload`:
  - `entity_type` (booking, case, order, product, system)
  - `entity_id` (UUID of the related entity)
  - `action_url` (frontend route with focus param)

### 2. Booking Status Update Endpoint
**File:** `backend/app/modules/bookings/router.py`
- ✅ Clarified `PUT /bookings/:id/status` endpoint signature
- ✅ Changed from ambiguous query param to explicit request body:
  ```typescript
  PUT /bookings/:id/status
  Body: { "status": "CONFIRMED" }
  ```
- ✅ Status transitions enforced by service layer:
  - REQUESTED → CONFIRMED | DECLINED | CANCELLED
  - CONFIRMED → IN_PROGRESS | CANCELLED
  - IN_PROGRESS → COMPLETED

### 3. Seed Data Updates
**File:** `backend/scripts/seed_data.py`
- ✅ Booking created with `status=REQUESTED` (not CONFIRMED) so vets can Accept/Reject
- ✅ Notifications created with proper `payload` structure:
  ```json
  {
    "entity_type": "booking",
    "entity_id": "<booking_id>",
    "action_url": "/vet/appointments?status=requested&focus=<booking_id>"
  }
  ```
- ✅ Idempotent: checks if booking exists before creating

### 4. Verified Endpoints
- ✅ `GET /v1/notifications` - returns notifications with entity metadata
- ✅ `POST /v1/notifications/:id/read` - mark notification as read
- ✅ `GET /v1/bookings?status=` - role-aware (returns vet or owner bookings)
- ✅ `PUT /v1/bookings/:id/status` - vet-only, with status transition validation

---

## B) Frontend Changes

### 1. Notification Type Enhancement
**File:** `src/types/notifications.ts`
- ✅ Added `entityType`, `entityId`, `actionUrl` to `NotificationDto`

### 2. NotificationsPage Navigation Logic
**File:** `src/pages/NotificationsPage.tsx`
- ✅ Replaced hardcoded `/vet/home` navigation with smart routing
- ✅ Priority: Use `actionUrl` from backend if present
- ✅ Fallback: Derive route from `entityType` + `userRole`:
  - `booking` + VET → `/vet/appointments?status=requested&focus={id}`
  - `booking` + OWNER → `/appointments?status=upcoming&focus={id}`
  - `order` + SELLER → `/seller/orders?focus={id}`
  - `order` + OWNER → `/orders/{id}`
  - `case` + VET → `/vet/cases?focus={id}`
  - `case` + OWNER → `/records?focusCase={id}`
- ✅ "View details" button:
  - Marks notification as read (optimistic update)
  - Navigates to derived route using `useNavigate()`

### 3. Bookings API Client
**File:** `src/api/bookings.ts` (NEW)
- ✅ `listBookings(status?: string)` - GET /bookings?status=
- ✅ `getBooking(id)` - GET /bookings/:id
- ✅ `createBooking(data)` - POST /bookings
- ✅ `updateBookingStatus(id, status)` - PUT /bookings/:id/status

### 4. Bookings React Query Hooks
**File:** `src/hooks/useBookings.ts` (NEW)
- ✅ `useBookings(status?)` - fetch bookings list
- ✅ `useBooking(id, enabled)` - fetch single booking
- ✅ `useCreateBooking()` - create booking mutation
- ✅ `useUpdateBookingStatus()` - update status mutation with toast feedback

### 5. Vet Appointments Page - Full Rebuild
**File:** `src/pages/vet/VetAppointmentsPage.tsx`
- ✅ Replaced empty placeholder with fully functional UI
- ✅ Tabs for filtering: All | Requested | Confirmed | Completed
- ✅ Auto-set active tab from `?status=` query param
- ✅ Focus/highlight logic:
  - Read `?focus={id}` query param
  - Auto-scroll to focused card
  - Visual highlight (ring-2 ring-primary)
- ✅ Booking cards display:
  - Date, time, visit type, notes
  - Status badge with color coding
- ✅ **Accept/Reject UI** (for REQUESTED status):
  - Accept button → `PUT /bookings/:id/status { status: "CONFIRMED" }`
  - Decline button → `PUT /bookings/:id/status { status: "DECLINED" }`
  - Disabled state during mutation
  - Toast feedback on success/error
  - Auto-refetch bookings list after action

---

## C) Verification Checklist

### Backend
- ✅ Seed produces REQUESTED booking + vet notification with `actionUrl`
- ✅ `GET /v1/notifications` returns `entityType`, `entityId`, `actionUrl`
- ✅ `PUT /v1/bookings/:id/status` accepts body `{ status: "CONFIRMED" }`
- ✅ Status transitions validated (e.g., REQUESTED → CONFIRMED allowed)

### Frontend
- ✅ Login as vet → `/notifications` shows booking notification
- ✅ Click "View details" → navigates to `/vet/appointments?status=requested&focus={id}`
- ✅ Booking card auto-scrolls and highlights
- ✅ Accept button updates booking to CONFIRMED
- ✅ Decline button updates booking to DECLINED
- ✅ Toast shows success message
- ✅ Booking list auto-refreshes after action

### Database
- ✅ `bookings` table has 1 row with status=REQUESTED
- ✅ `notifications` table has 1 BOOKING notification with proper `payload`:
  ```json
  {
    "entity_type": "booking",
    "entity_id": "<uuid>",
    "action_url": "/vet/appointments?status=requested&focus=<uuid>"
  }
  ```

---

## Testing Instructions

1. **Start backend:**
   ```bash
   cd backend && docker compose up -d
   ```

2. **Run seed (if not already done):**
   ```bash
   docker compose exec backend python scripts/seed_data.py
   ```

3. **Start frontend:**
   ```bash
   cd anilink-web && npm run dev
   ```

4. **Login as vet:**
   - Email: `vet@example.com`
   - Password: `password123`

5. **Navigate to notifications:**
   - `/notifications` or click bell icon
   - Should see "New booking request" notification

6. **Click "View details":**
   - Should navigate to `/vet/appointments?status=requested&focus=<id>`
   - Booking card should be visible, scrolled into view, and highlighted

7. **Test Accept:**
   - Click "Accept" button
   - Toast shows "Booking confirmed successfully"
   - Card updates to show "CONFIRMED" badge
   - Accept/Reject buttons disappear

8. **Test Decline (alternative):**
   - If testing decline instead, status becomes "DECLINED"
   - Card shows destructive badge

---

## Future Enhancements (Optional)

1. **Owner Confirmation Notification:**
   - When vet accepts/declines, create notification for owner
   - Backend: add notification creation in booking service `update_booking_status()`

2. **More Entity Types:**
   - Case updates: `/vet/cases?focus={id}`, `/records?focusCase={id}`
   - Order updates: `/seller/orders?focus={id}`, `/orders/{id}`

3. **Notification Templates:**
   - Centralize notification creation logic in a NotificationService helper
   - Templates for each entity type + action (booking.created, order.confirmed, etc.)

4. **Real-time Updates:**
   - WebSocket or SSE for instant notification delivery
   - Auto-refresh bookings list when notification arrives

---

## Files Changed

### Backend
- `app/modules/notifications/schemas.py` - added entityType, entityId, actionUrl
- `app/modules/notifications/router.py` - extract entity data from payload
- `app/modules/bookings/router.py` - clarified status update endpoint signature
- `scripts/seed_data.py` - create REQUESTED booking with proper notification payload

### Frontend
- `src/types/notifications.ts` - added entity fields to NotificationDto
- `src/pages/NotificationsPage.tsx` - smart navigation with role-based routing
- `src/api/bookings.ts` - NEW: booking API client
- `src/hooks/useBookings.ts` - NEW: React Query hooks for bookings
- `src/pages/vet/VetAppointmentsPage.tsx` - full rebuild with Accept/Reject UI + focus logic
