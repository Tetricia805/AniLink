import { api } from './http'
import type { VetDto, Vet, VetProfileMeDto, VetAvailabilityDto } from '../types/vets'

/** Optional query params for GET /v1/vets. Omit or pass undefined to show all verified vets. */
export interface ListVetsParams {
  latitude?: number
  longitude?: number
  radius_km?: number
  specialization?: string
  farmVisits?: boolean
  is24Hours?: boolean
}

/** GET /v1/vets - list verified vets. No auth required. Default: no filters = all verified vets. */
export async function listVets(params?: ListVetsParams): Promise<VetDto[]> {
  const searchParams = new URLSearchParams()
  if (params?.latitude != null) searchParams.set('latitude', String(params.latitude))
  if (params?.longitude != null) searchParams.set('longitude', String(params.longitude))
  if (params?.radius_km != null) searchParams.set('radius_km', String(params.radius_km))
  if (params?.specialization != null) searchParams.set('specialization', params.specialization)
  if (params?.farmVisits != null) searchParams.set('farmVisits', String(params.farmVisits))
  if (params?.is24Hours != null) searchParams.set('is24Hours', String(params.is24Hours))
  const query = searchParams.toString()
  const url = query ? `/vets?${query}` : '/vets'
  const response = await api.get<VetDto[]>(url)
  return response.data
}

/** Map backend VetDto to UI Vet (VetCard, VetDetailsPage). */
export function mapVetDtoToVet(dto: VetDto): Vet {
  const services = Array.isArray(dto.services)
    ? dto.services.map((s) => (typeof s === 'string' ? s : (s as { name: string }).name))
    : []
  const specialization = dto.specialization ? [dto.specialization] : []
  const specialties = [...specialization, ...services]
  if (dto.offersFarmVisits && !specialties.some((s) => /farm/i.test(s))) specialties.push('Farm Visits')
  if (dto.is24Hours && !specialties.some((s) => /24\/7/i.test(s))) specialties.push('24/7')
  return {
    id: dto.id,
    clinic: dto.clinicName ?? 'Clinic',
    vet: dto.name ?? 'Vet',
    rating: dto.rating ?? 0,
    reviews: dto.reviewCount ?? 0,
    distance: dto.distance_km != null ? `${dto.distance_km.toFixed(1)} km` : '—',
    specialties: specialties.length ? specialties : ['General'],
    availability: dto.availability ?? 'See profile',
    phone: dto.phone ?? '—',
    hours: 'See profile',
    address: dto.address ?? dto.locationLabel ?? undefined,
    lat: dto.latitude ?? undefined,
    lng: dto.longitude ?? undefined,
    farmVisits: dto.offersFarmVisits ?? false,
    twentyFourSeven: dto.is24Hours ?? false,
    services: services.length ? services : undefined,
  }
}

export async function getVet(id: string): Promise<VetDto> {
  const response = await api.get<VetDto>(`/vets/${id}`)
  return response.data
}

/** GET /v1/vets/me - vet profile (vet-only). */
export async function getVetMe(): Promise<VetProfileMeDto> {
  const response = await api.get<VetProfileMeDto>('/vets/me')
  return response.data
}

/** PATCH /v1/vets/me - update vet profile (vet-only). */
export async function patchVetMe(body: Partial<VetProfileMeDto>): Promise<VetProfileMeDto> {
  const payload: Record<string, unknown> = {}
  if (body.clinicName != null) payload.clinicName = body.clinicName
  if (body.district != null) payload.district = body.district
  if (body.address != null) payload.address = body.address
  if (body.locationLabel != null) payload.locationLabel = body.locationLabel
  if (body.latitude != null) payload.latitude = body.latitude
  if (body.longitude != null) payload.longitude = body.longitude
  if (body.offersFarmVisits != null) payload.offersFarmVisits = body.offersFarmVisits
  if (body.is24Hours != null) payload.is24Hours = body.is24Hours
  const response = await api.patch<VetProfileMeDto>('/vets/me', payload)
  return response.data
}

/** GET /v1/vets/me/availability - vet availability (vet-only). */
export async function getVetMeAvailability(): Promise<VetAvailabilityDto> {
  const response = await api.get<VetAvailabilityDto>('/vets/me/availability')
  return response.data
}

/** PUT /v1/vets/me/availability - update vet availability (vet-only). */
export async function putVetMeAvailability(body: VetAvailabilityDto): Promise<VetAvailabilityDto> {
  const response = await api.put<VetAvailabilityDto>('/vets/me/availability', body)
  return response.data
}
