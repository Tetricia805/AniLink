import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiErrorMessage } from '@/lib/apiError'
import { listSellerOrders, updateSellerOrderStatus } from '@/api/sellerOrders'
import type { SellerOrderStatus } from '@/api/sellerOrders'
import { SELLER_ORDERS_QUERY_KEY, NOTIFICATIONS_QUERY_KEY } from '@/lib/queryClient'
import { useToast } from '@/components/ui/use-toast'

export function useSellerOrders(status?: string) {
  return useQuery({
    queryKey: [...SELLER_ORDERS_QUERY_KEY, status ?? 'all'],
    queryFn: () => listSellerOrders(status),
    staleTime: 5_000,
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
  })
}

export function useUpdateSellerOrderStatus() {
  const queryClient = useQueryClient()
  const { push } = useToast()

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: SellerOrderStatus }) =>
      updateSellerOrderStatus(orderId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: SELLER_ORDERS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['orders', variables.orderId] })
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
      if (import.meta.env.DEV) {
        console.debug('[useUpdateSellerOrderStatus] invalidated: seller-orders, notifications')
      }
      push({ title: 'Order updated', description: `Status set to ${variables.status}` })
    },
    onError: (error: unknown) => {
      const msg = getApiErrorMessage(error, 'Failed to update')
      push({ title: 'Error', description: msg })
    },
  })
}
