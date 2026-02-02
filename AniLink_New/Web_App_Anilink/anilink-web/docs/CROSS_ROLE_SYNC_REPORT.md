# Cross-Role Sync Audit Report

**Date:** 2025  
**Scope:** Full cross-role communication audit for AniLink (Owner, Vet, Seller, Admin)

---

## A. Entity Inventory (Cross-Role Flows)

| Entity | Who creates/updates | Who must see it | Backend endpoints | Frontend hooks/pages | Query keys | Mutations invalidate | Stubs/mocks | Fix needed |
|--------|---------------------|-----------------|-------------------|----------------------|------------|----------------------|-------------|------------|
| **Bookings** | Owner (create), Vet (accept/decline), Owner (cancel) | Owner + Vet | `GET/POST /v1/bookings`, `PUT /v1/bookings/:id/status` | useBookings, useCreateBooking, useUpdateBookingStatus. AppointmentsPage, VetAppointmentsPage, VetHomePage | `['bookings']`, `['bookings', id]` | `['bookings']`, `['bookings', id]`, `['notifications']` | None | — |
| **Notifications** | Backend (on booking/order) | Same user | `GET /v1/notifications`, `POST /v1/notifications/:id/read` | useNotifications, useUnreadCount, useMarkNotificationRead. NotificationsPage, NotificationsBell | `['notifications']` | markRead, createBooking, updateBookingStatus, createOrder, updateSellerOrderStatus | None | — |
| **Orders** | Owner (checkout) | Owner + Seller | `GET/POST /v1/orders`, `GET/PATCH /v1/seller/orders` | useOrders, useCreateOrder, useSellerOrders, useUpdateSellerOrderStatus. OrdersPage, OrderDetailPage, SellerOrdersPage, checkout | `['orders']`, `['seller-orders']` | `['orders']`, `['seller-orders']`, `['notifications']` | None | — |
| **Seller products** | Seller | Seller + Marketplace | `GET/POST/PATCH /v1/seller/products` | useSellerProducts, useCreateSellerProduct, useUpdateSellerProduct. SellerProductsPage, SellerDashboardPage | `['seller-products']` | `['seller-products']`, `['marketplace-products']` | None | — |
| **Cases** | Owner | Owner | `GET/POST /v1/cases` | — | — | — | Records page uses scanRecordsStore, timelineRecordsStore | Backend has API; Records page not wired. Vet cases: backend gap. |
| **Animals/Records** | Owner | Owner | `GET/POST /v1/animals`, `GET/POST /v1/cases` | useAnimals, useCases, useCreateAnimal, useCreateCase | `['animals']`, `['cases']` | createAnimal, createCase, closeCase | None | — |
| **Vet cases** | — | Vet | `GET /v1/cases?scope=vet` | useVetCases | `['cases']` | — | None | — |
| **Vet profile** | Vet | Vet | `PATCH /v1/vets/me` | useVetProfile | `['vetProfile']` | updateVetProfile | None | — |
| **Seller profile** | Seller | Seller | `PATCH /v1/seller/profile` | useSellerProfile | `['sellerProfile']` | updateSellerProfile | None | — |

---

## 1. What Was Broken

| Entity | Issue | Root Cause |
|--------|-------|------------|
| **Orders** | Owner OrdersPage showed empty stub | No API integration; page was static |
| **Orders** | Seller SellerOrdersPage used Zustand store | Store persisted mock data; no `GET /v1/seller/orders` |
| **Orders** | Checkout did not create real orders | Used `notificationStore.add()` instead of `POST /v1/orders` |
| **Marketplace** | Products array always empty | `products` was hardcoded `[]`; never called `listMarketplaceProducts()` |
| **Marketplace** | Cart productId incompatible with order API | Cart used numeric ids; backend expects UUID strings |
| **Owner Home** | Appointments from Zustand store | Used `useAppointmentsStore` instead of `useBookings()` |
| **Owner Home** | Recent Orders always "0" | No API integration |
| **Seller Dashboard** | Orders from Zustand store | Used `sellerStore.orders` instead of `useSellerOrders()` |
| **Order Detail** | Page was stub | No `useOrder(id)` or order display |
| **Seller Products** | SellerProductsPage used sellerStore | No `GET /v1/seller/products`; add/edit/update in store |
| **Notification deep link (Seller)** | SellerOrdersPage expected `?order=` | getNotificationHref used `?focus=`; page now accepts both |

