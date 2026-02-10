import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiErrorMessage } from '@/lib/apiError'
import {
  listSellerProducts,
  createSellerProduct,
  updateSellerProduct,
} from '@/api/sellerProducts'
import type { SellerProductDto, SellerProductCreate, SellerProductUpdate } from '@/api/sellerProducts'
import { SELLER_PRODUCTS_QUERY_KEY } from '@/lib/queryClient'
import { useToast } from '@/components/ui/use-toast'

/** Map API DTO to UI shape (active, vetApproved, image). */
function toUiProduct(dto: SellerProductDto): SellerProductDto & { active: boolean; vetApproved: boolean; image?: string } {
  return {
    ...dto,
    active: dto.is_active ?? true,
    vetApproved: dto.is_verified ?? false,
    image: Array.isArray(dto.imageUrls) && dto.imageUrls.length > 0 ? dto.imageUrls[0] : undefined,
  }
}

export function useSellerProducts() {
  return useQuery({
    queryKey: SELLER_PRODUCTS_QUERY_KEY,
    queryFn: async () => {
      const list = await listSellerProducts()
      if (import.meta.env.DEV && Array.isArray(list)) {
        console.debug('[useSellerProducts] count:', list.length)
      }
      return list.map(toUiProduct)
    },
    staleTime: 5_000,
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
  })
}

export function useCreateSellerProduct() {
  const queryClient = useQueryClient()
  const { push } = useToast()

  return useMutation({
    mutationFn: (data: SellerProductCreate) => createSellerProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SELLER_PRODUCTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['marketplace-products'] })
      if (import.meta.env.DEV) {
        console.debug('[useCreateSellerProduct] invalidated: seller-products, marketplace-products')
      }
      push({ title: 'Product added', description: 'Product is now listed.' })
    },
    onError: (error: unknown) => {
      const msg = getApiErrorMessage(error, 'Failed to add product')
      push({ title: 'Error', description: msg })
    },
  })
}

export function useUpdateSellerProduct() {
  const queryClient = useQueryClient()
  const { push } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SellerProductUpdate }) =>
      updateSellerProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SELLER_PRODUCTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['marketplace-products'] })
      if (import.meta.env.DEV) {
        console.debug('[useUpdateSellerProduct] invalidated: seller-products, marketplace-products')
      }
      push({ title: 'Product updated' })
    },
    onError: (error: unknown) => {
      const msg = getApiErrorMessage(error, 'Failed to update')
      push({ title: 'Error', description: msg })
    },
  })
}
