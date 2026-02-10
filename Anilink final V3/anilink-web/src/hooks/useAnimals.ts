import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listAnimals, getAnimal, createAnimal } from '@/api/animals'
import type { AnimalCreateDto, AnimalDto } from '@/api/animals'
import { ANIMALS_QUERY_KEY, CASES_QUERY_KEY } from '@/lib/queryClient'
import { getApiErrorMessage } from '@/lib/apiError'
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
    onSuccess: (created: AnimalDto) => {
      // Optimistic: add new animal to cache immediately so it appears in "My Animals"
      // De-dupe: do not insert if id already exists (prevents duplicates after refetch)
      queryClient.setQueryData<AnimalDto[]>(ANIMALS_QUERY_KEY, (prev) => {
        if (!prev) return [created]
        if (prev.some((a) => a.id === created.id)) return prev
        return [created, ...prev]
      })
      queryClient.invalidateQueries({ queryKey: ANIMALS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['animals', created.id] })
      queryClient.invalidateQueries({ queryKey: CASES_QUERY_KEY })
      push({ title: 'Animal added', description: 'Animal has been registered.' })
    },
    onError: (error: unknown) => {
      push({ title: 'Error', description: getApiErrorMessage(error, 'Failed to add animal') })
    },
  })
}
