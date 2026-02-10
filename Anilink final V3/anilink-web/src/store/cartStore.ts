import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, CartProduct } from "@/types/cart";

const STORAGE_KEY = "anilink-cart";

interface CartState {
  items: CartItem[];
  cartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;
  addItem: (product: CartProduct, quantity?: number) => void;
  removeItem: (productId: string | number) => void;
  updateQuantity: (productId: string | number, delta: number) => void;
  setQuantity: (productId: string | number, quantity: number) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
  getItems: () => CartItem[];
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      cartDrawerOpen: false,
      setCartDrawerOpen: (open) => set({ cartDrawerOpen: open }),

      addItem: (product, qty = 1) => {
        set((state) => {
          const items = state.items ?? [];
          const existing = items.find((i) => i.productId === product.id);
          const next = existing
            ? items.map((i) =>
                i.productId === product.id
                  ? { ...i, quantity: i.quantity + qty }
                  : i,
              )
            : [
                ...items,
                {
                  productId: product.id,
                  name: product.name,
                  price: product.price,
                  priceDisplay: product.priceDisplay,
                  quantity: qty,
                  image: product.image,
                },
              ];
          return { items: next };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: (state.items ?? []).filter((i) => i.productId !== productId),
        }));
      },

      updateQuantity: (productId, delta) => {
        set((state) => {
          const next = (state.items ?? [])
            .map((i) =>
              i.productId === productId
                ? { ...i, quantity: Math.max(0, i.quantity + delta) }
                : i,
            )
            .filter((i) => i.quantity > 0);
          return { items: next };
        });
      },

      setQuantity: (productId, quantity) => {
        const qty = Math.max(0, quantity);
        if (qty === 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: (state.items ?? []).map((i) =>
            i.productId === productId ? { ...i, quantity: qty } : i,
          ),
        }));
      },

      clear: () => set({ items: [] }),

      count: () => (get().items ?? []).reduce((acc, i) => acc + i.quantity, 0),

      subtotal: () =>
        (get().items ?? []).reduce((acc, i) => acc + i.price * i.quantity, 0),

      getItems: () => get().items ?? [],
    }),
    { name: STORAGE_KEY, partialize: (s) => ({ items: s.items }) },
  ),
);
