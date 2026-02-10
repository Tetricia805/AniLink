/**
 * Notification "View details" routing (Web).
 *
 * AUDIT (Part A):
 * - Web NotificationsPage renders "View details" per card; click uses getNotificationHref(n, role) then navigate(href).
 * - Routing: prefer notification.actionUrl if present; else fallback from entityType + entityId (and relatedId) by role.
 * - Order detail: anilink-web/src/pages/OrderDetailPage.tsx — useOrder(id), useCancelOrder(), ContactSellerModal.
 * - Vet pending: VetHomePage and VetAppointmentsPage both use useBookings() with query key ['bookings']; pending = status === 'REQUESTED'.
 */

export type NotificationLike = {
  actionUrl?: string | null
  entityType?: string
  entityId?: string
  relatedId?: string
}

/**
 * Supported action_url patterns:
 * - Bookings: /appointments?status=...&focus=<id> (owner), /vet/appointments?status=...&focus=<id> (vet)
 * - Orders: /orders/<orderId> (owner), /seller/orders?focus=<orderId> (seller)
 * - Cases: /records?focusCase=<caseId> (owner), /vet/cases?focus=<caseId> (vet)
 */
export function getNotificationHref(
  n: NotificationLike,
  userRole?: string
): string | undefined {
  if (n.actionUrl && n.actionUrl.trim()) {
    const url = n.actionUrl.trim()
    // Already a path; ensure it's same-origin (starts with /)
    if (url.startsWith('/')) return url
    // Backend might send full URL; use pathname if same origin
    try {
      const parsed = new URL(url, window.location.origin)
      if (parsed.origin === window.location.origin && parsed.pathname) return parsed.pathname + parsed.search
    } catch {
      // ignore
    }
  }

  const entityType = n.entityType?.toLowerCase()
  const entityId = n.entityId || n.relatedId
  if (!entityType || !entityId) return undefined

  const role = (userRole ?? '').toUpperCase()
  switch (entityType) {
    case 'booking':
      return role === 'VET'
        ? `/vet/appointments?status=requested&focus=${entityId}`
        : `/appointments?status=upcoming&focus=${entityId}`
    case 'order':
      return role === 'SELLER' ? `/seller/orders?focus=${entityId}` : `/orders/${entityId}`
    case 'case':
      return role === 'VET' ? `/vet/cases?focus=${entityId}` : `/records?focusCase=${entityId}`
    case 'scan':
      return role === 'OWNER' ? `/records?focusScan=${entityId}` : undefined
    case 'product':
      return role === 'SELLER' ? `/seller/products?focus=${entityId}` : `/marketplace/${entityId}`
    default:
      return undefined
  }
}
