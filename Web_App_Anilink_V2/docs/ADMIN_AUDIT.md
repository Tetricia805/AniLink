# Admin Module Audit

## STEP 1 — Existing Implementation

### Frontend Admin Routes (all under `ProtectedRoute allowedRoles={['ADMIN']}`)

| Route | Page | Current State |
|-------|------|---------------|
| `/admin/dashboard` | AdminDashboardPage | Placeholder cards with "—" for Users, Vets, Products, Reports. No hooks. |
| `/admin/users` | AdminUsersPage | EmptyState "coming soon". No hooks. |
| `/admin/vets` | AdminVetsPage | EmptyState "coming soon". No hooks. |
| `/admin/products` | AdminProductsPage | EmptyState "coming soon". No hooks. |
| `/admin/reports` | AdminReportsPage | EmptyState "coming soon". No hooks. |
| `/admin/settings` | AdminSettingsPage | ProfileCard + generic "Platform-wide settings" text. No platform settings form. |

### Backend

- **No admin module** – no `/v1/admin/*` endpoints exist.
- **Auth**: `require_admin` in `app/core/rbac.py` exists and is ready.
- **Models**: users, vets, products, orders, bookings, cases exist. User has no `is_active`. Vet has `verified` (no explicit pending/rejected). Product has `is_active`, `verified` (no `is_flagged`, `admin_note`).
- **No platform_settings table** – needs migration.

### Missing Pieces Checklist

- [ ] Backend: Admin stats endpoint
- [ ] Backend: Admin users list + update (need User.is_active migration)
- [ ] Backend: Admin vets list + approve/reject (use Vet.verified; add rejection_reason for reject)
- [ ] Backend: Admin products list + update (add Product.is_flagged, admin_note if needed)
- [ ] Backend: Admin reports overview
- [ ] Backend: Platform settings table + GET/PUT
- [ ] Frontend: src/api/admin.ts
- [ ] Frontend: src/hooks/useAdmin.ts
- [ ] Frontend: Query keys in queryClient.ts
- [ ] Frontend: Wire all 6 admin pages to real data
- [ ] docs/ADMIN_QA.md
