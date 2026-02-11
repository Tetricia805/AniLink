export interface CartProduct {
  id: string | number;  // string (UUID) when from API; number for legacy
  name: string;
  price: number;  // UGX, numeric for calculations
  priceDisplay: string;
  image?: string;
}

export interface CartItem {
  productId: string | number;
  name: string;
  price: number;
  priceDisplay: string;
  quantity: number;
  image?: string;
}
