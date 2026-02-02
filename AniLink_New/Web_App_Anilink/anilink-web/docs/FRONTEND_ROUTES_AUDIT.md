# Frontend Routes Audit

**Source:** Existing `App.tsx`, `AppRoutes.tsx`, route guards, layouts, and pages.  
**Backend base:** `/v1` (e.g. `http://localhost:8000/v1`).  
**No new routes or UI changes** — audit and documentation only.

---

## 1) Definitive list of ALL current frontend routes

| # | Route path | Page / component | Layout | Required role(s) |
|---|------------|-------------------|--------|-------------------|
| **Public (unauthenticated only)** | | | | |
| 1 | `/` | LandingPage | None (PublicRoute) | — |
| 2 | `/login` | LoginPage | None | — |
| 3 | `/register` | RegisterPage | None | — |
| 4 | `/permissions` | PermissionsPage | None | — |
| 5 | `/welcome` | Redirect → `/` | — | — |
| **Owner** | | | | |
| 6 | `/home` | HomePage | AppShell | OWNER |
| 7 | `/vets` | VetsPage | AppShell | OWNER |
| 8 | `/vets/map` | VetsMapPage | AppShell | OWNER |
| 9 | `/vets/:id` | VetDetailsPage | AppShell | OWNER |
| 10 | `/vets/me/edit` | VetProfileEditPage | AppShell | OWNER |
| 11 | `/marketplace` | MarketplacePage | AppShell | OWNER |
| 12 | `/marketplace/products/:id` | ProductDetailPage | AppShell | OWNER |
| 13 | `/cart` | CartPage | AppShell | OWNER |
| 14 | `/checkout` | CheckoutPage | AppShell | OWNER |
| 15 | `/orders` | OrdersPage | AppShell | OWNER |
| 16 | `/orders/:id` | OrderDetailPage | AppShell | OWNER |
| 17 | `/appointments` | AppointmentsPage | AppShell | OWNER |
| 18 | `/scan` | Redirect → `/scan/start` | — | OWNER |
| 19 | `/scan/start` | ScanPage | AppShell | OWNER |
| 20 | `/scan/capture` | Redirect → `/scan/start` | — | OWNER |
| 21 | `/scan/symptoms` | Redirect → `/scan/start` | — | OWNER |
| 22 | `/scan/summary` | Redirect → `/scan/start` | — | OWNER |
| 23 | `/scan/result` | Redirect → `/scan/start` | — | OWNER |
| 24 | `/records` | RecordsPage | AppShell | OWNER |
| 25 | `/notifications` | NotificationsPage | AppShell | OWNER |
| 26 | `/profile` | ProfilePage | AppShell | OWNER |
| 27 | `/settings` | SettingsPage | AppShell | OWNER |
| **Vet** | | | | |
| 28 | `/vet/home` | VetHomePage | AppShell | VET |
| 29 | `/vet/appointments` | VetAppointmentsPage | AppShell | VET |
| 30 | `/vet/cases` | VetCasesPage | AppShell | VET |
| 31 | `/vet/patients` | VetPatientsPage | AppShell | VET |
| 32 | `/vet/profile` | VetProfilePage | AppShell | VET |
| **Admin** | | | | |
| 33 | `/admin/dashboard` | AdminDashboardPage | AppShell | ADMIN |
| 34 | `/admin/users` | AdminUsersPage | AppShell | ADMIN |
| 35 | `/admin/vets` | AdminVetsPage | AppShell | ADMIN |
| 36 | `/admin/products` | AdminProductsPage | AppShell | ADMIN |
| 37 | `/admin/reports` | AdminReportsPage | AppShell | ADMIN |
| 38 | `/admin/settings` | AdminSettingsPage | AppShell | ADMIN |
| **Seller** | | | | |
| 39 | `/seller/dashboard` | SellerDashboardPage | SellerLayout | SELLER |
| 40 | `/seller/products` | SellerProductsPage | SellerLayout | SELLER |
| 41 | `/seller/orders` | SellerOrdersPage | SellerLayout | SELLER |
| 42 | `/seller/payouts` | SellerPayoutsPage | SellerLayout | SELLER |
| 43 | `/seller/profile` | SellerProfilePage | SellerLayout | SELLER |
| **Catch‑all** | | | | |
| 44 | `*` | CatchAllRoute (→ role home or `/login`) | — | — |

**Role homes (from `lib/auth.ts`):**

- OWNER → `/home`
- VET → `/vet/home`
- ADMIN → `/admin/dashboard`
- SELLER → `/seller/dashboard`

---

## 2) Issues identified

### Duplicate / alias routes (by design)

