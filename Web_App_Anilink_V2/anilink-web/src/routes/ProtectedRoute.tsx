import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { getRoleHome } from '@/lib/auth'
import type { UserRole } from '@/types/auth'

interface ProtectedRouteProps {
  /** If set, only these roles can access. Otherwise any authenticated user. */
  allowedRoles?: UserRole[]
}

/**
 * Protected routes: require authentication.
 * - If NOT authenticated → redirect to /login
 * - If allowedRoles set and user.role not in list → redirect to role home
 */
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles != null && allowedRoles.length > 0 && user?.role) {
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to={getRoleHome(user.role)} replace />
    }
  }

  return <Outlet />
}
