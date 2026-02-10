# Mobile ↔ Web Parity Map

This document maps every web page to its mobile counterpart and serves as the **acceptance checklist**. Every mobile screen must match the web page for: data fields, actions (and disabled logic), loading/empty/error UI, deep links, and query keys/invalidations.

---

## Query Keys & Invalidations (must match)

| Key | Used by | Invalidated on |
|-----|--------|----------------|
| `['bookings']` | Owner/Vet appointments, Vet home pending | createBooking, updateBookingStatus |
| `['bookings', id]` | Booking detail | updateBookingStatus |
| `['notifications']` | Notifications | createBooking, updateBookingStatus, createOrder, updateSellerOrderStatus, cancelOrder, markNotificationRead |
| `['orders']` | Owner orders list | createOrder, cancelOrder |
| `['orders', id]` | Order detail | cancelOrder |
| `['seller-orders']` | Seller orders | createOrder, cancelOrder, updateSellerOrderStatus |
| `['cases']` | Records, Vet cases | createCase, closeCase |
| `['animals']` | Records, Scan, Book flow | createAnimal |
| Admin keys | Admin dashboard/users/vets/products/reports/settings | respective mutations |

**Hook options (match web):** `staleTime: 5000`, `refetchInterval: 10000`, `refetchOnWindowFocus: true` where web uses them.

---

## Notification Deep Links (must match)

- **Prefer** `actionUrl` if present.
- **Fallback** `entityType` + `entityId` (and `relatedId`) by role.
- **No link** → show toast/alert: "This notification has no linked item."

**Supported patterns:**  
Bookings → `/appointments?status=...&focus=<id>` (owner) or `/vet/appointments?status=...&focus=<id>` (vet).  
Orders → `/orders/<id>` (owner) or `/seller/orders?focus=<id>` (seller).  
Cases → `/records?focusCase=<id>` (owner) or `/vet/cases?focus=<id>` (vet).

Mobile: translate to stack screen + params (e.g. OrderDetail `{ orderId }`, BookingDetail `{ bookingId }`, CaseDetail `{ caseId }`).

---

## Owner Screens

### Home

| Item | Web | Mobile |
|------|-----|--------|
| **Route** | `/home` | Tab: Home (HomeScreen) |
| **Web source** | `anilink-web/src/pages/home.tsx` | `apps/mobile/src/screens/owner/HomeScreen.tsx` |
| **API hooks** | useAnimals, useCases, useBookings, useOrders; scanRecordsStore, timelineRecordsStore | useAnimals, useCases, useBookings, useOrders (same keys) |
| **Fields** | Stats: Animals Registered, Active Health Cases, Upcoming Appointments, Recent Orders; Quick actions (Scan, Find Vet, Marketplace); Recent activity (next booking, last order, last scan) | Same stats + quick actions + recent activity |
| **Actions** | Links to /records, /appointments, /orders, /scan, /vets, /marketplace | Navigate to same flows |
| **Loading/Empty/Error** | Renders from API; no explicit skeleton on home (counts from hooks) | Same; show loading for counts if needed |
| **Deep link** | — | — |
| **Checklist** | ☐ Data fields match | ☐ Actions match | ☐ Loading/empty/error | ☐ Query keys |

---

### Orders List

| Item | Web | Mobile |
|------|-----|--------|
| **Route** | `/orders` | Orders stack/tab → OrderList |
| **Web source** | `anilink-web/src/pages/OrdersPage.tsx` | `apps/mobile/src/screens/owner/OrderDetailScreen.tsx` (detail); need Orders list screen |
| **API hooks** | useOrders() | useOrders() — same key `['orders']` |
| **Fields** | Order id (slice 0,8), items count, totalAmount (UGX), createdAt (date); status badge (delivered/cancelled/muted) | Same |
| **Actions** | Link to /orders/:id; focus param → auto navigate to /orders/:id | Navigate to OrderDetail { orderId }; handle focus param |
| **Loading** | LoadingSkeleton lines 6 | Skeleton or LoadingState |
| **Empty** | EmptyState "No orders yet" + link marketplace | Same |
| **Error** | Card "Could not load orders" | ErrorState |
| **Checklist** | ☐ Data fields | ☐ focus→detail | ☐ Query key |

---

### Order Detail

