import { create } from "zustand";

export interface BookingPrefill {
  vetId?: number | string;
  vetName?: string;
  clinicName?: string;
  animalId?: number | string;
}

type OnSuccessCallback = (() => void) | null;

interface BookingState {
  open: boolean;
  prefill: BookingPrefill;
  onSuccessCallback: OnSuccessCallback | null;
  setOpen: (open: boolean) => void;
  setPrefill: (prefill: BookingPrefill) => void;
  setOnSuccessCallback: (cb: OnSuccessCallback | null) => void;
  openWithPrefill: (prefill: BookingPrefill) => void;
  clearPrefill: () => void;
}

const defaultPrefill: BookingPrefill = {};

export const useBookingStore = create<BookingState>((set) => ({
  open: false,
  prefill: defaultPrefill,
  onSuccessCallback: null,
  setOpen: (open) => set({ open }),
  setPrefill: (prefill) => set({ prefill }),
  setOnSuccessCallback: (onSuccessCallback) => set({ onSuccessCallback }),
  openWithPrefill: (prefill) => set({ open: true, prefill }),
  clearPrefill: () => set({ prefill: defaultPrefill }),
}));
