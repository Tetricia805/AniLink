/**
 * Map between API AnimalDto and Records Animal shape.
 */
import type { AnimalDto } from '@/api/animals'
import type { Animal, AnimalSpecies } from '@/types/records'

function typeToSpecies(type: string): AnimalSpecies {
  const t = type?.toLowerCase() ?? ''
  if (t.includes('chicken') || t.includes('duck') || t.includes('turkey') || t.includes('poultry')) return 'Poultry'
  if (t.includes('dog') || t.includes('cat') || t.includes('pet')) return 'Pets'
  return 'Livestock'
}

/** Map API AnimalDto to Records Animal. */
export function animalDtoToRecordsAnimal(dto: AnimalDto): Animal {
  return {
    id: dto.id,
    name: dto.name,
    species: typeToSpecies(dto.type),
    breed: dto.breed ?? undefined,
    tagId: dto.tagNumber ?? undefined,
    sex: dto.gender ?? undefined,
    ageOrDob: dto.dateOfBirth ?? undefined,
    status: 'Healthy',
    notes: undefined,
    image: dto.imageUrl ?? undefined,
  }
}
