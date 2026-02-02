import { create } from "zustand";
import type { TimelineRecord } from "@/types/records";

interface ScanRecordsState {
  items: TimelineRecord[];
  addItem: (record: Omit<TimelineRecord, "id">) => void;
}

let nextId = 10_000;

export const useScanRecordsStore = create<ScanRecordsState>((set) => ({
  items: [],
  addItem: (record) =>
    set((s) => ({
      items: [
        { ...record, id: nextId++ },
        ...s.items,
      ],
    })),
}));
