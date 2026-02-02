import { create } from "zustand";
import type { Appointment } from "@/components/appointments/AppointmentCard";

interface AppointmentsState {
  items: Appointment[];
  addItem: (a: Appointment) => void;
  updateDateTime: (id: string, dateTime: string) => void;
  setStatus: (id: string, status: Appointment["status"]) => void;
}

export const useAppointmentsStore = create<AppointmentsState>((set) => ({
  items: [],
  addItem: (a) => set((s) => ({ items: [a, ...s.items] })),
  updateDateTime: (id, dateTime) =>
    set((s) => ({
      items: s.items.map((x) =>
        x.id === id ? { ...x, dateTime } : x,
      ),
    })),
  setStatus: (id, status) =>
    set((s) => ({
      items: s.items.map((x) => (x.id === id ? { ...x, status } : x)),
    })),
}));
