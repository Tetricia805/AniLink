import { api } from './http';
import type { Appointment } from '@/components/appointments/AppointmentCard';
import { BACKEND_TO_OWNER_STATUS } from '@/lib/bookingStatus';

export interface BookingDto {
  id: string;
  vetId: string;
  userId: string;
  visitType: string;
  scheduledAt: string;
  caseId?: string | null;
  notes?: string | null;
  status: string;
  vetName?: string | null;
  clinicName?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBookingDto {
  vetId: string;
  caseId?: string;
  visitType: string;
  scheduledAt: string;
  notes?: string;
}

export async function listBookings(status?: string): Promise<BookingDto[]> {
  const params = status ? { status } : {};
  const response = await api.get<BookingDto[]>('/bookings', { params });
  return response.data;
}

export async function getBooking(id: string): Promise<BookingDto> {
  const response = await api.get<BookingDto>(`/bookings/${id}`);
  return response.data;
}

export async function createBooking(data: CreateBookingDto): Promise<BookingDto> {
  const response = await api.post<BookingDto>('/bookings', data);
  return response.data;
}

export async function updateBookingStatus(id: string, status: string): Promise<BookingDto> {
  const response = await api.put<BookingDto>(`/bookings/${id}/status`, { status });
  return response.data;
}

/** Map backend BookingDto to owner Appointment (for AppointmentsPage). Uses lib/bookingStatus. */
export function bookingDtoToAppointment(dto: BookingDto): Appointment {
  const typeMap: Record<string, Appointment['type']> = {
    CLINIC: 'clinic',
    FARM: 'farm',
  };
  const animalMatch = dto.notes?.match(/Animal:\s*(.+?)(?:\n|$)/);
  const locationMatch = dto.notes?.match(/Location:\s*(.+?)(?:\n|$)/);
  const backendStatus = (dto.status ?? '').toUpperCase();
  return {
    id: dto.id,
    status: BACKEND_TO_OWNER_STATUS[backendStatus] ?? 'pending',
    dateTime: dto.scheduledAt,
    type: typeMap[dto.visitType] ?? 'clinic',
    vetName: dto.vetName ?? 'Vet',
    clinicName: dto.clinicName ?? undefined,
    location: locationMatch?.[1] ?? dto.clinicName ?? '',
    animalName: animalMatch?.[1]?.split(' — ')[0] ?? 'Animal',
    species: animalMatch?.[1]?.split(' — ')[1] ?? '',
    reason: dto.notes?.split('\n')[0] ?? '',
  };
}
