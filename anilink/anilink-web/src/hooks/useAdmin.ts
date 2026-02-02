import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAdminStats,
  listAdminUsers,
  updateAdminUser,
  listAdminVets,
  approveVet,
  rejectVet,
  listAdminProducts,
  updateAdminProduct,
  getReportsOverview,
  getAdminSettings,
  updateAdminSettings,
} from '@/api/admin'
import type { AdminUserUpdate, AdminProductUpdate, AdminSettingsUpdate } from '@/api/admin'
import {
  ADMIN_STATS_QUERY_KEY,
  ADMIN_USERS_QUERY_KEY,
  ADMIN_VETS_QUERY_KEY,
  ADMIN_PRODUCTS_QUERY_KEY,
  ADMIN_REPORTS_QUERY_KEY,
  ADMIN_SETTINGS_QUERY_KEY,
} from '@/lib/queryClient'
import { useToast } from '@/components/ui/use-toast'

export function useAdminStats() {
  return useQuery({
    queryKey: ADMIN_STATS_QUERY_KEY,
    queryFn: async () => {
      const data = await getAdminStats()
      if (import.meta.env.DEV) {
        console.debug('[useAdminStats]', data)
      }
      return data
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  })
}

export function useAdminUsers(params?: {
  search?: string
  role?: string
  status?: string
  is_active?: boolean
  page?: number
  page_size?: number
}) {
  return useQuery({
    queryKey: [...ADMIN_USERS_QUERY_KEY, params ?? {}],
    queryFn: async () => {
      const data = await listAdminUsers(params)
      if (import.meta.env.DEV) {
        console.debug('[useAdminUsers] count:', data.items.length, 'total:', data.total)
      }
      return data
    },
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  })
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient()
  const { push } = useToast()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminUserUpdate }) => updateAdminUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ADMIN_STATS_QUERY_KEY })
      if (import.meta.env.DEV) console.debug('[useUpdateAdminUser] invalidated')
      push({ title: 'User updated', description: 'User has been updated successfully.' })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to update user'
      push({ title: 'Error', description: msg, variant: 'destructive' })
    },
  })
}

export function useAdminVets(params?: { status?: string; search?: string; page?: number; page_size?: number }) {
  return useQuery({
    queryKey: [...ADMIN_VETS_QUERY_KEY, params ?? {}],
    queryFn: async () => {
      const data = await listAdminVets(params)
      if (import.meta.env.DEV) {
        console.debug('[useAdminVets] count:', data.items.length, 'total:', data.total)
      }
      return data
    },
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  })
}

export function useApproveVet() {
  const queryClient = useQueryClient()
  const { push } = useToast()
  return useMutation({
    mutationFn: (id: string) => approveVet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_VETS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ADMIN_STATS_QUERY_KEY })
      if (import.meta.env.DEV) console.debug('[useApproveVet] invalidated')
      push({ title: 'Vet approved', description: 'Veterinarian has been approved.' })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to approve vet'
      push({ title: 'Error', description: msg, variant: 'destructive' })
    },
  })
}

export function useRejectVet() {
  const queryClient = useQueryClient()
  const { push } = useToast()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => rejectVet(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_VETS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ADMIN_STATS_QUERY_KEY })
      if (import.meta.env.DEV) console.debug('[useRejectVet] invalidated')
      push({ title: 'Vet rejected', description: 'Veterinarian has been rejected.' })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to reject vet'
      push({ title: 'Error', description: msg, variant: 'destructive' })
    },
  })
}

export function useAdminProducts(params?: { status?: string; search?: string; page?: number; page_size?: number }) {
  return useQuery({
    queryKey: [...ADMIN_PRODUCTS_QUERY_KEY, params ?? {}],
    queryFn: async () => {
      const data = await listAdminProducts(params)
      if (import.meta.env.DEV) {
        console.debug('[useAdminProducts] count:', data.items.length, 'total:', data.total)
      }
      return data
    },
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  })
}

export function useUpdateAdminProduct() {
  const queryClient = useQueryClient()
  const { push } = useToast()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminProductUpdate }) => updateAdminProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ADMIN_STATS_QUERY_KEY })
      if (import.meta.env.DEV) console.debug('[useUpdateAdminProduct] invalidated')
      push({ title: 'Product updated', description: 'Product has been updated.' })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to update product'
      push({ title: 'Error', description: msg, variant: 'destructive' })
    },
  })
}

export function useAdminReports(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: [...ADMIN_REPORTS_QUERY_KEY, params ?? {}],
    queryFn: async () => {
      const data = await getReportsOverview(params)
      if (import.meta.env.DEV) {
        console.debug('[useAdminReports] orders_by_day:', data.orders_by_day?.length ?? 0)
      }
      return data
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  })
}

export function useAdminSettings() {
  return useQuery({
    queryKey: ADMIN_SETTINGS_QUERY_KEY,
    queryFn: async () => {
      const data = await getAdminSettings()
      if (import.meta.env.DEV) {
        console.debug('[useAdminSettings]', data)
      }
      return data
    },
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  })
}

export function useUpdateAdminSettings() {
  const queryClient = useQueryClient()
  const { push } = useToast()
  return useMutation({
    mutationFn: (data: AdminSettingsUpdate) => updateAdminSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_SETTINGS_QUERY_KEY })
      if (import.meta.env.DEV) console.debug('[useUpdateAdminSettings] invalidated')
      push({ title: 'Settings saved', description: 'Platform settings have been updated.' })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to save settings'
      push({ title: 'Error', description: msg, variant: 'destructive' })
    },
  })
}
