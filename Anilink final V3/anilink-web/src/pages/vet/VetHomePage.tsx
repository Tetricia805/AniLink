import { useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, FolderOpen, Users, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { getDisplayName, getRoleLabel } from "@/lib/userUtils";
import { useBookings } from "@/hooks/useBookings";
import { useVetCases } from "@/hooks/useCases";
import { staggerContainer, staggerItem, sectionTransition, cardHoverClass } from "@/lib/motion";

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
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl md:text-3xl font-semibold mb-2">
            Welcome back, {getDisplayName(user)}
          </h1>
          <Badge variant="secondary" className="text-sm">
            {getRoleLabel(user?.role)}
          </Badge>
          <p className="text-muted-foreground mt-3 mb-0">Today&apos;s overview and pending work.</p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={staggerItem}>
            <Card className="h-full border border-border transition-all duration-200 hover:shadow-lg hover:border-primary/30">
              <CardContent className="p-4">
                <Calendar className="h-5 w-5 text-icon-primary mb-2" />
                <div className="text-2xl font-semibold">{appointmentsToday}</div>
                <div className="text-sm text-muted-foreground">Appointments today</div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={staggerItem}>
            <Link to="/vet/appointments?status=requested" className="block h-full">
              <Card className={`h-full cursor-pointer border border-border ${cardHoverClass}`}>
                <CardContent className="p-4">
                  <FolderOpen className="h-5 w-5 text-icon-amber mb-2" />
                  <div className="text-2xl font-semibold">{pendingCount}</div>
                  <div className="text-sm text-muted-foreground">Pending requests</div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
          <motion.div variants={staggerItem}>
            <Link to="/vet/cases" className="block h-full">
              <Card className={`h-full border border-border ${cardHoverClass}`}>
                <CardContent className="p-4">
                  <Stethoscope className="h-5 w-5 text-icon-secondary mb-2" />
                  <div className="text-2xl font-semibold">{activeCasesCount}</div>
                  <div className="text-sm text-muted-foreground">Active cases</div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
          <motion.div variants={staggerItem}>
            <Card className="h-full border border-border transition-all duration-200 hover:shadow-lg hover:border-primary/30">
              <CardContent className="p-4">
                <Users className="h-5 w-5 text-icon-primary mb-2" />
                <div className="text-2xl font-semibold">0</div>
                <div className="text-sm text-muted-foreground">Patients seen</div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div {...sectionTransition}>
          <Card className="p-8 text-center rounded-2xl border border-border">
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
        </motion.div>
      </div>
    </div>
  );
}
