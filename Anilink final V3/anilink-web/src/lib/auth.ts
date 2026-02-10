import type { UserRole } from '@/types/auth'

/**
 * Role-based home path. Used for:
 * - Redirect after login/register
 * - Redirect when authenticated user hits public routes
 * - Redirect when user hits a route for another role
 */
export function getRoleHome(role: UserRole): string {
  switch (role) {
    case 'OWNER':
      return '/home'
    case 'VET':
      return '/vet/home'
    case 'ADMIN':
      return '/admin/dashboard'
    case 'SELLER':
      return '/seller/dashboard'
    default:
      return '/home'
  }
}

export const ROLES = {
  OWNER: 'OWNER',
  VET: 'VET',
  ADMIN: 'ADMIN',
  SELLER: 'SELLER',
} as const
