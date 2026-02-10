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
  if (!dto || typeof dto !== 'object') {
    throw new Error('Invalid animal data from API')
  }
  const id = dto.id ?? ''
  const name = dto.name ?? 'Unknown'
  const type = dto.type ?? ''
  return {
    id,
    name,
    species: typeToSpecies(type),
    breed: dto.breed ?? undefined,
    tagId: dto.tagNumber ?? undefined,
    sex: dto.gender ?? undefined,
    ageOrDob: dto.dateOfBirth != null ? String(dto.dateOfBirth) : undefined,
    status: 'Healthy',
    notes: undefined,
    image: dto.imageUrl ?? undefined,
  }
}
