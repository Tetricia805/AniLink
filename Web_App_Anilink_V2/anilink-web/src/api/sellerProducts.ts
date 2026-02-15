/**
 * Seller products API – GET/POST/PATCH /seller/products
 */
import { api } from './http'

export interface SellerProductDto {
  id: string
  title: string
  description?: string | null
  category: string
  price: number
  imageUrls?: string[]
  stock: number
  is_active?: boolean
  is_verified?: boolean
  recommended?: boolean
  createdAt?: string
}

export interface SellerProductCreate {
  title: string
  description?: string
  category: string
  price: number
  imageUrls?: string[]
  stock?: number
}

export interface SellerProductUpdate {
  title?: string
  description?: string
  category?: string
  price?: number
  imageUrls?: string[]
  stock?: number
}

/** Seller: list my products. */
export async function listSellerProducts(): Promise<SellerProductDto[]> {
  const response = await api.get<SellerProductDto[]>('/seller/products')
  return response.data
}

/** Seller: get product by ID. */
export async function getSellerProduct(id: string): Promise<SellerProductDto> {
  const response = await api.get<SellerProductDto>(`/seller/products/${id}`)
  return response.data
}

/** Seller: create product. */
export async function createSellerProduct(data: SellerProductCreate): Promise<SellerProductDto> {
  const response = await api.post<SellerProductDto>('/seller/products', data)
  return response.data
}

/** Seller: update product. */
export async function updateSellerProduct(id: string, data: SellerProductUpdate): Promise<SellerProductDto> {
  const response = await api.patch<SellerProductDto>(`/seller/products/${id}`, data)
  return response.data
}
