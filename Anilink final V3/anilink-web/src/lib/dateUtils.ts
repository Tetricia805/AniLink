/**
 * Parse "Age or DOB" input for API. Backend expects DATE ONLY (YYYY-MM-DD), not datetime.
 * Returns YYYY-MM-DD string or undefined if input is not a valid date.
 */
export function parseDateOfBirthForApi(input: string | undefined): string | undefined {
  const s = input?.trim()
  if (!s) return undefined
  // Match YYYY-MM-DD (with optional time part) - extract date only
  const dateOnlyMatch = s.match(/^(\d{4}-\d{2}-\d{2})/)
  if (dateOnlyMatch) return dateOnlyMatch[1]
  // Try parsing as Date - if valid, return YYYY-MM-DD
  const d = new Date(s)
  if (!Number.isNaN(d.getTime())) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }
  return undefined
}
