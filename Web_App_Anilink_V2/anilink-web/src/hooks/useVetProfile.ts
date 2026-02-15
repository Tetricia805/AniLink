import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getVetMe,
  patchVetMe,
  getVetMeAvailability,
  putVetMeAvailability,
} from '@/api/vets'
import type { VetProfileMeDto, VetAvailabilityDto } from '@/types/vets'
import { useToast } from '@/components/ui/use-toast'

const VET_ME_KEY = ['vets', 'me'] as const
const VET_AVAILABILITY_KEY = ['vets', 'me', 'availability'] as const

/** Query: GET /vets/me (vet-only). */
export function useVetProfile(enabled: boolean = true) {
  return useQuery({
    queryKey: VET_ME_KEY,
    queryFn: getVetMe,
    enabled,
  })
}

/** Mutation: PATCH /vets/me. On success invalidates vet profile and shows toast. */
export function useUpdateVetProfile() {
  const queryClient = useQueryClient()
  const { push } = useToast()
  return useMutation({
    mutationFn: (body: Partial<VetProfileMeDto>) => patchVetMe(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VET_ME_KEY })
      push({ title: 'Clinic profile saved', description: 'Your changes have been saved.' })
    },
    onError: () => {
      push({ title: 'Error', description: 'Failed to save clinic profile.', variant: 'destructive' })
    },
  })
}

/** Query: GET /vets/me/availability (vet-only). */
export function useVetAvailability(enabled: boolean = true) {
  return useQuery({
    queryKey: VET_AVAILABILITY_KEY,
    queryFn: getVetMeAvailability,
    enabled,
  })
}

/** Mutation: PUT /vets/me/availability. On success invalidates and shows toast. */
export function useUpdateVetAvailability() {
  const queryClient = useQueryClient()
  const { push } = useToast()
  return useMutation({
    mutationFn: (body: VetAvailabilityDto) => putVetMeAvailability(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VET_AVAILABILITY_KEY })
      push({ title: 'Availability saved', description: 'Your schedule has been updated.' })
    },
    onError: () => {
      push({ title: 'Error', description: 'Failed to save availability.', variant: 'destructive' })
    },
  })
}