| Item | Web | Mobile |
|------|-----|--------|
| **Route** | `/orders/:id` | OrderDetail screen, param orderId |
| **Web source** | `anilink-web/src/pages/OrderDetailPage.tsx` | `apps/mobile/src/screens/owner/OrderDetailScreen.tsx` |
| **API hooks** | useOrder(id), useCancelOrder() | useOrder(orderId), useCancelOrder() |
| **Fields** | Order id (0,8), sellerName; status badge; createdAt (dateStyle medium, timeStyle short); items: productTitle, quantity × price, line total; totalAmount (UGX); seller block; delivery type/address/district; Cancel button; Contact seller (modal) | Same fields + same formatting (UGX, dates) |
| **Actions** | Cancel: only when status pending/confirmed; invalidate ['orders'], ['orders',id], ['seller-orders'], ['notifications']; toast "Order cancelled". Contact: modal (phone/mail/copy); if no contact disable + "Seller contact not available" | Same rules; Linking tel/mailto on mobile |
| **Loading** | BackHeader + LoadingSkeleton lines 8 | Screen + LoadingState |
| **Error** | ErrorState "Order not found" + Back | ErrorState + Back |
| **Checklist** | ☐ All fields | ☐ canCancel logic | ☐ Contact disable when no phone/email | ☐ Invalidations |

---

### Appointments (Owner)

| Item | Web | Mobile |
|------|-----|--------|
| **Route** | `/appointments` | Appointments tab → AppointmentsScreen |
| **Web source** | `anilink-web/src/pages/appointments.tsx` | `apps/mobile/src/screens/owner/AppointmentsScreen.tsx` |
| **API hooks** | useBookings(), useUpdateBookingStatus(); bookingDtoToAppointment | useBookings(), useUpdateBookingStatus() — key ['bookings'] |
| **Tabs** | Upcoming, Pending, Past, Cancelled | Same tab keys; filter by status (CONFIRMED/IN_PROGRESS = upcoming, REQUESTED = pending, etc.) |
| **Params** | ?status=upcoming|pending|past|cancelled; ?focus=<id> → open details sheet + set tab; ?new=1&animalId= → open BookAppointmentSheet | focus → open BookingDetail or sheet; new → open book flow if exists |
| **Fields** | Card: vet name, date (weekday short, month short, day), time, visitType, notes; status badge; View details / Reschedule / Cancel | Same on card; tap → detail |
| **Actions** | View → details sheet; Reschedule → RescheduleSheet; Cancel → CancelDialog; accept/decline N/A (owner) | View → BookingDetail; Cancel when allowed |
| **Loading/Empty/Error** | Skeleton when loading; EmptyState per tab; — | Same |
| **Checklist** | ☐ Tabs + filter | ☐ focus opens detail | ☐ Query key |

---

### Notifications

| Item | Web | Mobile |
|------|-----|--------|
| **Route** | `/notifications` | NotificationsScreen (tab) |
| **Web source** | `anilink-web/src/pages/NotificationsPage.tsx` | `apps/mobile/src/screens/NotificationsScreen.tsx` |
| **API hooks** | useNotifications(true), useMarkNotificationRead(), useMarkAllNotificationsRead() | useNotifications(), useMarkNotificationRead() |
| **Fields** | Card: title, message, createdAt (toLocaleString); unread = border-l-4 primary; "Mark read" button; "View details →" when href | Same: title, message, timestamp; unread left border; View details → |
| **Actions** | View details → getNotificationHref → navigate; no href → toast "This notification has no linked item." Mark read on click or button | Same; no link → Alert |
| **Loading/Empty/Error** | Skeleton; EmptyState "No notifications yet" | Same |
| **Checklist** | ☐ actionUrl + entity fallback | ☐ Toast when no link |

---

### Profile

| Item | Web | Mobile |
|------|-----|--------|
| **Route** | `/profile` | ProfileScreen (tab) |
| **Web source** | `anilink-web/src/pages/profile.tsx` | `apps/mobile/src/screens/ProfileScreen.tsx` |
| **API** | useAuthStore (user), useProfileStore (profile) | useAuth (user); profile from user only if no store |
| **Fields** | Avatar, fullName, role badge, email, phone, location, farm name, preferred animals; Edit Profile button; Log out | Name, email, role in card; Log out button |
| **Actions** | Edit Profile → EditProfileSheet; Log out | Log out (match web style) |
| **Checklist** | ☐ Name, email, role | ☐ Log out |

---

## Vet Screens

### Vet Home

| Item | Web | Mobile |
|------|-----|--------|
| **Route** | `/vet/home` | VetHomeScreen (tab) |
| **Web source** | `anilink-web/src/pages/vet/VetHomePage.tsx` | `apps/mobile/src/screens/vet/VetHomeScreen.tsx` |
| **API hooks** | useBookings(), useVetCases() — same ['bookings'] | useBookings(), useVetCases() |
| **Fields** | Welcome + role badge; 4 cards: Appointments today, Pending requests, Active cases, Patients seen (0); CTA card: "View requests" → /vet/appointments?status=requested or "Update availability" | Same counts; Pending = REQUESTED; Active = cases not CLOSED; tap Pending → Appointments; tap Active → Cases |
| **Actions** | Pending card → /vet/appointments?status=requested; Active → /vet/cases | Navigate to VetAppointments / VetCases |
| **Checklist** | ☐ Same source useBookings for pending | ☐ Same counts |

