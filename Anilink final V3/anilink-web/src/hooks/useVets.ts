import { useQuery } from '@tanstack/react-query'
import { listVets, getVet, mapVetDtoToVet } from '@/api/vets'
import type { ListVetsParams } from '@/api/vets'

export const VETS_QUERY_KEY = ['vets'] as const

/**
 * List verified vets from GET /v1/vets.
 * Default: no filters = all verified vets. Apply filters only when user selects them.
 */
export function useVetsList(params?: ListVetsParams) {
  return useQuery({
    queryKey: [...VETS_QUERY_KEY, params ?? 'all'],
    queryFn: async () => {
      const dtos = await listVets(params)
      return dtos.map(mapVetDtoToVet)
    },
  })
}

/**
 * Single vet by id from GET /v1/vets/:id.
 */
export function useVet(id: string | undefined | null, enabled = true) {
  return useQuery({
    queryKey: ['vets', id],
    queryFn: async () => {
      if (!id) throw new Error('Vet id required')
      const dto = await getVet(id)
      return mapVetDtoToVet(dto)
    },
    enabled: !!id && enabled,
  })
}
