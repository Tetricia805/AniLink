export interface NotificationDto {
  id: string
  title: string
  message: string
  type?: string
  relatedId?: string
  isRead: boolean
  createdAt: string
  entityType?: string  // booking, case, order, product, system
  entityId?: string
  actionUrl?: string
}
