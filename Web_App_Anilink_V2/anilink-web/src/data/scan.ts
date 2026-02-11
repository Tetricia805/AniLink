import type { ScanAnimal, ScanResult } from "@/types/scan";
import type { Animal } from "@/types/records";

/** No mock data: scan page uses animals from useAnimalsStore via mapAnimalsToScanAnimals. */
export const SCAN_ANIMALS: ScanAnimal[] = [];

/** Map records Animal[] to ScanAnimal[] for the scan wizard. */
export function mapAnimalsToScanAnimals(animals: Animal[]): ScanAnimal[] {
  return animals.map((a) => ({
    id: a.id,
    name: a.name,
    type: a.breed ?? a.species,
    age: a.ageOrDob ?? "—",
    image: a.image ?? "🐾",
  }));
}

export function getScanAnimalById(
  animals: ScanAnimal[],
  id: number | string,
): ScanAnimal | undefined {
  const s = String(id);
  return animals.find((a) => String(a.id) === s);
}

export const COMMON_SYMPTOMS = [
  "Lethargy",
  "Loss of appetite",
  "Limping",
  "Coughing",
  "Diarrhea",
  "Vomiting",
  "Skin rash",
  "Discharge",
  "Fever",
  "Swelling",
] as const;

export const SEVERITY_OPTIONS: { value: "" | "mild" | "moderate" | "severe"; label: string }[] = [
  { value: "", label: "Select severity" },
  { value: "mild", label: "Mild" },
  { value: "moderate", label: "Moderate" },
  { value: "severe", label: "Severe" },
];

export const DURATION_OPTIONS: { value: "" | "<1d" | "1-3d" | "3-7d" | ">1w"; label: string }[] = [
  { value: "", label: "Select duration" },
  { value: "<1d", label: "Less than 1 day" },
  { value: "1-3d", label: "1–3 days" },
  { value: "3-7d", label: "3–7 days" },
  { value: ">1w", label: "More than 1 week" },
];

/** Mock AI result for demo. TODO: Replace with API. */
export function mockScanResult(
  _input: { symptoms: string[]; notes: string; photoCount: number },
): ScanResult {
  return {
    summary:
      "Based on the symptoms and images provided, the assessment suggests possible skin involvement and mild systemic signs. A veterinary examination is recommended to confirm.",
    confidence: "High",
    urgency: "Medium",
    conditions: [
      {
        name: "Skin infection (Dermatitis)",
        description:
          "Bacterial or fungal infection of the skin causing inflammation, redness, and possible discharge.",
        confidence: 85,
        confidenceLabel: "High",
      },
      {
        name: "Allergic reaction",
        description:
          "Possible allergic reaction to food, environment, or insects.",
        confidence: 45,
        confidenceLabel: "Medium",
      },
    ],
    recommendedActions: [
      "Consult a veterinarian for proper diagnosis and treatment plan.",
      "Keep the animal clean and dry; avoid irritants.",
      "Monitor for worsening or new symptoms.",
    ],
  };
}
