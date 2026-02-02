import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listBookings, getBooking, createBooking, updateBookingStatus } from '@/api/bookings';
import type { CreateBookingDto } from '@/api/bookings';
import { useToast } from '@/components/ui/use-toast';
import { NOTIFICATIONS_QUERY_KEY } from '@/lib/queryClient';

/** Single query key for all bookings (role-based list from GET /bookings). Filter client-side by tab. */
export const BOOKINGS_QUERY_KEY = ['bookings'] as const;

/**
 * List bookings for current user (owner or vet). Same endpoint GET /bookings; backend returns role-specific list.
 * No status filter in API – fetch all, filter by tab on client using lib/bookingStatus.
 */
export function useBookings() {
  return useQuery({
    queryKey: BOOKINGS_QUERY_KEY,
    queryFn: async () => {
      const list = await listBookings();
      if (import.meta.env.DEV && Array.isArray(list)) {
        const statusCounts = (list as { status?: string }[]).reduce<Record<string, number>>((acc, b) => {
          const s = b.status ?? 'unknown';
          acc[s] = (acc[s] ?? 0) + 1;
          return acc;
        }, {});
        console.debug('[useBookings] count:', list.length, 'by status:', statusCounts);
      }
      return list;
    },
    staleTime: 5_000,
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
  });
}

export function useBooking(id: string | undefined | null, enabled = true) {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: () => getBooking(id!),
    enabled: enabled && !!id,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  const { push } = useToast();

  return useMutation({
    mutationFn: (data: CreateBookingDto) => createBooking(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKINGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      if (import.meta.env.DEV) {
        console.debug('[useCreateBooking] invalidated: bookings, notifications');
      }
      push({ title: 'Success', description: 'Booking created successfully' });
    },
    onError: (error: any) => {
      push({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to create booking',
      });
    },
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  const { push } = useToast();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateBookingStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: BOOKINGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['bookings', variables.id] });
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      if (import.meta.env.DEV) {
        console.debug('[useUpdateBookingStatus] invalidated: bookings, bookings/' + variables.id + ', notifications');
      }
      const statusLabel = variables.status.toLowerCase();
      push({ title: 'Success', description: `Booking ${statusLabel} successfully` });
    },
    onError: (error: any) => {
      push({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to update booking status',
      });
    },
  });
}
