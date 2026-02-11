import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Animal } from "@/types/records";

const STORAGE_KEY = "anilink-animals";

interface AnimalsState {
  items: Animal[];
  addAnimal: (animal: Omit<Animal, "id">) => Animal;
  updateAnimal: (id: number, updates: Partial<Animal>) => void;
  setAnimalStatus: (id: number, status: Animal["status"]) => void;
  deleteAnimal: (id: number) => void;
  getById: (id: number) => Animal | undefined;
}

let nextId = 1;

export const useAnimalsStore = create<AnimalsState>()(
  persist(
    (set, get) => ({
      items: [],

      addAnimal: (animal) => {
        const newAnimal: Animal = { ...animal, id: nextId++ };
        set((s) => ({ items: [newAnimal, ...(s.items ?? [])] }));
        return newAnimal;
      },

      updateAnimal: (id, updates) => {
        set((s) => ({
          items: (s.items ?? []).map((a) =>
            a.id === id ? { ...a, ...updates } : a,
          ),
        }));
      },

      setAnimalStatus: (id, status) => {
        set((s) => ({
          items: (s.items ?? []).map((a) =>
            a.id === id ? { ...a, status } : a,
          ),
        }));
      },

      deleteAnimal: (id) => {
        set((s) => ({ items: (s.items ?? []).filter((a) => a.id !== id) }));
      },

      getById: (id) => (get().items ?? []).find((a) => a.id === id),
    }),
    {
      name: STORAGE_KEY,
      merge: (persisted, current) => {
        const p = persisted as { items?: Animal[] } | undefined;
        return {
          ...current,
          items: Array.isArray(p?.items) ? p.items : (current.items ?? []),
        };
      },
    },
  ),
);
