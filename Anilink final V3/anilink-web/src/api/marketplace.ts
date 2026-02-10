import { api } from './http'
import type { MarketplaceProductDto } from '../types/marketplace'

export async function listMarketplaceProducts() {
  const response = await api.get<MarketplaceProductDto[]>('/marketplace/products')
  return response.data
}

export async function getMarketplaceProduct(id: string) {
  const response = await api.get<MarketplaceProductDto>(`/marketplace/products/${id}`)
  return response.data
}
