/**
 * API for saving AI scan results to backend.
 * POST /v1/scan/records
 */

import { api } from "./http";

export interface ScanRecordPayload {
  animal_id?: string | null;
  type: "FMD_SCAN";
  cattle_prob: number;
  non_cattle_prob: number;
  fmd_label: "Healthy" | "Infected" | null;
  fmd_confidence: number | null;
  threshold_used: number;
  raw_probs: { cattle: number; non_cattle: number; healthy?: number; infected?: number };
  image_ref?: string | null;
}

export async function saveScanToBackend(payload: ScanRecordPayload): Promise<{ id?: string; status: number }> {
  const res = await api.post("/scan/records", payload);
  return { id: res.data?.id, status: res.status };
}
