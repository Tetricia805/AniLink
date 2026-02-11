import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  /** Optional link for "View" action */
  href?: string;
}

const STORAGE_KEY = "anilink-notifications";

interface NotificationState {
  items: AppNotification[];
  add: (notification: Omit<AppNotification, "id" | "createdAt" | "isRead">) => void;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
  clear: () => void;
  unreadCount: () => number;
  getItems: () => AppNotification[];
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      items: [] as AppNotification[],

      add: (notification) => {
        const item: AppNotification = {
          ...notification,
          id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ items: [item, ...(state.items ?? [])].slice(0, 100) }));
      },

      markAsRead: (id) => {
        set((state) => ({
          items: (state.items ?? []).map((n) =>
            n.id === id ? { ...n, isRead: true } : n,
          ),
        }));
      },

      markAllRead: () => {
        set((state) => ({
          items: (state.items ?? []).map((n) => ({ ...n, isRead: true })),
        }));
      },

      clear: () => set({ items: [] }),

      unreadCount: () => (get().items ?? []).filter((n) => !n.isRead).length,

      getItems: () => get().items ?? [],
    }),
    {
      name: STORAGE_KEY,
      merge: (persistedState, currentState) => {
        const p = persistedState as Partial<NotificationState> | undefined;
        return {
          ...currentState,
          ...p,
          items: Array.isArray(p?.items) ? p.items : (currentState.items ?? []),
        };
      },
    },
  ),
);