---

### Vet Appointments

| Item | Web | Mobile |
|------|-----|--------|
| **Route** | `/vet/appointments` | VetAppointmentsScreen (in Appointments stack) |
| **Web source** | `anilink-web/src/pages/vet/VetAppointmentsPage.tsx` | `apps/mobile/src/screens/vet/VetAppointmentsScreen.tsx` |
| **API hooks** | useBookings(), useUpdateBookingStatus() | useBookings(), useUpdateBookingStatus() |
| **Tabs** | Requested, Confirmed, Completed (status filter) | Requested / Confirmed / Completed |
| **Params** | ?status=requested|... ; ?focus=<id> → open Sheet with booking + Accept/Decline | focus → open BookingDetail with Accept/Decline |
| **Fields** | Card: "Owner Appointment", status badge, date (weekday, month, day), time, visitType, notes; Accept / Decline for REQUESTED | Same; Accept/Decline for REQUESTED |
| **Actions** | Accept → CONFIRMED; Decline → DECLINED; invalidate ['bookings'], ['bookings',id], ['notifications'] | Same |
| **Loading/Empty/Error** | LoadingSkeleton; EmptyState per tab; ErrorState | Same |
| **Checklist** | ☐ Tabs + filter | ☐ Accept/Decline | ☐ Invalidations |

---

### Vet Cases

| Item | Web | Mobile |
|------|-----|--------|
| **Route** | `/vet/cases` | VetCasesScreen (Cases stack) |
| **Web source** | `anilink-web/src/pages/vet/VetCasesPage.tsx` | `apps/mobile/src/screens/vet/VetCasesScreen.tsx` |
| **API hooks** | useVetCases() | useVetCases() |
| **Fields** | List: animalType, status, symptoms/summary; focus highlight | Cards: animal type, status badge, summary; tap → CaseDetail |
| **Params** | ?focus=<id> | focus param → open CaseDetail |
| **Checklist** | ☐ Fields | ☐ focus → detail |

---

### Vet Patients

| Item | Web | Mobile |
|------|-----|--------|
| **Route** | `/vet/patients` | VetPatientsScreen |
| **Web source** | `anilink-web/src/pages/vet/VetPatientsPage.tsx` | `apps/mobile/src/screens/vet/VetPatientsScreen.tsx` |
| **Note** | Web: may list patients from cases/bookings; if stub, mobile can match stub or "connect when endpoint exists" | Match web: same content or placeholder |

---

## Seller Screens

### Seller Dashboard

| Item | Web | Mobile |
|------|-----|--------|
| **Route** | `/seller/dashboard` | SellerDashboardScreen |
| **Web source** | `anilink-web/src/pages/seller/SellerDashboardPage.tsx` | `apps/mobile/src/screens/seller/SellerDashboardScreen.tsx` |
| **API hooks** | useSellerProducts(), useSellerOrders() | useSellerProducts(), useSellerOrders() |
| **Fields** | Welcome + role; 4 cards: Products, Orders, Low stock, Payouts; recent orders list (link to /seller/orders) | Same counts + same labels |
| **Checklist** | ☐ Same hooks & keys |

---

### Seller Orders

| Item | Web | Mobile |
|------|-----|--------|
| **Route** | `/seller/orders` | SellerOrdersScreen |
| **Web source** | `anilink-web/src/pages/seller/SellerOrdersPage.tsx` | `apps/mobile/src/screens/seller/SellerOrdersScreen.tsx` |
| **API hooks** | useSellerOrders(), useUpdateSellerOrderStatus() | useSellerOrders(), useUpdateSellerOrderStatus() |
| **Params** | ?focus=<id> or ?order=<id> → open details sheet | focus → open order detail |
| **Fields** | Order list; detail sheet: full order info, status update | Same |
| **Checklist** | ☐ focus opens detail | ☐ Invalidations |

---

## Admin Screens

### Admin Dashboard

| Item | Web | Mobile |
|------|-----|--------|
| **Route** | `/admin/dashboard` | AdminDashboardScreen |
| **Web source** | `anilink-web/src/pages/admin/AdminDashboardPage.tsx` | `apps/mobile/src/screens/admin/AdminDashboardScreen.tsx` |
| **API hooks** | useAdminStats() | useAdminStats() |
| **Fields** | Users, Vets, Products, Revenue (30d); Recent bookings; Recent orders; link to reports | Same stats + same links |
| **Loading/Error** | LoadingSkeleton; "Could not load dashboard stats" | Same |
| **Checklist** | ☐ Same fields | ☐ Same API |

---

## Parity Checklist (per screen)

For each mobile screen, verify:

