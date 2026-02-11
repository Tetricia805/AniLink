import { ProtectedRoute } from "./ProtectedRoute";

/**
 * Route guard for SELLER role only.
 * - Unauthenticated → redirect to /login
 * - Authenticated but not SELLER → redirect to that role's home
 * - SELLER → ProtectedRoute renders <Outlet /> (seller routes only)
 */
export function SellerRouteGuard() {
  return <ProtectedRoute allowedRoles={["SELLER"]} />;
}
