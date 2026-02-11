import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { getRoleHome } from '@/lib/auth'

/**
 * Catch-all: unauthenticated → /login; authenticated → role home
 */
export function CatchAllRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)

  if (isAuthenticated && user?.role) {
    return <Navigate to={getRoleHome(user.role)} replace />
  }
  return <Navigate to="/login" replace />
}