- `/scan`, `/scan/capture`, `/scan/symptoms`, `/scan/summary`, `/scan/result` all redirect to `/scan/start`. Not duplicates in the table; only `/scan/start` renders ScanPage. Documented as intentional.

### Unused routes

- **`/permissions`** — Has a route and PermissionsPage; no link found in nav. May be used for onboarding or external redirect; kept as-is.
- **`/welcome`** — Redirects to `/`; no in-app links found. Safe to keep for external links.

### Unused page (no route)

- **`src/pages/seller/SellerInventoryPage.tsx`** — Not referenced in `AppRoutes.tsx`. Seller nav uses Dashboard, Products, Orders, Payouts, Profile. **Recommendation:** Leave file; do not add a route unless product explicitly needs an “Inventory” page (optional/future).

### Wrong-role / ambiguous route

- **`/vets/me/edit`** — Guard: **OWNER only**. Page content: “Update vet profile” (clinic name, specialization, phone, district, address). So a vet profile edit UI is reachable only as OWNER. **Recommendation:** Treat as misplaced; intended behavior is likely “VET edits own profile”. Option (no change in this audit): move under VET guard at e.g. `/vet/profile/edit` or merge into existing `/vet/profile` (VetProfilePage). Documented only.

### Missing route guards

- All role-scoped routes sit behind:
  - **PublicRoute** — redirects authenticated users to role home; no public page after login.
  - **ProtectedRoute(allowedRoles)** — redirects unauthenticated to `/login`, wrong role to role home.
  - **SellerRouteGuard** — same as ProtectedRoute with `allowedRoles={['SELLER']}`; sellers cannot hit owner/vet/admin routes.
- No missing guards identified.

### Links to non-existent routes (optional/future)

- **`/terms`**, **`/privacy`** — Linked from RegisterPage; no routes in AppRoutes. Either add static/legal routes later or remove links.
- **`/forgot-password`** — Linked from LoginPage; no route. Optional/future.

---

## 3) Alignment with backend under `/v1`

### Frontend API usage (base URL = `/v1`)

| Frontend module | Endpoint(s) used | Backend prefix |
|-----------------|------------------|----------------|
| auth.ts | POST `/auth/login`, POST `/auth/register`, POST `/auth/logout` | /v1/auth |
| http.ts (refresh) | POST `/auth/refresh` (via `env.apiBaseUrl`) | /v1 (baseURL) |
| marketplace.ts | GET `/marketplace/products`, GET `/marketplace/products/:id` | /v1/marketplace |
| vets.ts | GET `/vets`, GET `/vets/:id` | /v1/vets |
| notifications.ts | GET `/notifications` | /v1/notifications |

### Frontend routes with no backend API usage yet (in this codebase)

These pages exist and are guarded; they may use mock data, other APIs, or be wired later:

- **Owner:** `/home` (summary/activity), `/scan` (AI/scan submit), `/records` (animals/timeline), `/appointments` (list/book), `/cart`, `/checkout`, `/orders`, `/orders/:id`, `/profile`, `/settings`
- **Vet:** `/vet/home`, `/vet/appointments`, `/vet/cases`, `/vet/patients`, `/vet/profile`
- **Admin:** `/admin/dashboard`, `/admin/users`, `/admin/vets`, `/admin/products`, `/admin/reports`, `/admin/settings`
- **Seller:** `/seller/dashboard`, `/seller/products`, `/seller/orders`, `/seller/payouts`, `/seller/profile`

Backend under `/v1` already provides (or is specified for) many of these (e.g. `/v1/animals`, `/v1/bookings`, `/v1/orders`, `/v1/seller/*`, etc.). The audit only confirms that the **current frontend API modules** (auth, marketplace, vets, notifications) do not yet call all of them.

### Backend endpoints not called by current frontend API layer

- **Auth:** GET `/auth/me` — not used; frontend uses stored user from login/register (and refresh token). Optional: call `/auth/me` on hydrate for fresh user.
- **Users:** `/v1/users/*` — not referenced in `src/api`.
- **Bookings:** `/v1/bookings/*` — not referenced; appointments UI may use later.
- **Animals:** `/v1/animals` — not referenced; records/scan may use later.
- **Cases:** `/v1/cases` — not referenced; vet cases may use later.
- **AI:** `/v1/ai` — not referenced; scan flow may use later.
- **Orders:** `/v1/orders` — not in `src/api`; checkout/orders pages may call directly or via a future orders API module.
- **Seller:** `/v1/seller/*` — not in `src/api`; seller pages may call directly or via a future seller API module.

---

## 4) Clean routes table (summary)

