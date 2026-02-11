import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listNotifications, markNotificationRead } from '@/api/notifications'
import { NOTIFICATIONS_QUERY_KEY } from '@/lib/queryClient'

export function useNotifications(enabled = true) {
  return useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: async () => {
      const list = await listNotifications()
      if (import.meta.env.DEV && Array.isArray(list)) {
        const unread = list.filter((n) => !n.isRead).length
        console.debug('[useNotifications] count:', list.length, 'unread:', unread)
      }
      return list
    },
    enabled,
    staleTime: 5_000,
    refetchInterval: enabled ? 10_000 : false,
    refetchOnWindowFocus: true,
  })
}

export function useUnreadCount(enabled = true): number {
  const { data } = useNotifications(enabled)
  if (!data) return 0
  return data.filter((n) => !n.isRead).length
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
    },
  })
}

/** Mark all unread as read (client-side: one request per unread). */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const list = queryClient.getQueryData<Awaited<ReturnType<typeof listNotifications>>>(NOTIFICATIONS_QUERY_KEY) ?? []
      const unreadIds = list.filter((n) => !n.isRead).map((n) => n.id)
      await Promise.all(unreadIds.map((id) => markNotificationRead(id)))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
    },
  })
}
