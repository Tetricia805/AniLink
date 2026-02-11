import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TimelineRecord } from "@/types/records";

const STORAGE_KEY = "anilink-timeline-records";

interface TimelineRecordsState {
  items: TimelineRecord[];
  addItem: (record: Omit<TimelineRecord, "id">) => void;
}

let nextId = 1;

export const useTimelineRecordsStore = create<TimelineRecordsState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (record) =>
        set((s) => ({
          items: [
            { ...record, id: nextId++ },
            ...(s.items ?? []),
          ],
        })),
    }),
    {
      name: STORAGE_KEY,
      merge: (persisted, current) => {
        const p = persisted as { items?: TimelineRecord[] } | undefined;
        return {
          ...current,
          items: Array.isArray(p?.items) ? p.items : (current.items ?? []),
        };
      },
    },
  ),
);
