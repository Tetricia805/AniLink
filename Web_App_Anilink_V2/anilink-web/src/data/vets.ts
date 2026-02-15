import type { Vet } from "@/types/vets";

/** No mock data. Populate from API or use VETS.push() for seed data. Same Vet shape renders in VetCard (clinic, vet/doctor, rating, reviews, distance, specialties, hours, phone, availability, Book/View Details). */
export const VETS: Vet[] = [];

export function getVetById(id: number | string): Vet | undefined {
  const n = Number(id);
  return VETS.find((v) => v.id === n);
}

export function vetIdToBookingVetId(id: number): string {
  return `v${id}`;
}
