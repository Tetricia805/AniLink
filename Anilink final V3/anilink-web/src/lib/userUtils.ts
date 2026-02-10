import type { UserDto } from '@/types/auth'

/**
 * User-facing role label. Internal role key remains unchanged (e.g. "OWNER").
 * owner -> Farmer, vet -> Vet, seller -> Seller, admin -> Admin.
 */
export function getRoleLabel(role: string | undefined): string {
  if (!role) return 'Farmer'
  const r = role.toUpperCase()
  switch (r) {
    case 'OWNER': return 'Farmer'
    case 'VET': return 'Vet'
    case 'SELLER': return 'Seller'
    case 'ADMIN': return 'Admin'
    default: return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
  }
}

/**
 * First name for greeting: "Welcome back, {firstName}".
 * Uses first token of full name (e.g. "Jane" from "Jane Smith"); single word uses that word; else email prefix.
 */
export function getDisplayName(user: UserDto | null | undefined): string {
  if (!user) return 'User'
  const fullName = (user.name ?? '').trim()
  const tokens = fullName.split(/\s+/).filter(Boolean)
  if (tokens.length >= 1) return tokens[0]
  if (user.email) return user.email.split('@')[0] ?? 'User'
  return 'User'
}

/**
 * Avatar initials (2 chars, uppercase): first letter of first name + first letter of second name,
 * or two letters from single name, or first letter of email prefix.
 */
export function getInitials(user: UserDto | null | undefined): string {
  if (!user) return 'U'
  return getInitialsFromFullName((user.name ?? '').trim(), user.email)
}

/**
 * Compute initials from full name string (and optional email fallback).
 * First 2 words → 2 letters; single word → first 2 letters; else fallback.
 */
export function getInitialsFromFullName(fullName: string, email?: string | null): string {
  const trimmed = (fullName ?? '').trim()
  const tokens = trimmed.split(/\s+/).filter(Boolean)
  if (tokens.length >= 2) {
    const a = tokens[0][0] ?? ''
    const b = tokens[1][0] ?? ''
    return (a + b).toUpperCase()
  }
  if (tokens.length === 1) {
    const s = tokens[0]
    const a = s[0] ?? ''
    const b = s[1] ?? s[0] ?? ''
    return (a + b).toUpperCase()
  }
  if (email) {
    const prefix = email.split('@')[0] ?? ''
    return (prefix[0] ?? 'U').toUpperCase()
  }
  return 'U'
}
