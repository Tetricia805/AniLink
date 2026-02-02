import { api } from './http'
import type { UserDto } from '../types/auth'

export interface PatchMeBody {
  fullName?: string
  name?: string
  phone?: string | null
  avatarUrl?: string | null
}

/** PATCH /v1/users/me - update current user profile. */
export async function patchMe(body: PatchMeBody): Promise<UserDto> {
  const payload: Record<string, unknown> = {}
  if (body.fullName != null) payload.fullName = body.fullName
  if (body.name != null) payload.name = body.name
  if (body.phone !== undefined) payload.phone = body.phone
  if (body.avatarUrl !== undefined) payload.avatarUrl = body.avatarUrl
  const response = await api.patch<UserDto>('/users/me', payload)
  return response.data
}

/** POST /v1/users/me/avatar - upload profile photo (multipart). Returns { avatarUrl }. */
export async function uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post<{ avatarUrl: string }>('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}
