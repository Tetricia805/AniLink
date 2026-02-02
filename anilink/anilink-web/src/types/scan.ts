export interface ScanAnimal {
  id: string | number;
  name: string;
  type: string;
  age: string;
  image: string;
}

export type SymptomSeverity = "mild" | "moderate" | "severe";
export type SymptomDuration = "<1d" | "1-3d" | "3-7d" | ">1w";

export interface ScanInput {
  animalId: number;
  symptoms: string[];
  severity: SymptomSeverity | "";
  duration: SymptomDuration | "";
  notes: string;
  photoUrls: string[];
}

export interface ScanCondition {
  name: string;
  description: string;
  confidence: number;
  confidenceLabel: "High" | "Medium" | "Low";
}

export interface ScanResult {
  summary: string;
  confidence: "High" | "Medium" | "Low";
  conditions: ScanCondition[];
  recommendedActions: string[];
  urgency: "Low" | "Medium" | "High";
}
