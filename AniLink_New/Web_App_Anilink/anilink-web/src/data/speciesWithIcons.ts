import type { AnimalSpecies } from "@/types/records";

export interface SpeciesOption {
  label: string;
  icon: string;
  category: AnimalSpecies;
}

/** Database of animals with icons for species autocomplete (icon menu). */
export const SPECIES_WITH_ICONS: SpeciesOption[] = [
  // Livestock - Cattle & bovines
  { label: "Dairy Cow", icon: "🐮", category: "Livestock" },
  { label: "Beef Cattle", icon: "🐄", category: "Livestock" },
  { label: "Bull", icon: "🐂", category: "Livestock" },
  { label: "Calf", icon: "🐄", category: "Livestock" },
  { label: "Ox", icon: "🐂", category: "Livestock" },
  // Livestock - Goats & sheep
  { label: "Goat", icon: "🐐", category: "Livestock" },
  { label: "Sheep", icon: "🐑", category: "Livestock" },
  { label: "Ram", icon: "🐏", category: "Livestock" },
  { label: "Lamb", icon: "🐑", category: "Livestock" },
  // Livestock - Pigs
  { label: "Pig", icon: "🐷", category: "Livestock" },
  { label: "Sow", icon: "🐷", category: "Livestock" },
  { label: "Boar", icon: "🐗", category: "Livestock" },
  { label: "Piglet", icon: "🐷", category: "Livestock" },
  // Livestock - Equine
  { label: "Horse", icon: "🐴", category: "Livestock" },
  { label: "Donkey", icon: "🫏", category: "Livestock" },
  { label: "Mule", icon: "🐴", category: "Livestock" },
  { label: "Pony", icon: "🐴", category: "Livestock" },
  // Poultry
  { label: "Chicken", icon: "🐔", category: "Poultry" },
  { label: "Rooster", icon: "🐓", category: "Poultry" },
  { label: "Hen", icon: "🐔", category: "Poultry" },
  { label: "Duck", icon: "🦆", category: "Poultry" },
  { label: "Turkey", icon: "🦃", category: "Poultry" },
  { label: "Goose", icon: "🪿", category: "Poultry" },
  { label: "Guinea Fowl", icon: "🐔", category: "Poultry" },
  { label: "Quail", icon: "🐦", category: "Poultry" },
  { label: "Pigeon", icon: "🐦", category: "Poultry" },
  // Pets - Dogs & cats
  { label: "Dog", icon: "🐕", category: "Pets" },
  { label: "Guard Dog", icon: "🐕‍🦺", category: "Pets" },
  { label: "Puppy", icon: "🐶", category: "Pets" },
  { label: "Cat", icon: "🐈", category: "Pets" },
  { label: "Kitten", icon: "🐱", category: "Pets" },
  // Pets - Small
  { label: "Rabbit", icon: "🐰", category: "Pets" },
  { label: "Hamster", icon: "🐹", category: "Pets" },
  { label: "Guinea Pig", icon: "🐹", category: "Pets" },
  { label: "Ferret", icon: "🐾", category: "Pets" },
  // General / other
  { label: "Bee", icon: "🐝", category: "Livestock" },
  { label: "Fish", icon: "🐟", category: "Pets" },
  { label: "Bird", icon: "🐦", category: "Pets" },
  { label: "Parrot", icon: "🦜", category: "Pets" },
  { label: "Tortoise", icon: "🐢", category: "Pets" },
  { label: "Snake", icon: "🐍", category: "Pets" },
];

/** Filter species by search query (label), case-insensitive. */
export function searchSpecies(query: string): SpeciesOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return SPECIES_WITH_ICONS;
  return SPECIES_WITH_ICONS.filter((s) =>
    s.label.toLowerCase().includes(q),
  );
}
