import type { UserRole } from './types';

export function getRoleHome(role: UserRole): string {
  switch (role) {
    case 'OWNER':
      return 'OwnerHome';
    case 'VET':
      return 'VetHome';
    case 'ADMIN':
      return 'AdminDashboard';
    case 'SELLER':
      return 'SellerDashboard';
    default:
      return 'OwnerHome';
  }
}

export const ROLES = {
  OWNER: 'OWNER',
  VET: 'VET',
  ADMIN: 'ADMIN',
  SELLER: 'SELLER',
} as const;
