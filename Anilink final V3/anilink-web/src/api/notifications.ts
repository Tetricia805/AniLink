import { api } from './http'
import type { NotificationDto } from '../types/notifications'

export async function listNotifications(): Promise<NotificationDto[]> {
  const response = await api.get<NotificationDto[]>('/notifications')
  return response.data
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.post(`/notifications/${id}/read`)
}
