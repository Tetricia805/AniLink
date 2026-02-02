import { Navigate, Route, Routes } from 'react-router-dom'
import { PublicRoute } from './PublicRoute'
import { ProtectedRoute } from './ProtectedRoute'
import { SellerRouteGuard } from './SellerRouteGuard'
import { CatchAllRoute } from './CatchAllRoute'
import { AppShell } from '../components/layout/AppShell'
import { SellerLayout } from '../components/layout/SellerLayout'
import { NotificationsLayout } from '../components/layout/NotificationsLayout'
import { LandingPage } from '@/pages/landing'
import { LoginPage } from '@/pages/login'
import { RegisterPage } from '@/pages/register'
import { PermissionsPage } from '../pages/PermissionsPage'
import { TermsPage } from '@/pages/TermsPage'
import { PrivacyPage } from '@/pages/PrivacyPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'
import { HomePage } from '@/pages/home'
import { VetsPage } from '@/pages/vets'
import { VetsMapPage } from '@/pages/vets-map'
import { VetDetailsPage } from '@/pages/vet-details'
import { MarketplacePage } from '@/pages/marketplace'
import { ProductDetailPage } from '../pages/ProductDetailPage'
import { CartPage } from '@/pages/cart'
import { OrdersPage } from '../pages/OrdersPage'
import { OrderDetailPage } from '../pages/OrderDetailPage'
import { ScanPage } from '@/pages/scan'
import { RecordsPage } from '@/pages/records'
import { AppointmentsPage } from '@/pages/appointments'
import { NotificationsPage } from '../pages/NotificationsPage'
import { ProfilePage } from '@/pages/profile'
import { SettingsPage } from '../pages/SettingsPage'
import { CheckoutPage } from '@/pages/checkout'
import { VetHomePage } from '@/pages/vet/VetHomePage'
import { VetAppointmentsPage } from '@/pages/vet/VetAppointmentsPage'
import { VetCasesPage } from '@/pages/vet/VetCasesPage'
import { VetPatientsPage } from '@/pages/vet/VetPatientsPage'
import { VetProfilePage } from '@/pages/vet/VetProfilePage'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { AdminVetsPage } from '@/pages/admin/AdminVetsPage'
import { AdminProductsPage } from '@/pages/admin/AdminProductsPage'
import { AdminReportsPage } from '@/pages/admin/AdminReportsPage'
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage'
import { SellerDashboardPage } from '@/pages/seller/SellerDashboardPage'
import { SellerProductsPage } from '@/pages/seller/SellerProductsPage'
import { SellerOrdersPage } from '@/pages/seller/SellerOrdersPage'
import { SellerPayoutsPage } from '@/pages/seller/SellerPayoutsPage'
import { SellerProfilePage } from '@/pages/seller/SellerProfilePage'

export function AppRoutes() {
  return (
    <Routes>
      {/* Public: unauthenticated only; authenticated redirect to role home */}
      <Route element={<PublicRoute />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/permissions" element={<PermissionsPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route path="/welcome" element={<Navigate to="/" replace />} />
      {/* Backward compatibility: old vet edit URL → vet-only edit route */}
      <Route path="/vets/me/edit" element={<Navigate to="/vet/profile" replace />} />

      {/* Notifications: shared route for all roles (must be before role-specific blocks so /notifications matches here first) */}
      <Route element={<ProtectedRoute allowedRoles={['OWNER', 'VET', 'ADMIN', 'SELLER']} />}>
        <Route element={<NotificationsLayout />}>
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>
      </Route>

      {/* Owner/Farmer: /home, /scan, /vets, /marketplace, /records, etc. */}
      <Route element={<ProtectedRoute allowedRoles={['OWNER']} />}>
        <Route element={<AppShell />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/vets" element={<VetsPage />} />
          <Route path="/vets/map" element={<VetsMapPage />} />
          <Route path="/vets/:id" element={<VetDetailsPage />} />
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
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Vet: /vet/home, /vet/appointments, /vet/cases, /vet/patients, /vet/profile */}
      <Route element={<ProtectedRoute allowedRoles={['VET']} />}>
        <Route element={<AppShell />}>
          <Route path="/vet/home" element={<VetHomePage />} />
          <Route path="/vet/appointments" element={<VetAppointmentsPage />} />
          <Route path="/vet/cases" element={<VetCasesPage />} />
          <Route path="/vet/patients" element={<VetPatientsPage />} />
          <Route path="/vet/profile" element={<VetProfilePage />} />
        </Route>
      </Route>

      {/* Admin: /admin/* */}
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

      {/* Catch-all: authenticated → role home; unauthenticated → /login */}
      <Route path="*" element={<CatchAllRoute />} />
    </Routes>
  )
}
