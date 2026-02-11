import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { useAdminReports } from "@/hooks/useAdmin";

function formatDateRange(days: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export function AdminReportsPage() {
  const [range, setRange] = useState(() => formatDateRange(30));
  const { data, isLoading, isError } = useAdminReports({
    from: range.from,
    to: range.to,
  });

  if (isLoading && !data) return <LoadingSkeleton lines={8} />;
  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
          <p className="text-destructive">Could not load reports.</p>
        </div>
      </div>
    );
  }

  const ordersByDay = data?.orders_by_day ?? [];
  const bookingsByStatus = data?.bookings_by_status ?? {};
  const topSellers = data?.top_sellers ?? [];
  const topProducts = data?.top_products ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
        <h1 className="text-2xl md:text-3xl font-semibold mb-2">Reports</h1>
        <p className="text-muted-foreground mb-6">Analytics and reports.</p>

        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <Label htmlFor="from" className="text-xs">From</Label>
            <Input
              id="from"
              type="date"
              value={range.from}
              onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
              className="mt-1 w-[140px]"
            />
          </div>
          <div>
            <Label htmlFor="to" className="text-xs">To</Label>
            <Input
              id="to"
              type="date"
              value={range.to}
              onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
              className="mt-1 w-[140px]"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => setRange(formatDateRange(7))}
            >
              7 days
            </button>
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => setRange(formatDateRange(30))}
            >
              30 days
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-3">Orders by day</h3>
              {ordersByDay.length === 0 ? (
                <EmptyState title="No orders" description="No orders in this period." />
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {ordersByDay.map((d) => (
                    <div key={d.date} className="flex justify-between text-sm">
                      <span>{d.date}</span>
                      <span>{d.count} orders · UGX {d.total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-3">Bookings by status</h3>
              {Object.keys(bookingsByStatus).length === 0 ? (
                <EmptyState title="No bookings" description="No bookings in the system." />
              ) : (
                <div className="space-y-2">
                  {Object.entries(bookingsByStatus).map(([status, count]) => (
                    <div key={status} className="flex justify-between text-sm">
                      <span className="capitalize">{status.toLowerCase()}</span>
                      <span>{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-3">Top sellers</h3>
              {topSellers.length === 0 ? (
                <EmptyState title="No sellers" description="No sales in this period." />
              ) : (
                <div className="space-y-2">
                  {topSellers.map((s) => (
                    <div key={s.id} className="flex justify-between text-sm">
                      <span>{s.name}</span>
                      <span>{s.orders} orders · UGX {s.total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-3">Top products</h3>
              {topProducts.length === 0 ? (
                <EmptyState title="No products" description="No product sales in this period." />
              ) : (
                <div className="space-y-2">
                  {topProducts.map((p) => (
                    <div key={p.id} className="flex justify-between text-sm">
                      <span className="truncate max-w-[200px]">{p.title}</span>
                      <span>{p.orders} orders</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
