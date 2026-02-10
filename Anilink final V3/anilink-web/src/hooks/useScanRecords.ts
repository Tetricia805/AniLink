import { useQuery } from '@tanstack/react-query'
import { fetchScanRecords } from '@/api/scan'
import { SCAN_RECORDS_QUERY_KEY } from '@/lib/queryClient'
import type { TimelineRecord } from '@/types/records'
import type { ScanRecordDto } from '@/api/scan'

export function scanRecordToTimeline(r: ScanRecordDto): TimelineRecord {
  const desc =
    r.fmd_label && r.fmd_confidence != null
      ? `FMD: ${r.fmd_label} (${(r.fmd_confidence * 100).toFixed(0)}%)`
      : `NOT_CATTLE (cattle_prob: ${(r.cattle_prob * 100).toFixed(1)}%)`
  return {
    id: r.id,
    type: 'scan',
    title: 'AI Health Scan',
    description: desc,
    date: r.created_at,
    details: r.gate_rule ?? undefined,
    animalId: r.animal_id ?? undefined,
  }
}

/** Raw scan records (ScanRecordDto) for Records page Scans section. */
export function useScanRecordsRaw(limit = 50) {
  return useQuery({
    queryKey: [...SCAN_RECORDS_QUERY_KEY, 'raw', limit],
    queryFn: () => fetchScanRecords(limit),
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  })
}

export function useScanRecords(limit = 50) {
  return useQuery({
    queryKey: [...SCAN_RECORDS_QUERY_KEY, limit],
    queryFn: () => fetchScanRecords(limit),
    staleTime: 10_000,
    refetchOnWindowFocus: true,
    select: (data) => data.map(scanRecordToTimeline),
  })
}

