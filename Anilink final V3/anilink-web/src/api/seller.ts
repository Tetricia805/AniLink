import { api } from './http'

export interface SellerProfileDto {
  storeName?: string | null
  contactEmail?: string | null
}

/** GET /v1/seller/profile - seller profile (seller-only). */
export async function getSellerProfile(): Promise<SellerProfileDto> {
  const response = await api.get<SellerProfileDto>('/seller/profile')
  return response.data
}

/** PATCH /v1/seller/profile - update seller profile (seller-only). */
export async function patchSellerProfile(
  body: Partial<SellerProfileDto>
): Promise<SellerProfileDto> {
  const payload: Record<string, unknown> = {}
  if (body.storeName !== undefined) payload.storeName = body.storeName
  if (body.contactEmail !== undefined) payload.contactEmail = body.contactEmail
  const response = await api.patch<SellerProfileDto>('/seller/profile', payload)
  return response.data
}
