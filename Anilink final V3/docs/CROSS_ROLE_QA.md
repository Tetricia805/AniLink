# Cross-role appointment QA checklist

Use this to verify create → pending on both sides → accept → upcoming on both sides.

## Status mapping (single source of truth)

| Backend status | Owner tab | Vet tab |
|----------------|-----------|---------|
| REQUESTED      | Pending   | Requested |
| CONFIRMED      | Upcoming  | Confirmed |
| IN_PROGRESS    | Upcoming  | Confirmed |
| COMPLETED      | Past      | Completed |
| DECLINED       | Cancelled | (filtered out of main tabs) |
| CANCELLED      | Cancelled | (filtered out of main tabs) |

See `src/lib/bookingStatus.ts` for the mapping used in code.

## Endpoints

- **Owner appointments list:** `GET /v1/bookings` (no query params) – backend returns `owner_user_id == current_user.id`.
- **Vet appointments list:** `GET /v1/bookings` (same endpoint) – backend returns `vet_user_id == current_user.id`.
- **Update status (accept/decline/cancel):** `PUT /v1/bookings/:id/status` with body `{ "status": "CONFIRMED" | "DECLINED" | "CANCELLED" }`.
- **Notifications:** `GET /v1/notifications` – returns notifications for current user.

## Query keys invalidated on accept/decline/create

- `['bookings']` – list for current user (owner or vet).
- `['bookings', id]` – single booking (when updating that id).
- `['notifications']` – so notification list/read state updates.

## Steps to verify

1. **Create request (owner)**  
   - Log in as owner.  
   - Appointments → Book a vet → choose vet, date/time, reason → submit.  
   - **Check:** Owner Appointments → Pending tab shows the new request.  
   - **Check:** Within ~10s (or refocus tab), Vet dashboard "Pending requests" count increases.  
   - **Check:** Vet Appointments → Requested tab shows the same booking.  
   - **Check:** Vet receives notification "New booking request".

2. **View details from notification (vet)**  
   - Vet: Notifications → "View details" on the new booking request.  
   - **Check:** Navigates to `/vet/appointments?status=requested&focus=<id>`.  
   - **Check:** Requested tab is active, card is highlighted, details drawer opens with Accept/Decline.

3. **Accept (vet)**  
   - Vet: In drawer or on card, click Accept.  
   - **Check:** Booking moves to Vet "Confirmed" tab (or stays in list with status CONFIRMED).  
   - **Check:** Owner receives notification "Your appointment has been confirmed".  
   - **Check:** Within ~10s (or refocus), Owner Appointments → Pending no longer shows it; Upcoming shows it.

4. **View details from notification (owner)**  
   - Owner: Notifications → "View details" on "Your appointment has been confirmed".  
   - **Check:** Navigates to `/appointments?status=upcoming&focus=<id>`.  
   - **Check:** Upcoming tab is active, details drawer opens for that appointment.

5. **Decline flow (optional)**  
   - Create another request as owner.  
   - Vet: Appointments → Requested → Decline.  
   - **Check:** Owner gets "Your appointment request was declined".  
   - **Check:** Owner Appointments → Cancelled (or appropriate tab) shows it; Pending does not.

## Notes

- Both roles use the same `GET /bookings` endpoint; the backend filters by `current_user` role (owner vs vet).
- List is refetched every 10s and on window focus so both sides update without hard refresh.
- Notification "View details" uses `actionUrl` or `entityType` + `entityId` to build `/vet/appointments?status=requested&focus=<id>` or `/appointments?status=pending|upcoming|cancelled&focus=<id>`.

---

## Debugging

Use these checks to confirm cross-role sync and find root causes when a step fails.

### 1. Which endpoints are called per role

- **Owner:** In Network tab, after opening Appointments or Vet home, confirm `GET /v1/bookings` is called. Response should contain only bookings where `owner_user_id` equals the current user id.
- **Vet:** Same endpoint `GET /v1/bookings`; response should contain only bookings where `vet_user_id` equals the current user id.
- **Notifications:** `GET /v1/notifications` returns notifications for the current user. Unread count in the header comes from the same list (no separate count API).

### 2. Returned data counts and status values

- After Owner creates a booking: Owner's next `GET /v1/bookings` should include the new booking with `status: "REQUESTED"`. Vet's `GET /v1/bookings` should include the same booking (same id) with `status: "REQUESTED"`.
- After Vet accepts: Both Owner and Vet `GET /v1/bookings` should return that booking with `status: "CONFIRMED"` (backend uses uppercase).
- In the frontend, `src/lib/bookingStatus.ts` maps backend status to tabs: REQUESTED → Pending (owner) / Requested (vet); CONFIRMED/IN_PROGRESS → Upcoming (owner) / Confirmed (vet).

### 3. Query keys and invalidation

- **List key:** `['bookings']` is used for the appointments list (owner and vet). Any mutation that changes bookings must call `queryClient.invalidateQueries({ queryKey: ['bookings'] })`.
- **Detail key:** `['bookings', id]` is used for a single booking. `updateBookingStatus` should invalidate both `['bookings']` and `['bookings', id]`.
- **Notifications:** Mutations that create notifications (create booking, accept/decline/cancel) must invalidate `['notifications']` so the list and unread count update.
- In React Query Devtools (if installed), watch the queries panel: after create/accept/decline/cancel, `bookings` and `notifications` should refetch.

### 4. Backend role filtering

- As **Owner:** `GET /v1/bookings` must return only rows where `owner_user_id = current_user.id`.
- As **Vet:** `GET /v1/bookings` must return only rows where `vet_user_id = current_user.id`.
- If the wrong list appears, the bug is in the backend filter (e.g. in the bookings router/service).

### 5. Status persistence after accept/decline/cancel

- After Vet clicks Accept, send `PUT /v1/bookings/:id/status` with body `{ "status": "CONFIRMED" }`. Then call `GET /v1/bookings` (or refetch); that booking must have `status: "CONFIRMED"`.
- Same for Decline → `"DECLINED"`, Cancel → `"CANCELLED"`. If the UI still shows the old status, either the backend did not persist or the frontend did not invalidate/refetch (check step 3).