---

## 2. What Was Fixed

| Fix | Files Changed |
|-----|---------------|
| Created `api/orders.ts` | List, get, create, cancel orders |
| Created `api/sellerOrders.ts` | List seller orders, update status |
| Created `useOrders`, `useCreateOrder`, `useCancelOrder` | `hooks/useOrders.ts` |
| Created `useSellerOrders`, `useUpdateSellerOrderStatus` | `hooks/useSellerOrders.ts` |
| Wired OrdersPage to `useOrders()` | `pages/OrdersPage.tsx` |
| Wired SellerOrdersPage to `useSellerOrders()` | `pages/seller/SellerOrdersPage.tsx` |
| Wired Checkout to `useCreateOrder()` | `pages/checkout.tsx` |
| Wired Marketplace to `listMarketplaceProducts()` | `pages/marketplace.tsx` |
| Changed `MarketplaceProduct.id` to string (UUID) | `types/marketplace.ts` |
| Changed `CartItem.productId` to `string | number` | `types/cart.ts`, `store/cartStore.ts`, `components/cart/CartItem.tsx` |
| Wired Owner Home appointments to `useBookings()` | `pages/home.tsx` |
| Wired Owner Home orders count to `useOrders()` | `pages/home.tsx` |
| Wired Seller Dashboard orders to `useSellerOrders()` | `pages/seller/SellerDashboardPage.tsx` |
| Wired OrderDetailPage to `useOrder(id)`, `useCancelOrder` | `pages/OrderDetailPage.tsx` |
| Added `ORDERS_QUERY_KEY`, `SELLER_ORDERS_QUERY_KEY` | `lib/queryClient.ts` |
| Mutation invalidation: createOrder → orders, seller-orders, notifications | `hooks/useOrders.ts` |
| Mutation invalidation: updateSellerOrderStatus → seller-orders, notifications | `hooks/useSellerOrders.ts` |
| Dev-only logs for bookings, notifications, orders, mutations | `hooks/useBookings.ts`, `useNotifications.ts`, `useOrders.ts`, `useSellerOrders.ts` |
| Created `docs/CROSS_ROLE_DEBUGGING.md` | Debugging guide |
| Updated `docs/CROSS_ROLE_SYNC_MATRIX.md` | New endpoints, keys, implemented vs gaps |
| Created `api/sellerProducts.ts` | List, get, create, update seller products |
| Created `useSellerProducts`, `useCreateSellerProduct`, `useUpdateSellerProduct` | `hooks/useSellerProducts.ts` |
| Wired SellerProductsPage to `useSellerProducts()` | List from API; add/edit via mutations |
| Wired SellerDashboardPage products to `useSellerProducts()` | Products count from API |
| Fixed SellerOrdersPage deep link | Accept `?focus=` as well as `?order=` for notifications |
| Created `api/animals.ts`, `api/cases.ts` | list, get, create; cases: closeCase |
| Created `useAnimals`, `useCreateAnimal`, `useCases`, `useVetCases`, `useCreateCase`, `useCloseCase` | `hooks/useAnimals.ts`, `hooks/useCases.ts` |
| Refactored Records page to use `useAnimals()`, `useCases()` | Animals + cases from API; timeline merges cases + scanRecords + timelineRecords |
| Refactored Scan page to use `useAnimals()` | Animals from API |
| Refactored BookAppointmentSheet to use `useAnimals()` | Animals from API |
| Implemented VetCasesPage with `useVetCases()` | Shows cases where vet_user_id == me |
| Added backend `GET /v1/cases?scope=vet` | Vet sees assigned cases |
| Added `vet_user_id` to Case model | Migration 007 |
| Added seller notification on order create | Backend OrderService creates notification for seller with action_url |
| Added seed case assigned to vet | For VetCasesPage QA |

