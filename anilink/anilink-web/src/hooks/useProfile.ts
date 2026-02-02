import { useMutation } from '@tanstack/react-query'
import { patchMe, uploadAvatar } from '@/api/users'
import type { PatchMeBody } from '@/api/users'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/components/ui/use-toast'

/** Mutation: PATCH /users/me. On success refreshes auth user and shows toast. */
export function useUpdateMe() {
  const refreshUser = useAuthStore((s) => s.refreshUser)
  const { push } = useToast()
  return useMutation({
    mutationFn: (body: PatchMeBody) => patchMe(body),
    onSuccess: async () => {
      await refreshUser()
      push({ title: 'Profile saved', description: 'Your changes have been saved.' })
    },
    onError: () => {
      push({ title: 'Error', description: 'Failed to save profile.', variant: 'destructive' })
    },
  })
}

/** Mutation: POST /users/me/avatar. On success refreshes auth user and shows toast. */
export function useUploadAvatar() {
  const refreshUser = useAuthStore((s) => s.refreshUser)
  const { push } = useToast()
  return useMutation({
    mutationFn: (file: File) => uploadAvatar(file),
    onSuccess: async () => {
      await refreshUser()
      push({ title: 'Photo updated', description: 'Your profile photo has been updated.' })
    },
    onError: () => {
      push({ title: 'Error', description: 'Failed to upload photo.', variant: 'destructive' })
    },
  })
}
