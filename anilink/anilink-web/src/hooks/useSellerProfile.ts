import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSellerProfile, patchSellerProfile } from '@/api/seller'
import type { SellerProfileDto } from '@/api/seller'
import { useToast } from '@/components/ui/use-toast'

const SELLER_PROFILE_KEY = ['seller', 'profile'] as const

/** Query: GET /v1/seller/profile (seller-only). */
export function useSellerProfile(enabled = true) {
  return useQuery({
    queryKey: SELLER_PROFILE_KEY,
    queryFn: getSellerProfile,
    enabled,
  })
}

/** Mutation: PATCH /v1/seller/profile. */
export function useUpdateSellerProfile() {
  const queryClient = useQueryClient()
  const { push } = useToast()
  return useMutation({
    mutationFn: (body: Partial<SellerProfileDto>) => patchSellerProfile(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SELLER_PROFILE_KEY })
      push({ title: 'Profile saved', description: 'Your vendor details have been updated.' })
    },
    onError: () => {
      push({ title: 'Error', description: 'Failed to save profile.' })
    },
  })
}