| Role | Landing route | Layout | Route count (real pages) |
|------|----------------|--------|---------------------------|
| Public | `/` | None | 4 (/, /login, /register, /permissions) |
| OWNER | `/home` | AppShell | 22 (including scan redirects) |
| VET | `/vet/home` | AppShell | 5 |
| ADMIN | `/admin/dashboard` | AppShell | 6 |
| SELLER | `/seller/dashboard` | SellerLayout | 5 |

Owner, Vet, Seller, and Admin each have a valid landing route used by `getRoleHome(role)` and CatchAllRoute.

---

## 5) Recommended final AppRoutes structure (existing pages only)

Keep current structure; only clarify comments and optional note for `/vets/me/edit`. No route renames or new routes.

```tsx
<Routes>
  {/* Public: unauthenticated only; authenticated → role home */}
  <Route element={<PublicRoute />}>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/permissions" element={<PermissionsPage />} />
  </Route>

  <Route path="/welcome" element={<Navigate to="/" replace />} />

  {/* Owner: /home, /scan, /vets, /marketplace, /records, etc. */}
  <Route element={<ProtectedRoute allowedRoles={['OWNER']} />}>
    <Route element={<AppShell />}>
      <Route path="/home" element={<HomePage />} />
      <Route path="/vets" element={<VetsPage />} />
      <Route path="/vets/map" element={<VetsMapPage />} />
      <Route path="/vets/:id" element={<VetDetailsPage />} />
      <Route path="/vets/me/edit" element={<VetProfileEditPage />} /> {/* Note: page is vet-profile UI; consider moving under VET if intended for vets */}
      <Route path="/marketplace" element={<MarketplacePage />} />
      <Route path="/marketplace/products/:id" element={<ProductDetailPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/orders/:id" element={<OrderDetailPage />} />
      <Route path="/appointments" element={<AppointmentsPage />} />
      <Route path="/scan" element={<Navigate to="/scan/start" replace />} />
      <Route path="/scan/start" element={<ScanPage />} />
      <Route path="/scan/capture" element={<Navigate to="/scan/start" replace />} />
      <Route path="/scan/symptoms" element={<Navigate to="/scan/start" replace />} />
      <Route path="/scan/summary" element={<Navigate to="/scan/start" replace />} />
      <Route path="/scan/result" element={<Navigate to="/scan/start" replace />} />
      <Route path="/records" element={<RecordsPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Route>
  </Route>

  {/* Vet */}
  <Route element={<ProtectedRoute allowedRoles={['VET']} />}>
    <Route element={<AppShell />}>
      <Route path="/vet/home" element={<VetHomePage />} />
      <Route path="/vet/appointments" element={<VetAppointmentsPage />} />
      <Route path="/vet/cases" element={<VetCasesPage />} />
      <Route path="/vet/patients" element={<VetPatientsPage />} />
      <Route path="/vet/profile" element={<VetProfilePage />} />
    </Route>
  </Route>

  {/* Admin */}
  <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
    <Route element={<AppShell />}>
      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      <Route path="/admin/users" element={<AdminUsersPage />} />
      <Route path="/admin/vets" element={<AdminVetsPage />} />
      <Route path="/admin/products" element={<AdminProductsPage />} />
      <Route path="/admin/reports" element={<AdminReportsPage />} />
      <Route path="/admin/settings" element={<AdminSettingsPage />} />
    </Route>
  </Route>

  {/* Seller: separate layout and guard */}
  <Route element={<SellerRouteGuard />}>
    <Route element={<SellerLayout />}>
      <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
      <Route path="/seller/products" element={<SellerProductsPage />} />
      <Route path="/seller/orders" element={<SellerOrdersPage />} />
      <Route path="/seller/payouts" element={<SellerPayoutsPage />} />
      <Route path="/seller/profile" element={<SellerProfilePage />} />
    </Route>
  </Route>

  <Route path="*" element={<CatchAllRoute />} />
</Routes>
```

No structural change; only the comment for `/vets/me/edit` is a recommended addition.

---

## 6) Final check

| Check | Status |
|-------|--------|
| Owner has valid landing route | Yes — `/home` |
| Vet has valid landing route | Yes — `/vet/home` |
| Seller has valid landing route | Yes — `/seller/dashboard` |
| Admin has valid landing route | Yes — `/admin/dashboard` |
| Public pages never render after login | Yes — `PublicRoute` redirects authenticated users to `getRoleHome(role)` |
| Role-based access enforced via guards (not CSS) | Yes — `ProtectedRoute(allowedRoles)` and `SellerRouteGuard`; wrong role → redirect to role home |

---

**Document version:** 1.0  
**Audit scope:** Existing frontend only; no new pages or route renames.
