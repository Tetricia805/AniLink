import { create } from "zustand";
import type { TimelineRecord } from "@/types/records";

interface ScanRecordsState {
  items: TimelineRecord[];
  addItem: (record: Omit<TimelineRecord, "id">) => string | number;
}

let nextId = 10_000;

export const useScanRecordsStore = create<ScanRecordsState>((set) => ({
  items: [],
  addItem: (record) => {
    const id = nextId++;
    set((s) => ({
      items: [{ ...record, id }, ...s.items],
    }));
    return id;
  },
}));
