# Admin Module QA Guide

## Prerequisites

- Run migrations: `alembic upgrade head` (includes 008_admin_support, 009_platform_settings_not_null)
- Seed data: `python scripts/seed_data.py`
- Login as admin: `admin@example.com` / `password123`

## 1. Admin Dashboard

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open `/admin/dashboard` as admin | Page loads |
| 2 | Check stat cards | Users, Vets, Products, Revenue show real numbers (not "—") |
| 3 | Check Recent bookings | List shows last 5 bookings with vet name, date, status |
| 4 | Check Recent orders | List shows last 5 orders with ID, amount, status |
| 5 | Click "View reports" | Navigates to `/admin/reports` |

**Dev log:** Console shows `[useAdminStats]` with stats object.

## 2. Admin Users

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open `/admin/users` | Table loads with name, email, role, status |
| 2 | Search by name/email | List filters |
| 3 | Filter by role (Owner/Vet/Seller) | List filters |
| 4 | Filter by status (Active/Inactive) | List filters |
| 5 | Change role via dropdown | Confirm dialog appears; on confirm, user role updates |
| 6 | Click Deactivate | Confirm dialog; on confirm, user becomes inactive (cannot deactivate self) |
| 7 | Click Activate (inactive user) | Confirm dialog; on confirm, user becomes active |

**Dev log:** Console shows `[useAdminUsers] count: N, total: M`.

## 3. Admin Vets

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open `/admin/vets` | Tabs: Pending, Approved, Rejected |
| 2 | Pending tab | Shows vets with verified=false, no rejection_reason |
| 3 | Click Approve | Vet moves to Approved tab; toast "Vet approved" |
| 4 | Click Reject | Dialog opens; optional reason; on confirm, vet moves to Rejected; vet receives notification |
| 5 | Approved tab | Shows verified vets |
| 6 | Rejected tab | Shows vets with rejection_reason set |
| 7 | Search | Filters by name, email, clinic |

**Dev log:** Console shows `[useAdminVets] count: N, total: M`.

## 4. Admin Products

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open `/admin/products` | Table loads with title, seller, price, stock, status |
| 2 | Filter by status (Active/Inactive/Flagged) | List filters |
| 3 | Search | Filters by title or seller |
| 4 | Click Disable | Product becomes inactive; toast |
| 5 | Click Enable | Product becomes active; toast |
| 6 | Click Flag | Product shows Flagged badge; toast |
| 7 | Click Unflag | Flag removed; toast |
| 8 | Click Note | Dialog opens; edit admin note; Save updates product |

**Dev log:** Console shows `[useAdminProducts] count: N, total: M`.

## 5. Admin Reports

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open `/admin/reports` | Date range inputs + 4 report sections |
| 2 | Change date range | Data refetches for new range |
| 3 | Click "7 days" / "30 days" | Range updates |
| 4 | Orders by day | List of date, count, total |
| 5 | Bookings by status | Counts per status |
| 6 | Top sellers | Seller name, orders, total |
| 7 | Top products | Product title, order count |

**Dev log:** Console shows `[useAdminReports] orders_by_day: N`.

## 6. Admin Settings

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open `/admin/settings` | Form with platform fee, max distance, currency, notifications |
| 2 | Edit values | Inputs update |
| 3 | Click Save settings | Toast "Settings saved" |
| 4 | Refresh page | Values persist |

**Dev log:** Console shows `[useAdminSettings]` and `[useUpdateAdminSettings] invalidated`.

## Authorization

- All `/v1/admin/*` endpoints require ADMIN role.
- Non-admin users receive 403 when calling admin API.
- Frontend routes under `/admin/*` are protected by `ProtectedRoute allowedRoles={['ADMIN']}`.

## Migration 008

Adds:

- `users.is_active` (default true)
- `vets.rejection_reason` (nullable)
- `marketplace_products.is_flagged` (default false)
- `marketplace_products.admin_note` (nullable)
- `platform_settings` table (key, value, updated_at)
