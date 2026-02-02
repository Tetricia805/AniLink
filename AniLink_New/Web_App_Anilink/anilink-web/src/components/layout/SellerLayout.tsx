import { Outlet } from "react-router-dom";
import { SellerNavigation } from "@/components/layout/SellerNavigation";
import { PageTransition } from "@/components/layout/PageTransition";
import { RouteErrorBoundary } from "@/components/layout/RouteErrorBoundary";

/**
 * Layout for SELLER role only. Renders SellerNavigation (seller-only nav)
 * and main content. Used only under ProtectedRoute allowedRoles={['SELLER']}.
 * Sellers never see owner/vet/admin layouts.
 */
export function SellerLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SellerNavigation />
      <main className="pt-16 md:pt-20 pb-16 md:pb-0">
        <PageTransition>
          <RouteErrorBoundary>
            <Outlet />
          </RouteErrorBoundary>
        </PageTransition>
      </main>
    </div>
  );
}
