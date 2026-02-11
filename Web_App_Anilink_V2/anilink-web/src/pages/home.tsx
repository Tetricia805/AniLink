import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Scan,
  Stethoscope,
  ShoppingCart,
  Heart,
  Calendar,
  Package,
  Activity,
  ChevronRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { getDisplayName } from "@/lib/userUtils";
import { useAnimals } from "@/hooks/useAnimals";
import { useCases } from "@/hooks/useCases";
import { useBookings } from "@/hooks/useBookings";
import { useOrders } from "@/hooks/useOrders";
import { useScanRecordsStore } from "@/store/scanRecordsStore";
import { useTimelineRecordsStore } from "@/store/timelineRecordsStore";

const quickActions = [
  {
    id: 1,
    title: "Start Health Scan",
    description: "AI-assisted health assessment for your animals",
    icon: Scan,
    path: "/scan",
    color: "bg-icon-primary-subtle text-icon-primary",
  },
  {
    id: 2,
    title: "Find a Vet",
    description: "Discover and book veterinary services nearby",
    icon: Stethoscope,
    path: "/vets",
    color: "bg-icon-secondary-subtle text-icon-secondary",
  },
  {
    id: 3,
    title: "Browse Marketplace",
    description: "Shop for veterinary products and supplies",
    icon: ShoppingCart,
    path: "/marketplace",
    color: "bg-icon-amber-subtle text-icon-amber",
  },
];

function roleLabel(role: string | undefined): string {
  if (!role) return "Owner";
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

export function HomePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: apiAnimals = [] } = useAnimals();
  const { data: cases = [] } = useCases();
  const { data: bookings = [] } = useBookings();
  const { data: orders = [] } = useOrders();
  const scanRecords = useScanRecordsStore((s) => s.items);
  const timelineRecords = useTimelineRecordsStore((s) => s.items ?? []);

  const animalCount = apiAnimals.length;
  const upcomingCount = bookings.filter(
    (b) => b.status === "CONFIRMED" || b.status === "IN_PROGRESS",
  ).length;
  const pendingCount = bookings.filter((b) => b.status === "REQUESTED").length;
  const activeCasesCount = [
    ...cases.filter((c) => c.status?.toUpperCase() !== "CLOSED"),
    ...scanRecords,
    ...timelineRecords.filter((r) => r.type === "treatment"),
  ].length;

  const stats = useMemo(
    () => [
      {
        id: 1,
        label: "Animals Registered",
        value: String(animalCount),
        icon: Heart,
        color: "text-icon-primary",
        path: "/records?tab=animals",
      },
      {
        id: 2,
        label: "Active Health Cases",
        value: String(activeCasesCount),
        icon: Activity,
        color: "text-icon-amber",
        path: "/records?tab=cases&status=active",
      },
      {
        id: 3,
        label: "Upcoming Appointments",
        value: String(upcomingCount + pendingCount),
        icon: Calendar,
        color: "text-icon-secondary",
        path: "/appointments?status=upcoming",
      },
      {
        id: 4,
        label: "Recent Orders",
        value: String(orders.length),
        icon: Package,
        color: "text-icon-primary",
        path: "/orders",
      },
    ],
    [animalCount, activeCasesCount, upcomingCount, pendingCount, orders.length],
  );

  const recentActivity = useMemo(() => {
    const items: Array<{
      id: string;
      type: "scan" | "vet" | "order";
      title: string;
      description: string;
      time: string;
      icon: typeof Scan;
      href: string;
      color: string;
    }> = [];
    const latestCase = cases[0];
    const latestScan = scanRecords[0];
    if (latestCase) {
      items.push({
        id: `case-${latestCase.id}`,
        type: "scan",
        title: "Health case",
        description: `${latestCase.animalType} – ${latestCase.symptoms?.[0] ?? "Submitted"}`.slice(0, 50) + "…",
        time: "Recently",
        icon: Scan,
        href: latestCase.animalId ? `/records?animalId=${latestCase.animalId}` : "/records",
        color: "bg-icon-primary-subtle text-primary",
      });
    } else if (latestScan) {
      items.push({
        id: `scan-${latestScan.id}`,
        type: "scan",
        title: "Health scan completed",
        description: latestScan.description.slice(0, 50) + (latestScan.description.length > 50 ? "…" : ""),
        time: "Recently",
        icon: Scan,
        href: `/records?animalId=${latestScan.animalId}&highlight=scan:${latestScan.id}`,
        color: "bg-icon-primary-subtle text-icon-primary",
      });
    }
    const nextBooking = bookings.find(
      (b) => b.status === "CONFIRMED" || b.status === "IN_PROGRESS",
    );
    if (nextBooking) {
      items.push({
        id: `vet-${nextBooking.id}`,
        type: "vet",
        title: "Vet appointment",
        description: `${nextBooking.vetName ?? "Vet"} - ${nextBooking.clinicName ?? ""}`,
        time: "Upcoming",
        icon: Calendar,
        href: `/appointments?focus=${nextBooking.id}`,
        color: "bg-icon-secondary-subtle text-icon-secondary",
      });
    }
    if (items.length === 0) {
      items.push({
        id: "empty",
        type: "order",
        title: "No recent activity",
        description: "Add an animal, run a scan, or book a vet to see activity here.",
        time: "",
        icon: Package,
        href: "/records",
        color: "bg-icon-amber-subtle text-icon-amber",
      });
    }
    return items;
  }, [cases, scanRecords, bookings]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        {/* Welcome Section - avatar only in navbar */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl mb-2">
            Welcome back, {getDisplayName(user)}
          </h1>
          <Badge variant="secondary" className="text-sm">
            {roleLabel(user?.role)}
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.id}
                to={stat.path}
                className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl"
              >
                <Card className="h-full rounded-2xl border border-border transition-all duration-150 group-hover:-translate-y-1 group-hover:shadow-md group-hover:border-primary/40 active:scale-[0.98]">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-3">
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div className="text-lg sm:text-2xl md:text-3xl font-semibold mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground mb-2">
                      {stat.label}
                    </div>
                    <div className="mt-1 flex items-center text-xs sm:text-sm font-medium text-icon-primary">
                      <span className="block sm:hidden">View details →</span>
                      <span className="hidden sm:inline opacity-0 group-hover:opacity-100 transition-opacity">
                        View details →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl md:text-2xl mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.id} to={action.path}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg mb-2">{action.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {action.description}
                      </p>
                      <div className="flex items-center text-sm font-medium">
                        Get started <ChevronRight className="h-4 w-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl">Recent Activity</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/records">
                View all <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              {recentActivity.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <button
                    key={activity.id}
                    type="button"
                    onClick={() => navigate(activity.href)}
                    className={`w-full text-left p-6 flex items-start gap-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                      index !== recentActivity.length - 1 ? "border-b border-border" : ""
                    } hover:bg-muted/40`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${activity.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium mb-1">{activity.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground flex-shrink-0">
                      {activity.time}
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Empty State Alternative (if no data) */}
        {/* <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl mb-2">Welcome to AniLink!</h3>
            <p className="text-muted-foreground mb-6">
              Start managing your animal's health by adding your first animal or performing a health scan.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link to="/records">Add Animal</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/scan">Start Scan</Link>
              </Button>
            </div>
          </div>
        </Card> */}
      </div>
    </div>
  );
}
