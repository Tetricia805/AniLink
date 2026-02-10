/**
 * Animals API – GET/POST /animals, GET /animals/:id
 */
import { api } from './http'

export interface AnimalDto {
  id: string
  name: string
  type: string
  breed?: string | null
  dateOfBirth?: string | null
  gender?: string | null
  color?: string | null
  tagNumber?: string | null
  imageUrl?: string | null
  vaccinationRecords?: string[]
  treatmentRecords?: string[]
  caseIds?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface AnimalCreateDto {
  name: string
  type: string
  breed?: string
  dateOfBirth?: string
  gender?: string
  color?: string
  tagNumber?: string
  imageUrl?: string
  notes?: string
}

export async function listAnimals(): Promise<AnimalDto[]> {
  const response = await api.get<AnimalDto[]>('/animals')
  return response.data
}

export async function getAnimal(id: string): Promise<AnimalDto> {
  const response = await api.get<AnimalDto>(`/animals/${id}`)
  return response.data
}

export async function createAnimal(data: AnimalCreateDto): Promise<AnimalDto> {
  const response = await api.post<AnimalDto>('/animals', data)
  return response.data
}
