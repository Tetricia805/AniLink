/**
 * Maps backend scan analyze response to ScanResult for unified UI.
 */

import type { ScanResult } from "@/types/scan";
import type { ScanAnalyzeCattleResponse } from "@/api/scan";

/** Map successful cattle+FMD result to ScanResult. */
export function apiResultToScanResult(result: ScanAnalyzeCattleResponse): ScanResult {
  const { diagnosis, probCattle } = result;
  const confPct = Math.round(diagnosis.confidence * 100);
  const confidenceLabel = confPct >= 70 ? "High" : confPct >= 40 ? "Medium" : "Low";
  const isInfected = diagnosis.condition === "FOOT_AND_MOUTH_DISEASE";
  const urgency = isInfected ? ("High" as const) : ("Low" as const);

  return {
    summary:
      diagnosis.condition === "FOOT_AND_MOUTH_DISEASE"
        ? `FMD detection suggests possible infection (${confPct}% confidence). Cattle confidence: ${(probCattle * 100).toFixed(0)}%. Consult a veterinarian immediately for diagnosis and biosecurity measures.`
        : `FMD detection indicates healthy status (${confPct}% confidence). Cattle confidence: ${(probCattle * 100).toFixed(0)}%. Continue routine monitoring.`,
    confidence: confidenceLabel,
    urgency,
    shouldPersist: isInfected,
    conditions: [
      {
        name:
          diagnosis.condition === "FOOT_AND_MOUTH_DISEASE"
            ? "Foot-and-Mouth Disease risk"
            : "Healthy (no FMD signs)",
        description:
          diagnosis.condition === "FOOT_AND_MOUTH_DISEASE"
            ? "AI-detected signs suggestive of FMD. Requires veterinary confirmation. Isolate animal and follow biosecurity protocols."
            : "No signs of Foot-and-Mouth Disease detected in the image. Maintain routine health monitoring.",
        confidence: confPct,
        confidenceLabel,
      },
    ],
    recommendedActions:
      diagnosis.condition === "FOOT_AND_MOUTH_DISEASE"
        ? [
            "Consult a veterinarian immediately for proper diagnosis.",
            "Isolate the animal from the herd to prevent spread.",
            "Follow biosecurity protocols and report to authorities if required.",
          ]
        : [
            "Continue routine health monitoring.",
            "Re-scan if you notice any mouth, hoof, or udder lesions.",
          ],
  };
}
