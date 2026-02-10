import { Outlet } from "react-router-dom";
import { Navigation } from "@/components/layout/navigation";
import { PageTransition } from "@/components/layout/PageTransition";
import { RouteErrorBoundary } from "@/components/layout/RouteErrorBoundary";

export function AppShell() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Global navigation (desktop top bar + mobile bottom bar) */}
      <Navigation />

      {/* Page content area, padded so it doesn't sit under the fixed navbars */}
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
