# Cross-role Sync Matrix

Single reference for entities that sync across roles: who triggers, who must see it, endpoints, notifications, query keys, and UI locations.

## Status mapping (single source of truth)

**Bookings:** See `src/lib/bookingStatus.ts`. Backend: `REQUESTED`, `CONFIRMED`, `DECLINED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`. Owner tabs: Pending / Upcoming / Past / Cancelled. Vet tabs: Requested / Confirmed / Completed.

---

## Matrix table

| Entity | Action | Who triggers | Who must see it | Endpoint(s) | Notification? | Query keys to invalidate | UI location(s) |
|--------|--------|--------------|-----------------|-------------|---------------|--------------------------|----------------|
| **Bookings** | Create | Owner | Owner (Pending), Vet (Requested + dashboard count) | `POST /v1/bookings` | Vet + Owner | `['bookings']`, `['notifications']` | Owner: /appointments (Pending). Vet: /vet/appointments (Requested), /vet/home (Pending requests) |
| **Bookings** | Accept/Decline | Vet | Owner (Upcoming/Cancelled), Vet (Confirmed/Cancelled) | `PUT /v1/bookings/:id/status` | Owner | `['bookings']`, `['bookings', id]`, `['notifications']` | Owner: /appointments. Vet: /vet/appointments |
| **Bookings** | Cancel | Owner | Owner, Vet | `PUT /v1/bookings/:id/status` body `{ "status": "CANCELLED" }` | Optional | `['bookings']`, `['bookings', id]`, `['notifications']` | Same as above |
| **Bookings** | List | Owner / Vet | Same user | `GET /v1/bookings` (backend filters by `owner_user_id` or `vet_user_id`) | — | — | Owner: /appointments. Vet: /vet/appointments, /vet/home |
| **Notifications** | List / Unread count | Any | Same user | `GET /v1/notifications`, `POST /v1/notifications/:id/read` | — | `['notifications']` on mark-read | Header bell, /notifications |
| **Notifications** | View details (deep link) | Any | Same user | — | — | — | action_url → /vet/appointments?status=requested&focus=&lt;id&gt; or /appointments?status=pending\|upcoming&focus=&lt;id&gt; |
| **Cases** | Create | Owner | Owner | `POST /v1/cases` (multipart) | Owner | `['cases']`, `['animals']`, `['notifications']` | Owner: /records (scan flow) |
| **Cases** | Assign vet | Vet/Admin | Vet | `POST /v1/cases/{id}/assign` | Vet | `['cases']`, `['notifications']` | Vet: /vet/cases |
| **Cases** | Close | Owner | Owner | `POST /v1/cases/{id}/close` | Owner | `['cases']`, `['notifications']` | Owner: /records |
| **Cases** | List | Owner / Vet | Owner (own), Vet (assigned) | `GET /v1/cases` (scope=owner default), `GET /v1/cases?scope=vet` | — | — | Owner: /records. Vet: /vet/cases |
| **Animals** | Create/List | Owner | Owner | `GET/POST /v1/animals` | — | `['animals']`, `['cases']` on create | Owner: /records, /scan |
| **Orders** | Create | Owner | Owner (My orders), Seller (Orders list) | `POST /v1/orders` | Seller (if backend creates notification) | `['orders']` (owner), `['seller-orders']` (seller), `['notifications']` | Owner: /orders. Seller: /seller/orders |
| **Orders** | List (owner) | Owner | Owner | `GET /v1/orders` | — | — | Owner: /orders |
| **Orders** | List (seller) | Seller | Seller | `GET /v1/seller/orders` | — | — | Seller: /seller/orders |
| **Seller products** | List / Create / Update | Seller | Seller + Marketplace | `GET/POST/PATCH /v1/seller/products` | — | `['seller-products']`, `['marketplace-products']` | Seller: /seller/products. Marketplace: /marketplace |
| **Vet profile** | Update | Vet | Vet | `PATCH /v1/vets/me` | — | `['vetProfile']` | /vet/profile |
| **Seller profile** | Update | Seller | Seller | `PATCH /v1/seller/profile` | — | `['sellerProfile']` | /seller/profile |

