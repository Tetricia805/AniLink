# Frontend to Backend Map

**Purpose:** For each frontend route/page, document data shown, backend endpoint(s) used, React Query keys, mutations, and any missing endpoint or storage.

---

## Owner routes

| Route | Page/component | Data shown | Backend endpoint(s) | Query keys | Mutations | Missing? |
|-------|-----------------|------------|--------------------|------------|-----------|----------|
| /home | HomePage | Welcome name, stats (animals, cases, appointments, orders) | GET /auth/me | — | — | **Summary:** GET /owner/summary or derive from list endpoints |
| /vets | VetsPage | List of vets (search, filters) | GET /v1/vets (no auth; returns verified vets only) | ["vets", params] | — | No. Default: no filters = all verified vets. |
| /vets/map | VetsMapPage | Same vet list + map | GET /v1/vets | ["vets"] | — | No |
| /vets/:id | VetDetailsPage | Single vet (clinic, contact, map) | GET /v1/vets/:id | ["vets", id] | — | No |
| /marketplace | MarketplacePage | Product list | GET /v1/marketplace/products | marketplace | — | No |
| /marketplace/products/:id | ProductDetailPage | Product detail | GET /v1/marketplace/products/:id | — | — | No |
| /cart | CartPage | Cart (local/store) | — | — | — | N/A |
| /checkout | CheckoutPage | Checkout form | POST /v1/orders | — | createOrder | No |
| /orders | OrdersPage | Order list | GET /v1/orders | orders | — | No |
| /orders/:id | OrderDetailPage | Order detail | GET /v1/orders/:id | orders, id | — | No |
| /appointments | AppointmentsPage | Appointments list | GET /v1/bookings | bookings | POST /bookings | No |
| /scan/start | ScanPage | Scan flow, cases | POST /v1/cases (submit) | — | createCase | No |
| /records | RecordsPage | Animals + timeline | GET /v1/animals | animals | POST/PUT/DELETE /animals | No |
| /profile | ProfilePage | User name, email, phone, avatar | GET /auth/me (or /users/me) | — | PATCH /users/me, POST /users/me/avatar | No |
| /settings | SettingsPage | App settings | — | — | — | Optional |
| /notifications | NotificationsPage | Notifications list, unread badge | GET /v1/notifications | notifications | PATCH read | No (PATCH path: POST /notifications/:id/read) |

---

## Vet routes

| Route | Page/component | Data shown | Backend endpoint(s) | Query keys | Mutations | Missing? |
|-------|-----------------|------------|--------------------|------------|-----------|----------|
| /vet/home | VetHomePage | Welcome, stats | GET /auth/me | — | — | **Summary:** GET /vet/summary optional |
| /vet/appointments | VetAppointmentsPage | Vet's bookings | GET /v1/bookings | bookings | PATCH status | No |
| /vet/cases | VetCasesPage | Cases (assigned/open) | GET /v1/cases | cases | — | No |
| /vet/patients | VetPatientsPage | Patients list | — | — | — | Propose: GET /v1/vet/patients or derive from bookings |
| /vet/profile | VetProfilePage | Vet profile + clinic + availability | GET /v1/vets/me, GET /v1/vets/me/availability | vets/me, vets/me/availability | PATCH /vets/me, PUT /vets/me/availability, PATCH /users/me (phone) | No |
| /vet/profile/edit | VetProfileEditPage | Edit clinic form | Same as profile | Same | Same | No |

---

## Seller routes

| Route | Page/component | Data shown | Backend endpoint(s) | Query keys | Mutations | Missing? |
|-------|-----------------|------------|--------------------|------------|-----------|----------|
| /seller/dashboard | SellerDashboardPage | Stats, recent orders | GET /auth/me | — | — | **Summary:** GET /seller/summary optional |
| /seller/products | SellerProductsPage | Seller's products | GET /v1/seller/products | seller/products | POST/PUT /seller/products | No |
| /seller/orders | SellerOrdersPage | Seller's orders | GET /v1/orders (seller filter) | orders | — | No |
| /seller/payouts | SellerPayoutsPage | Payouts | — | — | — | **Propose:** GET /seller/payouts (placeholder ok) |
| /seller/profile | SellerProfilePage | User + store details | GET /auth/me | — | PATCH /users/me, (seller profile: optional GET/PATCH /seller/profile) | Seller profile: optional backend |

---

## Admin routes

| Route | Page/component | Data shown | Backend endpoint(s) | Query keys | Mutations | Missing? |
|-------|-----------------|------------|--------------------|------------|-----------|----------|
| /admin/dashboard | AdminDashboardPage | Stats | GET /auth/me | — | — | **Summary:** GET /admin/summary |
| /admin/users | AdminUsersPage | Users list | — | — | — | **Propose:** GET /admin/users |
| /admin/vets | AdminVetsPage | Vets to approve | — | — | — | **Propose:** GET /admin/vets, PATCH verify |
| /admin/products | AdminProductsPage | Products to verify | — | — | — | **Propose:** GET /admin/products, PATCH verify |
| /admin/reports | AdminReportsPage | Reports | — | — | — | Optional |
| /admin/settings | AdminSettingsPage | Site settings | — | — | — | Optional |

---

## Shared

| Item | Data | Backend | Notes |
|------|------|---------|-------|
| Auth bootstrap | user (id, name, email, role, phone, profileImageUrl) | GET /v1/auth/me | Used for welcome name, avatar initials |
| Profile update | fullName, phone, avatarUrl | PATCH /v1/users/me | Universal |
| Avatar upload | file | POST /v1/users/me/avatar | Returns avatarUrl |
| Notifications | list, unread count | GET /v1/notifications | All roles; badge = unread count from list or GET /notifications/unread-count if added |

---

## Query keys used (React Query)

| Key | Endpoint | Invalidation |
|-----|----------|--------------|
| ["vets"], ["vets", id] | GET /vets, GET /vets/:id | — |
| ["vets", "me"], ["vets", "me", "availability"] | GET /vets/me, GET /vets/me/availability | After PATCH/PUT vet profile/availability |
| (auth user) | GET /auth/me | After login, refreshUser after profile/avatar update |
| ["notifications"] | GET /notifications | After mark read |
| ["marketplace"] | GET /marketplace/products | — |
| ["orders"] | GET /orders | After create order |
| ["bookings"] | GET /bookings | After create/update booking |
| ["animals"] | GET /animals | After create/update/delete animal |

---

## Notes

- **Filtering defaults:** Vets page applies no filters by default (shows all verified vets); search and filter chips only apply when user selects them.
- **IDs:** All vet detail and list links use real backend IDs (UUID string). No display-name routing.
- **Notifications:** Backend returns list with `read`; frontend maps to `isRead`. Unread count = count of items where read=false in list, or add GET /notifications/unread-count if needed.
