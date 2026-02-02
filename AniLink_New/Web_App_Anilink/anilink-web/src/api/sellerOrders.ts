/**
 * Seller orders API – orders containing this seller's products.
 * GET /seller/orders, PATCH /seller/orders/:id
 */
import { api } from './http'

export interface SellerOrderItemDto {
  id: string
  productId?: string | null
  productName?: string | null
  unitPrice: number
  quantity: number
  subtotal: number
}

export interface SellerOrderDto {
  id: string
  status: string
  totalAmount: number
  deliveryAddress?: string | null
  createdAt?: string
  updatedAt?: string
  items: SellerOrderItemDto[]
}

export type SellerOrderStatus = 'confirmed' | 'packed' | 'dispatched' | 'delivered'

/** Seller: list orders containing my products. */
export async function listSellerOrders(statusFilter?: string): Promise<SellerOrderDto[]> {
  const params = statusFilter ? { status_filter: statusFilter } : {}
  const response = await api.get<SellerOrderDto[]>('/seller/orders', { params })
  return response.data
}

/** Seller: update order status (confirmed|packed|dispatched|delivered). */
export async function updateSellerOrderStatus(
  orderId: string,
  status: SellerOrderStatus
): Promise<SellerOrderDto> {
  const response = await api.patch<SellerOrderDto>(`/seller/orders/${orderId}`, { status })
  return response.data
}
