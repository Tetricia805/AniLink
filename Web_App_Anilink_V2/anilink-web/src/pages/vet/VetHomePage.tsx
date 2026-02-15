import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, FolderOpen, Users, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { getDisplayName } from "@/lib/userUtils";
import { useBookings } from "@/hooks/useBookings";
import { useVetCases } from "@/hooks/useCases";

function roleLabel(role: string | undefined): string {
  if (!role) return "Vet";
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

export function VetHomePage() {
  const user = useAuthStore((s) => s.user);
  const { data: bookings = [] } = useBookings();
  const { data: vetCases = [] } = useVetCases();
  const pendingCount = bookings.filter((b) => b.status.toUpperCase() === "REQUESTED").length;
  const totalBookings = bookings.length;

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.debug("[VetHome] bookings pending:", pendingCount, "total:", totalBookings);
    }
  }, [pendingCount, totalBookings]);
  const activeCasesCount = vetCases.filter((c) => c.status?.toUpperCase() !== "CLOSED").length;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const appointmentsToday = bookings.filter((b) => {
    const d = new Date(b.scheduledAt);
    return d >= todayStart && d <= todayEnd && b.status.toUpperCase() !== "CANCELLED" && b.status.toUpperCase() !== "DECLINED";
  }).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
        {/* Welcome Section - avatar only in navbar */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold mb-2">
            Welcome back, {getDisplayName(user)}
          </h1>
          <Badge variant="secondary" className="text-sm">
            {roleLabel(user?.role)}
          </Badge>
          <p className="text-muted-foreground mt-3 mb-0">Today&apos;s overview and pending work.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <Calendar className="h-5 w-5 text-icon-primary mb-2" />
              <div className="text-2xl font-semibold">{appointmentsToday}</div>
              <div className="text-sm text-muted-foreground">Appointments today</div>
            </CardContent>
          </Card>
          <Link to="/vet/appointments?status=requested">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="p-4">
                <FolderOpen className="h-5 w-5 text-icon-amber mb-2" />
                <div className="text-2xl font-semibold">{pendingCount}</div>
                <div className="text-sm text-muted-foreground">Pending requests</div>
              </CardContent>
            </Card>
          </Link>
          <Card>
            <CardContent className="p-4">
              <Stethoscope className="h-5 w-5 text-icon-secondary mb-2" />
              <div className="text-2xl font-semibold">{activeCasesCount}</div>
              <div className="text-sm text-muted-foreground">Active cases</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <Users className="h-5 w-5 text-icon-primary mb-2" />
              <div className="text-2xl font-semibold">0</div>
              <div className="text-sm text-muted-foreground">Patients seen</div>
            </CardContent>
          </Card>
        </div>

        <Card className="p-8 text-center">
          {pendingCount > 0 ? (
            <>
              <p className="text-muted-foreground mb-4">
                {pendingCount} pending request{pendingCount !== 1 ? "s" : ""} need your attention.
              </p>
              <Button asChild>
                <Link to="/vet/appointments?status=requested">View requests</Link>
              </Button>
            </>
          ) : (
            <>
              <p className="text-muted-foreground mb-4">No appointments today.</p>
              <Button asChild variant="outline">
                <Link to="/vet/profile">Update availability / Promote profile</Link>
              </Button>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
