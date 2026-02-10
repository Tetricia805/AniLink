import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { getRoleHome } from '@/lib/auth'

/**
 * Public routes: /, /login, /register
 * - If NOT authenticated → render outlet (Landing, Login, Register)
 * - If authenticated → redirect to role home (no flash of landing)
 */
export function PublicRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)

  if (isAuthenticated && user?.role) {
    return <Navigate to={getRoleHome(user.role)} replace />
  }

  return <Outlet />
}
