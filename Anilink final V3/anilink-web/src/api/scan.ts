/**
 * API for AI Health Scan - POST /v1/ai-scan/analyze
 * Backend calls model-service for ONNX inference; no browser-side ML.
 */

import { api } from "./http";

export interface ScanRecordDto {
  id: string;
  user_id: string;
  animal_id: string | null;
  created_at: string;
  scan_type: string;
  threshold_used: number;
  cattle_prob: number;
  non_cattle_prob: number;
  passed_gate: boolean;
  gate_rule: string | null;
  fmd_label: string | null;
  fmd_confidence: number | null;
}

export interface ScanAnalyzeNotCattleResponse {
  ok: false;
  reason: "NOT_CATTLE";
  probCattle: number;
  record?: ScanRecordDto;
}

export interface ScanAnalyzeCattleResponse {
  ok: true;
  animalType: "CATTLE";
  probCattle: number;
  diagnosis: {
    condition: "FOOT_AND_MOUTH_DISEASE" | "HEALTHY";
    confidence: number;
    probs: { healthy: number; infected: number };
  };
  record?: ScanRecordDto;
}

export type ScanAnalyzeResponse = ScanAnalyzeNotCattleResponse | ScanAnalyzeCattleResponse;

export async function analyzeScanImage(
  image: File,
  options?: { threshold?: number; animalId?: string }
): Promise<ScanAnalyzeResponse> {
  const formData = new FormData();
  formData.append("image", image);
  formData.append("threshold", String(options?.threshold ?? 0.5));
  if (options?.animalId) formData.append("animal_id", options.animalId);

  const { data } = await api.post<ScanAnalyzeResponse>("/ai-scan/analyze", formData);
  return data;
}

/** Fetch user's scan records from backend (persisted FMD scans). */
export async function fetchScanRecords(limit = 50): Promise<ScanRecordDto[]> {
  const { data } = await api.get<ScanRecordDto[]>("/ai-scan/records", { params: { limit } });
  return data ?? [];
}
