import { useAuthStore } from "@/store/authStore";
import { AppShell } from "./AppShell";
import { SellerLayout } from "./SellerLayout";

/**
 * Wraps /notifications in the correct private layout for the current role:
 * AppShell for owner/vet/admin, SellerLayout for seller.
 * Each layout renders its own Outlet (the NotificationsPage route).
 */
export function NotificationsLayout() {
  const role = useAuthStore((s) => s.user?.role);

  if (role === "SELLER") {
    return <SellerLayout />;
  }

  return <AppShell />;
}
