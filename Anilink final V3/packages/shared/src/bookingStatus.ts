/**
 * Single source of truth: backend booking status <-> frontend tab/label.
 * Shared by web and mobile.
 */

export const BACKEND_STATUS = {
  REQUESTED: 'REQUESTED',
  CONFIRMED: 'CONFIRMED',
  DECLINED: 'DECLINED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type BackendBookingStatus = (typeof BACKEND_STATUS)[keyof typeof BACKEND_STATUS];
export type FrontendAppointmentStatus = 'pending' | 'upcoming' | 'completed' | 'cancelled' | 'rejected';
export type OwnerTabKey = 'pending' | 'upcoming' | 'past' | 'cancelled';
export type VetTabKey = 'all' | 'requested' | 'confirmed' | 'completed';

export const BACKEND_TO_OWNER_STATUS: Record<string, FrontendAppointmentStatus> = {
  [BACKEND_STATUS.REQUESTED]: 'pending',
  [BACKEND_STATUS.CONFIRMED]: 'upcoming',
  [BACKEND_STATUS.IN_PROGRESS]: 'upcoming',
  [BACKEND_STATUS.COMPLETED]: 'completed',
  [BACKEND_STATUS.DECLINED]: 'rejected',
  [BACKEND_STATUS.CANCELLED]: 'cancelled',
};

export function backendStatusToOwnerTab(backend: string): OwnerTabKey {
  const s = backend.toUpperCase();
  if (s === BACKEND_STATUS.REQUESTED) return 'pending';
  if (s === BACKEND_STATUS.CONFIRMED || s === BACKEND_STATUS.IN_PROGRESS) return 'upcoming';
  if (s === BACKEND_STATUS.COMPLETED) return 'past';
  if (s === BACKEND_STATUS.DECLINED || s === BACKEND_STATUS.CANCELLED) return 'cancelled';
  return 'pending';
}

export function isBackendPending(backend: string): boolean {
  return backend.toUpperCase() === BACKEND_STATUS.REQUESTED;
}

export function isBackendUpcoming(backend: string): boolean {
  const s = backend.toUpperCase();
  return s === BACKEND_STATUS.CONFIRMED || s === BACKEND_STATUS.IN_PROGRESS;
}
