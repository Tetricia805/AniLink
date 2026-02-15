import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { listCases, getCase, createCase, closeCase } from '@/api/cases'
import type { CaseCreateForm } from '@/api/cases'
import { CASES_QUERY_KEY, ANIMALS_QUERY_KEY, NOTIFICATIONS_QUERY_KEY } from '@/lib/queryClient'
import { useToast } from '@/components/ui/use-toast'

export function useCases(params?: { animal_id?: string; status?: string; scope?: 'owner' | 'vet' }) {
  return useQuery({
    queryKey: [...CASES_QUERY_KEY, params?.animal_id ?? 'all', params?.status ?? 'all', params?.scope ?? 'owner'],
    queryFn: async () => {
      try {
        const list = await listCases(params)
        if (import.meta.env.DEV && Array.isArray(list)) {
          const statusCounts = list.reduce<Record<string, number>>((acc, c) => {
            const s = c.status ?? 'unknown'
            acc[s] = (acc[s] ?? 0) + 1
            return acc
          }, {})
          console.debug('[useCases] count:', list.length, 'by status:', statusCounts)
        }
        return list
      } catch (err: unknown) {
        if (import.meta.env.DEV) {
          const res = (err as { response?: { status?: number; data?: unknown } })?.response
          console.debug('[useCases] API error:', res?.status, res?.data)
        }
        throw err
      }
    },
    staleTime: 5_000,
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
    retry: false,
    placeholderData: keepPreviousData,
  })
}

export function useVetCases() {
  return useCases({ scope: 'vet' })
}

export function useCase(id: string | undefined | null, enabled = true) {
  return useQuery({
    queryKey: ['cases', id],
    queryFn: () => getCase(id!),
    enabled: enabled && !!id,
  })
}

export function useCreateCase() {
  const queryClient = useQueryClient()
  const { push } = useToast()

  return useMutation({
    mutationFn: (data: CaseCreateForm) => createCase(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CASES_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ANIMALS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
      if (import.meta.env.DEV) {
        console.debug('[useCreateCase] invalidated: cases, animals, notifications')
      }
      push({ title: 'Case created', description: 'Health case has been submitted.' })
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to create case'
      push({ title: 'Error', description: msg })
    },
  })
}

export function useCloseCase() {
  const queryClient = useQueryClient()
  const { push } = useToast()

  return useMutation({
    mutationFn: (id: string) => closeCase(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: CASES_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['cases', id] })
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
      if (import.meta.env.DEV) {
        console.debug('[useCloseCase] invalidated: cases, notifications')
      }
      push({ title: 'Case closed', description: 'Case has been marked as closed.' })
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to close case'
      push({ title: 'Error', description: msg })
    },
  })
}
