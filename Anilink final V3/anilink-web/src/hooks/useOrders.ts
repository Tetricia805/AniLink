import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiErrorMessage } from '@/lib/apiError'
import { listOrders, getOrder, createOrder, cancelOrder } from '@/api/orders'
import type { OrderCreateDto } from '@/api/orders'
import { ORDERS_QUERY_KEY, SELLER_ORDERS_QUERY_KEY, NOTIFICATIONS_QUERY_KEY } from '@/lib/queryClient'
import { useToast } from '@/components/ui/use-toast'

export function useOrders(status?: string) {
  return useQuery({
    queryKey: [...ORDERS_QUERY_KEY, status ?? 'all'],
    queryFn: async () => {
      const list = await listOrders(status);
      if (import.meta.env.DEV && Array.isArray(list)) {
        console.debug('[useOrders] count:', list.length);
      }
      return list;
    },
    staleTime: 5_000,
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
  })
}

export function useOrder(id: string | undefined | null, enabled = true) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => getOrder(id!),
    enabled: enabled && !!id,
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  const { push } = useToast()

  return useMutation({
    mutationFn: (data: OrderCreateDto) => createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: SELLER_ORDERS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
      if (import.meta.env.DEV) {
        console.debug('[useCreateOrder] invalidated: orders, seller-orders, notifications')
      }
      push({ title: 'Order placed', description: "We'll notify you when it ships." })
    },
    onError: (error: unknown) => {
      push({ title: 'Error', description: getApiErrorMessage(error, 'Failed to place order') })
    },
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()
  const { push } = useToast()

  return useMutation({
    mutationFn: (id: string) => cancelOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['orders', id] })
      queryClient.invalidateQueries({ queryKey: SELLER_ORDERS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
      push({ title: 'Order cancelled' })
    },
    onError: (error: unknown) => {
      push({ title: 'Error', description: getApiErrorMessage(error, 'Failed to cancel') })
    },
  })
}