- [ ] **Data fields** – Every field shown on web is shown on mobile with same label/format (dates, money UGX, status).
- [ ] **Actions** – Same buttons/links; same enabled/disabled rules (e.g. cancel order only when pending/confirmed).
- [ ] **Loading** – Skeleton or spinner when loading, no blank flash.
- [ ] **Empty** – EmptyState with same copy as web where applicable.
- [ ] **Error** – ErrorState with retry or back; same message style.
- [ ] **Deep link** – focus/status/focusCase params change state or open detail like web.
- [ ] **Query keys & invalidations** – Same as web (see table above).

---

## Strict parity checklist (per page)

Use this section to tick off each screen after QA.

### Owner

| Screen | Data fields match | Actions + disabled logic | Loading/empty/error | Deep link | Query keys |
|--------|-------------------|--------------------------|---------------------|-----------|------------|
| Home | ☐ stats, quick actions, recent activity | ☐ nav to Orders/Appointments/Records/Vets/Shop | ☐ loading when no data | — | ☐ useAnimals, useCases, useBookings, useOrders |
| Orders list | ☐ order id(0,8), items count, UGX total, date, status badge | ☐ tap → OrderDetail; focus→detail | ☐ LoadingState; EmptyState "No orders yet"; ErrorState | ☐ focusOrderId → detail | ☐ useOrders ['orders'] |
| Order detail | ☐ id, sellerName, status, date (medium+short), items (title, qty×price, line total), total UGX, seller block, delivery, Cancel, Contact | ☐ Cancel only pending/confirmed; Contact disabled when no phone/email; invalidations | ☐ LoadingState; ErrorState + Back | — | ☐ useOrder(id), useCancelOrder invalidates |
| Appointments | ☐ tabs Upcoming/Pending/Past/Cancelled; card: vet, date/time, visitType, notes, status; View details | ☐ tap → BookingDetail; focus→detail + set tab | ☐ LoadingState; EmptyState per tab; ErrorState | ☐ focus, status params | ☐ useBookings ['bookings'] |
| Notifications | ☐ title, message, createdAt; unread border; View details | ☐ View details → routing; Mark read | ☐ LoadingState; EmptyState | — | ☐ useNotifications |
| Profile | ☐ name, email, role; Log out | ☐ Log out | — | — | — |

### Vet

| Screen | Data fields match | Actions + disabled logic | Loading/empty/error | Deep link | Query keys |
|--------|-------------------|--------------------------|---------------------|-----------|------------|
| Vet Home | ☐ Pending requests, Active cases counts; tap Pending/Active | ☐ nav to Appointments/Cases | ☐ LoadingState; ErrorState | — | ☐ useBookings, useVetCases |
| Vet Appointments | ☐ tabs Requested/Confirmed/Completed; card + Accept/Decline for REQUESTED | ☐ Accept→CONFIRMED; Decline→DECLINED; invalidations | ☐ LoadingState; EmptyState; ErrorState | ☐ focus | ☐ useBookings |
| Vet Cases | ☐ animalType, status, summary; tap → CaseDetail | ☐ focus → detail | ☐ LoadingState; EmptyState; ErrorState | ☐ focus | ☐ useVetCases |
| Vet Patients | ☐ match web or stub | — | — | — | — |

### Seller / Admin

| Screen | Data fields match | Actions + disabled logic | Loading/empty/error | Deep link | Query keys |
|--------|-------------------|--------------------------|---------------------|-----------|------------|
| Seller Dashboard | ☐ Products, Orders, Low stock, Payouts; recent orders | ☐ link to Orders | ☐ LoadingState; ErrorState | — | ☐ useSellerProducts, useSellerOrders |
| Seller Orders | ☐ list; detail: full order + status update | ☐ focus → detail; invalidations | ☐ LoadingState; EmptyState; ErrorState | ☐ focus | ☐ useSellerOrders |
| Admin Dashboard | ☐ Users, Vets, Products, Revenue; recent bookings/orders | ☐ link to reports | ☐ LoadingState; ErrorState | — | ☐ useAdminStats |

---

## QA (verify as each role)

1. **Owner:** Log in → Home (counts, quick actions, recent activity) → Orders list → Order detail (cancel, contact seller) → Appointments (tabs, focus, detail) → Notifications (View details → correct screen; no link → toast) → Profile (name, email, role, log out).
2. **Vet:** Vet Home (pending, active cases, tap-through) → Appointments (Requested/Confirmed/Completed, Accept/Decline) → Cases (list, tap CaseDetail) → Notifications + Profile.
3. **Seller:** Dashboard (products, orders, low stock) → Orders (list, focus → detail) → Notifications + Profile.
4. **Admin:** Dashboard (stats, recent bookings/orders) → Users/Vets/Products/Reports/Settings as on web → Notifications + Profile.

Do not mark parity complete until every checkbox above is done for every screen.
