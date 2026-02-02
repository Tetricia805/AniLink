import type { ComponentType } from 'react'
import { Home, Scan, Stethoscope, ShoppingCart, FileText, Bell, Calendar, FolderOpen, Users, LayoutDashboard, Package, BarChart3, Settings, ShoppingBag, Wallet, User } from 'lucide-react'
import type { UserRole } from '@/types/auth'

export interface NavItem {
  id: string
  label: string
  icon: ComponentType<{ className?: string }>
  path: string
}

/** Owner/Farmer: Home, Scan, Vets, Marketplace, Records, Notifications */
export const OWNER_NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home, path: '/home' },
  { id: 'scan', label: 'Scan', icon: Scan, path: '/scan' },
  { id: 'vets', label: 'Vets', icon: Stethoscope, path: '/vets' },
  { id: 'marketplace', label: 'Shop', icon: ShoppingCart, path: '/marketplace' },
  { id: 'records', label: 'Records', icon: FileText, path: '/records' },
  { id: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications' },
]

/** Vet: Vet Home, Appointments, Cases, Patients */
export const VET_NAV_ITEMS: NavItem[] = [
  { id: 'vet-home', label: 'Home', icon: Home, path: '/vet/home' },
  { id: 'vet-appointments', label: 'Appointments', icon: Calendar, path: '/vet/appointments' },
  { id: 'vet-cases', label: 'Cases', icon: FolderOpen, path: '/vet/cases' },
  { id: 'vet-patients', label: 'Patients', icon: Users, path: '/vet/patients' },
]

/** Admin: Dashboard, Users, Vets, Products, Reports, Settings */
export const ADMIN_NAV_ITEMS: NavItem[] = [
  { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { id: 'admin-users', label: 'Users', icon: Users, path: '/admin/users' },
  { id: 'admin-vets', label: 'Vets', icon: Stethoscope, path: '/admin/vets' },
  { id: 'admin-products', label: 'Products', icon: Package, path: '/admin/products' },
  { id: 'admin-reports', label: 'Reports', icon: BarChart3, path: '/admin/reports' },
  { id: 'admin-settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
]

/** Seller/Vendor: Dashboard, Products, Orders, Payouts (optional), Profile. No owner/vet/admin routes. */
export const SELLER_NAV_ITEMS: NavItem[] = [
  { id: 'seller-dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/seller/dashboard' },
  { id: 'seller-products', label: 'Products', icon: Package, path: '/seller/products' },
  { id: 'seller-orders', label: 'Orders', icon: ShoppingBag, path: '/seller/orders' },
  { id: 'seller-payouts', label: 'Payouts', icon: Wallet, path: '/seller/payouts' },
  { id: 'seller-profile', label: 'Profile', icon: User, path: '/seller/profile' },
]

export function getNavItemsForRole(role: UserRole): NavItem[] {
  switch (role) {
    case 'OWNER':
      return OWNER_NAV_ITEMS
    case 'VET':
      return VET_NAV_ITEMS
    case 'ADMIN':
      return ADMIN_NAV_ITEMS
    case 'SELLER':
      return SELLER_NAV_ITEMS
    default:
      return OWNER_NAV_ITEMS
  }
}
