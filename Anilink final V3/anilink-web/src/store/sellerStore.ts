import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SellerProduct, SellerOrder, SellerOrderStatus, SellerProfileData } from "@/types/seller";

interface SellerState {
  products: SellerProduct[];
  orders: SellerOrder[];
  profile: SellerProfileData;
  addProduct: (p: Omit<SellerProduct, "id">) => SellerProduct;
  updateProduct: (id: string, patch: Partial<SellerProduct>) => void;
  setProductActive: (id: string, active: boolean) => void;
  setProductStock: (id: string, stock: number) => void;
  deleteProduct: (id: string) => void;
  setOrderStatus: (orderId: string, status: SellerOrderStatus) => void;
  updateProfile: (patch: Partial<SellerProfileData>) => void;
}

const defaultProfile: SellerProfileData = {
  storeName: "",
  logo: "",
  contactEmail: "",
  contactPhone: "",
  location: "",
};

export const useSellerStore = create<SellerState>()(
  persist(
    (set, _get) => ({
      products: [],
      orders: [],
      profile: defaultProfile,

      addProduct: (p) => {
        const id = `sp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const product: SellerProduct = { ...p, id };
        set((s) => ({ products: [product, ...s.products] }));
        return product;
      },

      updateProduct: (id, patch) => {
        set((s) => ({
          products: s.products.map((q) => (q.id === id ? { ...q, ...patch } : q)),
        }));
      },

      setProductActive: (id, active) => {
        set((s) => ({
          products: s.products.map((q) => (q.id === id ? { ...q, active } : q)),
        }));
      },

      setProductStock: (id, stock) => {
        set((s) => ({
          products: s.products.map((q) => (q.id === id ? { ...q, stock } : q)),
        }));
      },

      deleteProduct: (id) => {
        set((s) => ({ products: s.products.filter((q) => q.id !== id) }));
      },

      setOrderStatus: (orderId, status) => {
        set((s) => ({
          orders: s.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
        }));
      },

      updateProfile: (patch) => {
        set((s) => ({ profile: { ...s.profile, ...patch } }));
      },
    }),
    {
      name: "anilink-seller",
      partialize: (s) => ({ products: s.products, orders: s.orders, profile: s.profile }),
    },
  ),
);

/** Selector: count of active products with low stock (stock in 1..threshold-1). */
export function getSellerLowStockCount(products: SellerProduct[], threshold = 5): number {
  return products.filter((p) => p.active && p.stock > 0 && p.stock < threshold).length;
}
