export type AnimalSpecies = "Livestock" | "Poultry" | "Pets";
export type AnimalStatus = "Healthy" | "Sick" | "Under Treatment" | "Recovered" | "Archived";

/** Records animal – id is string (UUID) when from API, number for legacy. */
export interface Animal {
  id: string | number;
  name: string;
  species: AnimalSpecies;
  breed?: string;
  tagId?: string;
  sex?: string;
  ageOrDob?: string;
  status: AnimalStatus;
  notes?: string;
  image?: string; // emoji or url
}

export type TimelineRecordType = "scan" | "vet" | "treatment" | "order" | "note";

/** Timeline record – id/animalId are string (UUID) when from API, number for legacy. */
export interface TimelineRecord {
  id: string | number;
  type: TimelineRecordType;
  title: string;
  description: string;
  date: string;
  details?: string;
  animalId?: string | number;
}
