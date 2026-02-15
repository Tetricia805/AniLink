# Gaps and Minimal Changes

**Purpose:** List missing data we need to store, minimal migrations, and minimal endpoints required by the current frontend UI. Ordered by priority (blocking first).

---

## 1) Fixed in this pass (no further change)

- **Owner /vets:** GET /v1/vets exists, returns only verified vets. Frontend now uses it (useVetsList, no mock). No backend change.
- **Auth/me and profile:** GET /v1/auth/me and PATCH /v1/users/me, POST /v1/users/me/avatar exist. Welcome name and avatar initials come from backend.
- **Vet profile and availability:** GET/PATCH /v1/vets/me, GET/PUT /v1/vets/me/availability exist and persist.
- **Vet clinic location (locked map):** Clinic lat/lng can only be set via "Pick on map" (Google Maps click) or "Use current location" (GPS). No manual coordinate editing. Once saved, location section shows locked map preview until "Change location" is clicked. PATCH /v1/vets/me accepts latitude, longitude, locationLabel.
- **Seed script idempotency:** `backend/scripts/seed_data.py` now uses email-based lookup (get-or-create pattern) to prevent duplicate records on repeated runs. Safe to run multiple times.
- **DB-level uniqueness:** Migration `006_add_unique_constraint_users_email` adds UNIQUE constraint `uq_users_email` on `users.email`. The DB now enforces one row per email; seed script is idempotent and the DB blocks duplicate emails. **Other core entities:** `seller_profiles.user_id` already has unique index (`ix_seller_profiles_user_id`); `vets.user_id` is primary key — no migration needed for those.

---

## 2) Missing or optional backend (by priority)

### High (needed for current UI to show real data)

- **None** for owner vets flow; it is fixed. Remaining items below are for full parity with UI expectations.

### Medium (dashboard stats – single source of truth)

- **Summary endpoints (optional but recommended):**
  - **GET /v1/owner/summary** (OWNER): `animalsCount`, `activeCasesCount`, `upcomingAppointmentsCount`, `recentOrdersCount`.  
    Minimal: count from existing tables (animals, cases, bookings, orders) for current user. No new tables.
  - **GET /v1/vet/summary** (VET): `appointmentsToday`, `pendingRequests`, `activeCases`, `patientsSeen`.  
    Minimal: count from bookings, cases for current vet.
  - **GET /v1/seller/summary** (SELLER): `productsCount`, `ordersCount`, `lowStockCount`, `payouts` (placeholder 0 ok).  
    Minimal: count from seller products, orders; lowStockCount where stock_qty &lt; threshold.
  - **GET /v1/admin/summary** (ADMIN): `usersCount`, `vetsPending`, `productsPending`, `totalOrders`.  
    Minimal: count from users, vets (verified=false), products (verified=false), orders.

If not added: frontend must not show hardcoded stats; either hide stats or derive from list endpoints (e.g. animals.length, bookings.length).

### Lower (admin and seller parity)

- **Admin users list:** **GET /v1/admin/users** (ADMIN). Returns list of users (id, name, email, role, createdAt). Pagination optional.
- **Admin vets list:** **GET /v1/admin/vets** (ADMIN). Return vets (including verified=false). **PATCH /v1/admin/vets/:id/verify** to set verified=true.
- **Admin products list:** **GET /v1/admin/products** (ADMIN). Return all products (verified + unverified). **PATCH /v1/admin/products/:id/verify** to set verified=true.
- **Seller profile API (optional):** **GET /v1/seller/profile**, **PATCH /v1/seller/profile** (SELLER). Store: store_name, contact_email, contact_phone, logo_url, address.  
  **Migration:** Add to `seller_profiles`: `contact_phone`, `logo_url`, `address` (nullable). Current schema has store_name, contact_email.
- **Notifications read-all:** **PATCH /v1/notifications/read-all** (any). Set read=true for all notifications of current user. No new table.
- **Unread count (optional):** **GET /v1/notifications/unread-count** returns `{ count: number }`. Avoids sending full list for badge only.

---

## 3) Minimal migrations (only if adding above)

| Migration | Table | Change |
|-----------|--------|--------|
| Seller profile fields | seller_profiles | Add `contact_phone` (string, nullable), `logo_url` (string, nullable), `address` (string, nullable) if not present. |

No new tables required for the items in §2. Existing tables support vets, animals, bookings, cases, orders, notifications, products, users, seller_profiles.

---

## 4) Data consistency rules (enforced)

- **Vets list:** Backend returns only verified vets. Frontend does not filter by verification; backend is source of truth.
- **Marketplace (owner):** Backend returns only verified + is_active products. Frontend does not filter.
- **Filter defaults:** Frontend applies no filters by default (vets: no specialization/farmVisits/is24Hours; search empty). Filters only when user selects them.
- **IDs:** All links use backend IDs (e.g. /vets/:id = backend vet user_id UUID). No routing by display name.
- **Status values:** Frontend uses same enum values as backend (e.g. order status: pending, confirmed, …).

---

## 5) Verification checklist (after fixes)

- [ ] **Run seed:** `cd backend && python scripts/seed_data.py` (after migrations).
- [ ] **Owner /vets** shows at least 1 vet when seeded (both vets have `verified=True`).
- [ ] Owner /vets/:id loads detail for that vet (real UUID from backend).
- [ ] Search and filters on /vets do not hide all results by default (no filters applied initially).
- [ ] Welcome header and avatar initials use real user name from GET /auth/me (no hardcoded "David").
- [ ] Vet profile save (clinic + availability) persists after refresh.
- [ ] Notifications render for owner/vet/seller/admin; unread updates after mark read.
- [ ] Seller product create shows pending by default; admin can verify (when admin endpoints exist).

### Debugging /vets showing 0

1. **Backend running?** `http://localhost:8000/v1/vets` should return JSON array of vets (no auth).
2. **Seed run?** If DB is empty, run `python backend/scripts/seed_data.py`.
3. **Frontend base URL?** `.env` should have `VITE_API_BASE_URL=http://localhost:8000/v1`.
4. **Dev console:** In dev, `[API Request]` and `[API Response]` log URL, status, data type. Use "Debug: show raw API response" on /vets to see full JSON.
