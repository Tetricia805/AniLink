/**
 * Cases API – GET/POST /cases, GET /cases/:id, POST /cases/:id/close
 */
import { api } from './http'

export interface CaseAiAssessmentDto {
  status: string
  confidence?: number
  severity?: string | null
  completedAt?: string
}

export interface CaseDto {
  id: string
  animalType: string
  imageUrls: string[]
  symptoms: string[]
  notes?: string | null
  location?: string | null
  district?: string | null
  status: string
  aiAssessment?: CaseAiAssessmentDto | null
  animalId?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface CaseCreateForm {
  animal_type: string
  symptoms: string
  notes?: string
  location?: string
  district?: string
  animal_id?: string
  images?: File[]
}

export async function listCases(params?: {
  animal_id?: string
  status?: string
  scope?: 'owner' | 'vet'
}): Promise<CaseDto[]> {
  const queryParams: Record<string, string> = {}
  if (params?.animal_id) queryParams.animal_id = params.animal_id
  if (params?.status) queryParams.status = params.status
  if (params?.scope) queryParams.scope = params.scope

  const response = await api.get<CaseDto[]>('/cases', { params: Object.keys(queryParams).length ? queryParams : undefined })
  return response.data
}

export async function getCase(id: string): Promise<CaseDto> {
  const response = await api.get<CaseDto>(`/cases/${id}`)
  return response.data
}

export async function createCase(form: CaseCreateForm): Promise<CaseDto> {
  const formData = new FormData()
  formData.append('animal_type', form.animal_type)
  formData.append('symptoms', form.symptoms)
  if (form.notes) formData.append('notes', form.notes)
  if (form.location) formData.append('location', form.location)
  if (form.district) formData.append('district', form.district)
  if (form.animal_id) formData.append('animal_id', form.animal_id)
  if (form.images?.length) {
    form.images.forEach((f) => formData.append('images', f))
  }
  const response = await api.post<CaseDto>('/cases', formData)
  return response.data
}

export async function closeCase(id: string): Promise<CaseDto> {
  const response = await api.post<CaseDto>(`/cases/${id}/close`)
  return response.data
}
