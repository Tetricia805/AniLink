/**
 * Safely extract a display string from API error responses.
 * FastAPI 422 returns detail as array of {type, loc, msg, input, url} - never render objects as React children.
 */
export function getApiErrorMessage(
  error: unknown,
  fallback = 'Request failed'
): string {
  const data = (error as { response?: { data?: { detail?: unknown; message?: string } } })?.response?.data
  const detail = data?.detail
  if (detail != null) {
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      const msgs = detail
        .filter((d): d is { msg?: string } => d != null && typeof d === 'object')
        .map((d) => d.msg ?? 'Validation error')
        .filter(Boolean)
      if (msgs.length > 0) return msgs.join('; ')
    }
    if (typeof detail === 'object' && 'msg' in detail) {
      const msg = (detail as { msg?: unknown }).msg
      if (msg != null) return String(msg)
    }
  }
  if (typeof data?.message === 'string') return data.message
  return fallback
}
