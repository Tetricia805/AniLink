import { api } from './http'

export interface RecentBookingItem {
  id: string
  owner_name?: string | null
  owner_email?: string | null
  vet_name?: string | null
  clinic_name?: string | null
  date?: string | null
  status: string
  price?: number | null
}

export interface RecentOrderItem {
  id: string
  buyer_name?: string | null
  buyer_email?: string | null
  total_amount: number
  status: string
  created_at?: string | null
}

export interface AdminStats {
  total_users: number
  active_users: number
  total_vets: number
  pending_vets: number
  total_products: number
  flagged_products: number
  total_orders_amount?: number | null
  total_bookings: number
  total_orders: number
  recent_bookings: RecentBookingItem[]
  recent_orders: RecentOrderItem[]
}

export interface AdminUser {
  id: string
  email: string
  name: string
  role: string
  is_active: boolean
  createdAt?: string | null
}

export interface AdminUserListResponse {
  items: AdminUser[]
  total: number
}

export interface AdminUserUpdate {
  is_active?: boolean
  role?: string
}

export interface AdminVet {
  id: string
  userId: string
  name: string
  email: string
  clinicName: string
  district?: string | null
  address?: string | null
  verified: boolean
  rejectionReason?: string | null
  createdAt?: string | null
}

export interface AdminVetListResponse {
  items: AdminVet[]
  total: number
}

export interface AdminProduct {
  id: string
  title: string
  sellerId: string
  sellerName?: string | null
  price: number
  stockQty: number
  isActive: boolean
  isFlagged: boolean
  adminNote?: string | null
  category: string
  createdAt?: string | null
}

export interface AdminProductListResponse {
  items: AdminProduct[]
  total: number
}

export interface AdminProductUpdate {
  is_active?: boolean
  is_flagged?: boolean
  admin_note?: string | null
}

export interface OrdersByDayItem {
  date: string
  count: number
  total: number
}

export interface TopSellerItem {
  id: string
  name: string
  orders: number
  total: number
}

export interface TopProductItem {
  id: string
  title: string
  orders: number
}

export interface ReportsOverview {
  orders_by_day: OrdersByDayItem[]
  bookings_by_status: Record<string, number>
  top_sellers: TopSellerItem[]
  top_products: TopProductItem[]
}

export interface AdminSettings {
  platform_fee_percent: number
  max_booking_distance_km: number
  notifications_enabled: boolean
  default_currency: string
}

export interface AdminSettingsUpdate {
  platform_fee_percent?: number
  max_booking_distance_km?: number
  notifications_enabled?: boolean
  default_currency?: string
}

export async function getAdminStats(): Promise<AdminStats> {
  const response = await api.get<AdminStats>('/admin/stats')
  return response.data
}

export async function listAdminUsers(params?: {
  search?: string
  role?: string
  status?: string
  is_active?: boolean
  page?: number
  page_size?: number
}): Promise<AdminUserListResponse> {
  const response = await api.get<AdminUserListResponse>('/admin/users', { params })
  return response.data
}

export async function updateAdminUser(id: string, data: AdminUserUpdate): Promise<AdminUser> {
  const response = await api.patch<AdminUser>(`/admin/users/${id}`, data)
  return response.data
}

export async function listAdminVets(params?: {
  status?: string
  search?: string
  page?: number
  page_size?: number
}): Promise<AdminVetListResponse> {
  const response = await api.get<AdminVetListResponse>('/admin/vets', { params })
  return response.data
}

export async function approveVet(id: string): Promise<{ ok: boolean }> {
  const response = await api.patch<{ ok: boolean }>(`/admin/vets/${id}/approve`)
  return response.data
}

export async function rejectVet(id: string, reason?: string): Promise<{ ok: boolean }> {
  const response = await api.patch<{ ok: boolean }>(`/admin/vets/${id}/reject`, { reason: reason ?? null })
  return response.data
}

export async function listAdminProducts(params?: {
  status?: string
  search?: string
  page?: number
  page_size?: number
}): Promise<AdminProductListResponse> {
  const response = await api.get<AdminProductListResponse>('/admin/products', { params })
  return response.data
}

export async function updateAdminProduct(id: string, data: AdminProductUpdate): Promise<{ ok: boolean }> {
  const response = await api.patch<{ ok: boolean }>(`/admin/products/${id}`, data)
  return response.data
}

export async function getReportsOverview(params?: { start?: string; end?: string; from?: string; to?: string }): Promise<ReportsOverview> {
  const response = await api.get<ReportsOverview>('/admin/reports/overview', {
    params: params ? { start: params.start, end: params.end, from: params.from, to: params.to } : undefined,
  })
  return response.data
}

export async function getAdminSettings(): Promise<AdminSettings> {
  const response = await api.get<AdminSettings>('/admin/settings')
  return response.data
}

export async function updateAdminSettings(data: AdminSettingsUpdate | Record<string, string>): Promise<AdminSettings> {
  const body = typeof data === 'object' && data !== null && !Array.isArray(data)
    ? Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, typeof v === 'boolean' ? (v ? 'true' : 'false') : String(v)])
      )
    : data
  const response = await api.put<AdminSettings>('/admin/settings', body)
  return response.data
}
