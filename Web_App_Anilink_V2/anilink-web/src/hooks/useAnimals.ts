import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listAnimals, getAnimal, createAnimal } from '@/api/animals'
import type { AnimalCreateDto } from '@/api/animals'
import { ANIMALS_QUERY_KEY, CASES_QUERY_KEY } from '@/lib/queryClient'
import { useToast } from '@/components/ui/use-toast'

export function useAnimals() {
  return useQuery({
    queryKey: ANIMALS_QUERY_KEY,
    queryFn: async () => {
      const list = await listAnimals()
      if (import.meta.env.DEV && Array.isArray(list)) {
        console.debug('[useAnimals] count:', list.length)
      }
      return list
    },
    staleTime: 5_000,
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
  })
}

export function useAnimal(id: string | undefined | null, enabled = true) {
  return useQuery({
    queryKey: ['animals', id],
    queryFn: () => getAnimal(id!),
    enabled: enabled && !!id,
  })
}

export function useCreateAnimal() {
  const queryClient = useQueryClient()
  const { push } = useToast()

  return useMutation({
    mutationFn: (data: AnimalCreateDto) => createAnimal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ANIMALS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: CASES_QUERY_KEY })
      if (import.meta.env.DEV) {
        console.debug('[useCreateAnimal] invalidated: animals, cases')
      }
      push({ title: 'Animal added', description: 'Animal has been registered.' })
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to add animal'
      push({ title: 'Error', description: msg })
    },
  })
}
