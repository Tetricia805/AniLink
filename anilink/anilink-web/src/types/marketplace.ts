export interface MarketplaceProductDto {
  id: string
  title: string
  category: string
  price: number
  description: string
  imageUrls: string[]
  sellerId: string
  sellerName: string
  sellerLocation: string | null
  sellerDistance: number | null
  stock: number | null
  isVerified: boolean
  rating: number | null
  reviewCount: number | null
  createdAt: string
}

/** UI shape for marketplace listing/cards. id is string (UUID) for API compatibility. */
export interface MarketplaceProduct {
  id: string
  name: string
  description: string
  price: string
  category: string
  inStock: boolean
  vetApproved: boolean
  recommended: boolean
  image?: string
}

/** Map API DTO to UI product so the same design renders with real data. */
export function mapMarketplaceDtoToProduct(
  dto: MarketplaceProductDto,
  options?: { recommended?: boolean }
): MarketplaceProduct {
  const stock = dto.stock ?? 0
  return {
    id: dto.id,
    name: dto.title,
    description: dto.description ?? "",
    price: dto.price.toLocaleString(),
    category: dto.category,
    inStock: stock > 0,
    vetApproved: dto.isVerified,
    recommended: options?.recommended ?? false,
    image: dto.imageUrls?.[0],
  }
}
