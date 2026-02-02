import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { LayoutDashboard, Users, Stethoscope, Package, Calendar, ShoppingCart } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { getDisplayName } from "@/lib/userUtils";
import { useAdminStats } from "@/hooks/useAdmin";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";

function roleLabel(role: string | undefined): string {
  if (!role) return "Admin";
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

export function AdminDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: stats, isLoading: statsLoading, isError: statsError } = useAdminStats();
  const recentBookings = stats?.recent_bookings ?? [];
  const recentOrders = stats?.recent_orders ?? [];

  if (statsLoading && !stats) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
          <LoadingSkeleton lines={8} />
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
          <p className="text-destructive">Could not load dashboard stats.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold mb-2">
            Welcome back, {getDisplayName(user)}
          </h1>
          <Badge variant="secondary" className="text-sm">
            {roleLabel(user?.role)}
          </Badge>
        </div>

        <h2 className="text-xl font-medium mb-2">Admin Dashboard</h2>
        <p className="text-muted-foreground mb-6">Platform overview and analytics.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <Users className="h-5 w-5 text-icon-primary mb-2" />
              <div className="text-2xl font-semibold">{stats?.total_users ?? "—"}</div>
              <div className="text-sm text-muted-foreground">Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <Stethoscope className="h-5 w-5 text-icon-secondary mb-2" />
              <div className="text-2xl font-semibold">{stats?.total_vets ?? "—"}</div>
              <div className="text-sm text-muted-foreground">Vets / Clinics</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <Package className="h-5 w-5 text-icon-amber mb-2" />
              <div className="text-2xl font-semibold">{stats?.total_products ?? "—"}</div>
              <div className="text-sm text-muted-foreground">Products</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <LayoutDashboard className="h-5 w-5 text-muted-foreground mb-2" />
              <div className="text-2xl font-semibold">{stats?.total_orders_amount != null ? `UGX ${(stats.total_orders_amount / 1000).toFixed(0)}k` : "—"}</div>
              <div className="text-sm text-muted-foreground">Revenue (30d)</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Link to="/admin/reports" className="text-sm text-primary hover:underline">View reports</Link>
            </CardHeader>
            <CardContent>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Recent bookings ({stats?.total_bookings ?? 0} total)
              </h3>
              {recentBookings.length === 0 ? (
                <EmptyState title="No bookings" description="No recent bookings." />
              ) : (
                <ul className="space-y-2">
                  {recentBookings.map((b) => (
                    <li key={b.id} className="text-sm flex justify-between">
                      <span>{b.vet_name ?? "Vet"} / {b.clinic_name ?? ""} · {b.date ? new Date(b.date).toLocaleDateString() : "—"}</span>
                      <Badge variant="outline" className="text-xs">{b.status}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Recent orders ({stats?.total_orders ?? 0} total)
              </h3>
              {recentOrders.length === 0 ? (
                <EmptyState title="No orders" description="No recent orders." />
              ) : (
                <ul className="space-y-2">
                  {recentOrders.map((o) => (
                    <li key={o.id} className="text-sm flex justify-between">
                      <span>Order {o.id.slice(0, 8)} · UGX {o.total_amount.toLocaleString()}</span>
                      <Badge variant="outline" className="text-xs capitalize">{o.status}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