---

## Implemented vs gaps

- **Bookings:** Implemented. Single list key `['bookings']`, refetch 10s + on focus. Create/update invalidate `['bookings']`, `['notifications']`. Deep links with `?status=&focus=` and drawer. QA: `docs/CROSS_ROLE_QA.md`.
- **Notifications:** Implemented. Key `['notifications']`. Mark-read invalidates list. Unread count from same list. Refetch 10s + on focus for all roles.
- **Cases:** Implemented. Owner: `GET /v1/cases`, `POST /v1/cases`. Vet: `GET /v1/cases?scope=vet` returns cases where `vet_user_id == current_user.id`. VetCasesPage uses `useVetCases()`. `Case` model has `vet_user_id` (migration 007). Seed creates sample case assigned to vet.
- **Animals:** Implemented. Records page uses `useAnimals()` → `GET /v1/animals`. Scan page and BookAppointmentSheet use animals from API. Create via `useCreateAnimal()` → `POST /v1/animals`. Backend has no update/delete; Edit shows toast.
- **Orders:** Implemented. Owner OrdersPage uses `useOrders()` → `GET /v1/orders`. Seller SellerOrdersPage uses `useSellerOrders()` → `GET /v1/seller/orders`. Checkout calls `POST /v1/orders` via `useCreateOrder()`. Backend creates seller notification on order create; action_url `/seller/orders?focus=<orderId>`. Mutations invalidate `['orders']`, `['seller-orders']`, `['notifications']`.
- **Marketplace:** Implemented. Marketplace page loads products via `listMarketplaceProducts()`; product ids are UUID strings for cart/order flow.
- **Seller products:** Implemented. SellerProductsPage uses `useSellerProducts()` → `GET /v1/seller/products`. Create/update via `useCreateSellerProduct`, `useUpdateSellerProduct`; invalidate `['seller-products']`, `['marketplace-products']`. Archive/delete show toast (backend: seller cannot change is_active; no delete endpoint).
- **Dashboard counters (Owner home):** Appointments from `useBookings()`, orders from `useOrders()`. Animals from `useAnimals()`.
- **Dashboard counters (Vet home):** Derived from `useBookings()`. Pending = REQUESTED; Appointments today = same list. Active cases from `useVetCases()`. Patients seen = 0 (no backend aggregate yet).

**Debugging:** See `docs/CROSS_ROLE_DEBUGGING.md` for common failure modes, network checks, and dev logs. Also `docs/CROSS_ROLE_QA.md` (Debugging section).

---

## Query key reference

| Key | Used by | Invalidated on |
|-----|---------|----------------|
| `['bookings']` | useBookings (owner + vet list) | createBooking, updateBookingStatus |
| `['bookings', id]` | useBooking(id) | updateBookingStatus(id) |
| `['notifications']` | useNotifications, useUnreadCount | createBooking, updateBookingStatus, createOrder, updateSellerOrderStatus, markNotificationRead, markAllRead, login/logout |
| `['orders']` | useOrders (owner list) | createOrder |
| `['seller-orders']` | useSellerOrders | createOrder, updateSellerOrderStatus |
| `['seller-products']` | useSellerProducts | createSellerProduct, updateSellerProduct |
| `['marketplace-products']` | MarketplacePage | createSellerProduct, updateSellerProduct |
| `['animals']` | useAnimals | createAnimal |
| `['cases']` | useCases, useVetCases | createCase, closeCase |
| `['vets']` | useVetsList | — |
| `['vetProfile']` | useVetProfile | updateVetProfile |
| `['sellerProfile']` | useSellerProfile | updateSellerProfile |

---

## Notification action_url / fallback

- Backend should set `payload.action_url` (e.g. `/vet/appointments?status=requested&focus=<id>`).
- Frontend `getNotificationHref()` uses `actionUrl` if present; else builds from `entityType` + `entityId` + role (see NotificationsPage.tsx).
