/** Seller's own product listing (manage products page). */
export interface SellerProduct {
  id: string;
  title: string;
  category: string;
  price: number; // UGX
  stock: number;
  active: boolean;
  vetApproved: boolean;
  image?: string;
  description?: string;
}

/** Order status for seller order management. */
export type SellerOrderStatus = "confirmed" | "packed" | "dispatched" | "delivered";

export interface SellerOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number; // UGX per unit
  image?: string;
}

/** Order that includes seller's products (seller orders page). */
export interface SellerOrder {
  id: string;
  items: SellerOrderItem[];
  total: number; // UGX
  status: SellerOrderStatus;
  createdAt: string; // ISO
  deliveryInfo?: string;
  buyerName?: string;
}

export interface SellerProfileData {
  storeName: string;
  logo?: string;
  contactEmail: string;
  contactPhone: string;
  location: string;
}
