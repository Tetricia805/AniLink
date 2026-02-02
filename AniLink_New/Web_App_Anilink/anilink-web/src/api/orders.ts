import { api } from './http'

export interface OrderItemDto {
  productId: string
  productTitle: string
  price: number
  quantity: number
  productImageUrl?: string | null
}

export interface OrderDto {
  id: string
  items: OrderItemDto[]
  totalAmount: number
  deliveryType: string
  deliveryAddress?: string | null
  deliveryDistrict?: string | null
  status: string
  sellerId?: string | null
  sellerName?: string | null
  /** Optional: backend may add seller contact for Contact Seller feature */
  sellerPhone?: string | null
  sellerEmail?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface OrderItemCreate {
  productId: string
  quantity: number
  price: number
}

export interface OrderCreateDto {
  items: OrderItemCreate[]
  deliveryType: string
  deliveryAddress?: string
  deliveryDistrict?: string
}

/** Owner: list my orders (buyer). */
export async function listOrders(status?: string): Promise<OrderDto[]> {
  const params = status ? { status } : {}
  const response = await api.get<OrderDto[]>('/orders', { params })
  return response.data
}

/** Owner: get order by ID. */
export async function getOrder(id: string): Promise<OrderDto> {
  const response = await api.get<OrderDto>(`/orders/${id}`)
  return response.data
}

/** Owner: create order (checkout). */
export async function createOrder(data: OrderCreateDto): Promise<OrderDto> {
  const response = await api.post<OrderDto>('/orders', data)
  return response.data
}

/** Owner: cancel order. */
export async function cancelOrder(id: string): Promise<OrderDto> {
  const response = await api.put<OrderDto>(`/orders/${id}/cancel`)
  return response.data
}
