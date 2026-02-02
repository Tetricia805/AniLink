# Cross-role Sync Debugging Guide

Use this guide when investigating sync issues: one role performs an action but another role does not see the update.

## Common Failure Modes

| Symptom | Likely cause | Check |
|--------|---------------|-------|
| Owner creates booking, Vet never sees it | Backend filter wrong; or React Query not refetching | Network: `GET /v1/bookings` as Vet returns the booking? Query keys invalidated? |
| Vet accepts, Owner still sees "Pending" | Status not persisted; or Owner list not invalidated | Network: `PUT .../status` returns 200? `GET /v1/bookings` as Owner returns CONFIRMED? |
| Notification arrives but deep link shows wrong tab | Wrong `action_url` or tab mapping | Notification payload `action_url`; `status` param in URL; `bookingStatus.ts` mapping |
| Orders page empty after checkout | Order created but list not refetched | `['orders']` invalidated on create? Refetch interval / on focus? |
| Seller never sees new order | Backend notification missing; or Seller list not refetching | Backend creates notification for seller? `['seller-orders']` invalidated? |
| Dashboard counters stuck at 0 | Page uses Zustand instead of API; or wrong query | Page uses `useBookings()` / `useOrders()`? |

## What to Check in Network Tab

1. **After Owner creates booking**
   - `POST /v1/bookings` → 201, returns new booking with `status: "REQUESTED"`
   - As Vet: `GET /v1/bookings` → 200, array includes that booking
   - `GET /v1/notifications` → Vet has "New booking request"

2. **After Vet accepts**
   - `PUT /v1/bookings/:id/status` body `{ "status": "CONFIRMED" }` → 200
   - As Owner: `GET /v1/bookings` → array includes that booking with `status: "CONFIRMED"`
   - Owner notifications include "Your appointment has been confirmed"

3. **After Owner places order**
   - `POST /v1/orders` → 201, returns order with `status: "pending"`
   - As Owner: `GET /v1/orders` → array includes new order
   - As Seller: `GET /v1/seller/orders` → array includes new order (if items are from that seller)

4. **After Seller updates order status**
   - `PATCH /v1/seller/orders/:id` body `{ "status": "packed" }` → 200
   - As Owner: `GET /v1/orders` → order shows updated status
   - As Seller: `GET /v1/seller/orders` → order shows updated status

## Expected Response Shapes and Status Values

### Bookings

- **GET /v1/bookings**: `[{ id, vetId, userId, status, scheduledAt, ... }]`
- **Status values (uppercase)**: `REQUESTED`, `CONFIRMED`, `DECLINED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`
- Owner tabs: Pending (REQUESTED), Upcoming (CONFIRMED/IN_PROGRESS), Past (COMPLETED), Cancelled (DECLINED/CANCELLED)
- Vet tabs: Requested (REQUESTED), Confirmed (CONFIRMED/IN_PROGRESS), Completed (COMPLETED)

### Orders

- **GET /v1/orders** (owner): `[{ id, items, totalAmount, status, ... }]`
- **GET /v1/seller/orders**: `[{ id, status, totalAmount, items, ... }]`
- **Order status**: `pending`, `confirmed`, `packed`, `dispatched`, `delivered`, `cancelled`

### Notifications

- **GET /v1/notifications**: `[{ id, title, message, isRead, entityType, entityId, actionUrl, ... }]`
- `actionUrl` should point to the correct page with `?status=<tab>&focus=<id>` where applicable.

## Dev-only Console Logs

When `import.meta.env.DEV` is true, these hooks log after fetch/mutation:

- **useBookings**: `[useBookings] count: N, by status: { REQUESTED: n, ... }`
- **useNotifications**: `[useNotifications] count: N, unread: M`
- **useOrders**: `[useOrders] count: N`
- **useCreateBooking**: `[useCreateBooking] invalidated: bookings, notifications`
- **useUpdateBookingStatus**: `[useUpdateBookingStatus] invalidated: bookings, bookings/:id, notifications`
- **useCreateOrder**: `[useCreateOrder] invalidated: orders, seller-orders, notifications`
- **useCreateSellerProduct**: `[useCreateSellerProduct] invalidated: seller-products, marketplace-products`
- **useUpdateSellerProduct**: `[useUpdateSellerProduct] invalidated: seller-products, marketplace-products`
- **useAnimals**: `[useAnimals] count: N`
- **useCases**: `[useCases] count: N, by status: {...}`; on error: `[useCases] API error: <status> <body>`
- **VetCasesPage**: `[VetCasesPage] count: N, isLoading, isFetching, isError`
- **VetHome**: `[VetHome] bookings pending: X, total: Y`
- **useAdminStats**: `[useAdminStats]` (stats object)
- **useAdminUsers**: `[useAdminUsers] count: N, total: M`
- **useAdminVets**: `[useAdminVets] count: N, total: M`
- **useAdminProducts**: `[useAdminProducts] count: N, total: M`
- **useAdminReports**: `[useAdminReports] orders_by_day: N`
- **useAdminSettings**: `[useAdminSettings]` (settings object)

## Query Keys Reference

| Key | Entity | Invalidated on |
|-----|--------|----------------|
| `['bookings']` | Appointments list (Owner + Vet) | createBooking, updateBookingStatus |
| `['bookings', id]` | Single booking | updateBookingStatus |
| `['notifications']` | Notifications + unread count | createBooking, updateBookingStatus, createOrder, updateSellerOrderStatus, markNotificationRead |
| `['orders']` | Owner orders | createOrder |
| `['seller-orders']` | Seller orders | createOrder, updateSellerOrderStatus |
| `['seller-products']` | Seller products | createSellerProduct, updateSellerProduct |
| `['marketplace-products']` | Marketplace listing | createSellerProduct, updateSellerProduct |
| `['animals']` | Animals (Records, Scan, BookAppointmentSheet) | createAnimal |
| `['cases']` | Cases (Records, VetCasesPage) | createCase, closeCase |

**Records deep link:** `/records?focusCase=<caseId>` (UUID string) opens RecordDetailsSheet and highlights the case in the timeline.

## Refetch Strategy

- **Bookings, Notifications, Orders, Seller orders, Animals, Cases**: `staleTime: 5_000`, `refetchInterval: 10_000`, `refetchOnWindowFocus: true`
- This ensures cross-role visibility within ~10s or when user refocuses the tab.

## Vet Cases Page Flicker (Fixed)

**Root cause:** Vet Cases page was alternating between skeleton and error every ~2 seconds because:
1. React Query's default `retry` caused repeated retries when API returned 403/500; each retry briefly showed loading.
2. Skeleton was driven by `isLoading`, which became true again during retries.
3. Error state did not persist because retries cycled the UI.

**Fix:**
- **useCases/useVetCases**: Set `retry: false` to stop retry loop; use `placeholderData: keepPreviousData` so background refetch failure keeps showing cached list.
- **VetCasesPage**: Skeleton only when `isLoading && !cases.length` (initial load, no cached data). Error only when `isError && !cases.length` (so cached data stays visible on refetch failure).
- **Background refetch failure**: When `isError && cases.length > 0`, show non-blocking toast "Could not refresh cases" and keep list visible.
- **DEV logs**: `[useCases] API error:` logs HTTP status/body on failure; `[VetCasesPage] count:` logs isLoading, isFetching, isError.