---

## 3. Still Backend-Missing / Stub

| Gap | Description |
|-----|-------------|
| **Active cases / Patients seen (Vet dashboard)** | Active cases count derived from useVetCases(); "Patients seen" still 0 (no backend aggregate). |
| **Seller archive/delete** | Backend forbids seller from changing `is_active`; no delete endpoint. Archive/delete show toast. |
| **Animal update/delete** | Backend has no PATCH/DELETE /animals. Edit/Archive/Delete show toast. |

---

## 4. QA Checklist (Create → See on Other Role → Accept/Decline → Lists Update → Deep Link)

### Bookings (Owner ↔ Vet)

1. Log in as Owner. Go to Appointments → Book a vet → submit.
2. **Check:** Owner Pending tab shows the request.
3. Log in as Vet (or refocus tab if same session). **Check:** Vet Requested tab shows it; dashboard "Pending requests" increments.
4. Vet: Accept. **Check:** Owner Upcoming shows it; Owner gets notification.
5. Owner: Notifications → View details. **Check:** Deep link opens `/appointments?status=upcoming&focus=<id>`.

### Orders (Owner ↔ Seller)

1. Log in as Owner. Add products from Marketplace to cart. Go to Checkout → Place order.
2. **Check:** Redirect to /orders; order appears in list.
3. Log in as Seller. **Check:** Within ~10s or after refocus, Seller Dashboard and Seller Orders show the new order.
4. Seller: Update status (e.g. Mark packed). **Check:** Order status updates.
5. Owner: Refresh /orders. **Check:** Order shows updated status.
6. **Deep link:** Notification "New order" → `/seller/orders?focus=<orderId>` opens details (seller gets notification on order create).

### Records (Owner)

1. **Animals:** Log in as Owner → Records → Add Animal → submit. **Check:** Animal appears in "My Animals" list from API.
2. **Cases in timeline:** Create a case (via scan or API). **Check:** Case appears in Health Timeline as "scan" type.
3. **Scan page:** Records → select animal → Start Scan. **Check:** Animal list comes from API (useAnimals).

### Vet Cases (Vet)

1. **Assigned cases:** Log in as Vet → Cases. **Check:** Shows cases where vet_user_id == vet (seed creates one).
2. **Active cases count:** Vet Home → "Active cases" card. **Check:** Count reflects useVetCases() data.

### Notifications

1. **Single source:** All roles use `useNotifications()` → `GET /v1/notifications`. Unread count from same list.
2. **Mark read:** Invalidates `['notifications']`.
3. **Deep links:** action_url or fallback (entityType + entityId + role) routes correctly.

### Debugging

- Open DevTools Console. In dev, `[useBookings]`, `[useNotifications]`, `[useOrders]` log fetch counts.
- After mutations: `[useCreateBooking] invalidated: bookings, notifications`, etc.
- See `docs/CROSS_ROLE_DEBUGGING.md` for network checks and failure modes.

---

## 6. Query Keys Summary

| Key | Invalidated On |
|-----|----------------|
| `['bookings']` | createBooking, updateBookingStatus |
| `['bookings', id]` | updateBookingStatus |
| `['notifications']` | createBooking, updateBookingStatus, createOrder, updateSellerOrderStatus, markRead, login/logout |
| `['orders']` | createOrder |
| `['seller-orders']` | createOrder, updateSellerOrderStatus |
| `['seller-products']` | createSellerProduct, updateSellerProduct |

All list queries use `staleTime: 5_000`, `refetchInterval: 10_000`, `refetchOnWindowFocus: true` for cross-role visibility.
