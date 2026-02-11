import { create } from "zustand";
import type { UserDto } from "@/types/auth";
import { useAuthStore } from "@/store/authStore";

export type PreferredAnimal = "Livestock" | "Poultry" | "Pets";

export interface ProfileState {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  farmName?: string;
  preferredAnimals: PreferredAnimal[];
  profilePhotoUrl?: string | null;
  setFromUser: (user: UserDto | null) => void;
  updateProfile: (patch: Partial<Omit<ProfileState, "setFromUser" | "updateProfile">>) => void;
}

export const useProfileStore = create<ProfileState>((set, get) => {
  const user = useAuthStore.getState().user;
  return {
    fullName: user?.name ?? "AniLink user",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    location: "",
    farmName: "",
    preferredAnimals: [],
    profilePhotoUrl: user?.profileImageUrl ?? null,
    setFromUser: (u) =>
      set({
        fullName: u?.name ?? "AniLink user",
        email: u?.email ?? "",
        phone: u?.phone ?? "",
        profilePhotoUrl: u?.profileImageUrl ?? null,
      }),
    updateProfile: (patch) => set({ ...get(), ...patch }),
  };
});

