import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/Sheet";
import { Calendar, Clock, MapPin, FileText, Check, X } from "lucide-react";
import { useBookings, useUpdateBookingStatus } from "@/hooks/useBookings";
import type { BookingDto } from "@/api/bookings";

function getStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status.toUpperCase()) {
    case "REQUESTED":
      return "secondary";
    case "CONFIRMED":
      return "default";
    case "DECLINED":
    case "CANCELLED":
      return "destructive";
    case "IN_PROGRESS":
      return "default";
    case "COMPLETED":
      return "outline";
    default:
      return "outline";
  }
}

function BookingCard({ 
  booking, 
  isFocused 
}: { 
  booking: BookingDto; 
  isFocused: boolean;
}) {
  const updateStatus = useUpdateBookingStatus();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFocused && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isFocused]);

  const handleAccept = () => {
    updateStatus.mutate({ id: booking.id, status: "CONFIRMED" });
  };

  const handleReject = () => {
    updateStatus.mutate({ id: booking.id, status: "DECLINED" });
  };

  const isPending = booking.status.toUpperCase() === "REQUESTED";
  const scheduledDate = new Date(booking.scheduledAt);

  return (
    <Card 
      ref={cardRef}
      className={`transition-all duration-200 hover:shadow-lg hover:border-primary/30 active:scale-[0.99] ${isFocused ? "ring-2 ring-primary shadow-lg" : ""}`}
    >
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-base md:text-lg font-semibold truncate">
                  Farmer Appointment
                </h3>
                <Badge variant={getStatusBadgeVariant(booking.status)}>
                  {booking.status}
                </Badge>
              </div>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>{scheduledDate.toLocaleDateString(undefined, { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0" />
                  <span>{scheduledDate.toLocaleTimeString(undefined, { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>{booking.visitType}</span>
                </div>
                {booking.notes && (
                  <div className="flex items-start gap-2 mt-2">
                    <FileText className="h-4 w-4 shrink-0 mt-0.5" />
                    <span className="text-xs">{booking.notes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {isPending && (
            <div className="flex gap-2 pt-2 border-t">
              <Button
                onClick={handleAccept}
                disabled={updateStatus.isPending}
                className="flex-1 gap-2"
                size="sm"
              >
                <Check className="h-4 w-4" />
                Accept
              </Button>
              <Button
                onClick={handleReject}
                disabled={updateStatus.isPending}
                variant="destructive"
                className="flex-1 gap-2"
                size="sm"
              >
                <X className="h-4 w-4" />
                Decline
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function VetAppointmentsPage() {
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get("status") || "all";
  const focusId = searchParams.get("focus");

  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    if (["all", "requested", "confirmed", "completed"].includes(statusFilter)) {
      setActiveTab(statusFilter);
    }
  }, [statusFilter]);

  const { data: allBookings = [], isLoading, isError } = useBookings();
  const updateStatus = useUpdateBookingStatus();

  const clearFocus = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("focus");
    window.history.replaceState(null, "", `${window.location.pathname}${next.toString() ? `?${next.toString()}` : ""}`);
  };

  const requestedBookings = allBookings.filter(
    (b) => b.status.toUpperCase() === "REQUESTED"
  );
  const confirmedBookings = allBookings.filter(
    (b) => {
      const s = b.status.toUpperCase();
      return s === "CONFIRMED" || s === "IN_PROGRESS";
    }
  );
  const completedBookings = allBookings.filter(
    (b) => b.status.toUpperCase() === "COMPLETED"
  );

  const getBookingsByTab = (tab: string): BookingDto[] => {
    switch (tab) {
      case "requested":
        return requestedBookings;
      case "confirmed":
        return confirmedBookings;
      case "completed":
        return completedBookings;
      default:
        return allBookings;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
          <h1 className="text-2xl md:text-3xl font-semibold mb-2">Appointments</h1>
          <p className="text-muted-foreground mb-6">View and manage booking requests.</p>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4 md:p-6">
                  <LoadingSkeleton lines={4} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
          <h1 className="text-2xl md:text-3xl font-semibold mb-2">Appointments</h1>
          <p className="text-muted-foreground mb-6">View and manage booking requests.</p>
          <Card>
            <CardContent className="p-8">
              <EmptyState
                title="Could not load appointments"
                description="Please try again later."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const focusedBooking = focusId ? allBookings.find((b) => b.id === focusId) : null;
  const isFocusPending = focusedBooking?.status.toUpperCase() === "REQUESTED";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl md:text-3xl font-semibold mb-2">Appointments</h1>
          <p className="text-muted-foreground mb-6">View and manage booking requests.</p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">
              All ({allBookings.length})
            </TabsTrigger>
            <TabsTrigger value="requested">
              Requested ({requestedBookings.length})
            </TabsTrigger>
            <TabsTrigger value="confirmed">
              Confirmed ({confirmedBookings.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedBookings.length})
            </TabsTrigger>
          </TabsList>

          {["all", "requested", "confirmed", "completed"].map((tab) => {
            const bookings = getBookingsByTab(tab);
            return (
              <TabsContent key={tab} value={tab} className="mt-0">
                {bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        isFocused={focusId === booking.id}
                      />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8">
                      <EmptyState
                        title={`No ${tab === "all" ? "" : tab} appointments`}
                        description={
                          tab === "requested"
                            ? "New booking requests from farmers will appear here."
                            : "Appointments will appear here when available."
                        }
                      />
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

      {/* Focus drawer: /vet/appointments?status=requested&focus=<id> – show details + Accept/Decline */}
      <Sheet
        open={!!focusId && !!focusedBooking}
        onOpenChange={(open) => {
          if (!open) clearFocus();
        }}
      >
        <SheetContent className="w-full max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Booking details</SheetTitle>
          </SheetHeader>
          {focusedBooking && (
            <div className="mt-4 space-y-4">
              <BookingCard booking={focusedBooking} isFocused={false} />
              {isFocusPending && (
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    className="flex-1 gap-2"
                    size="sm"
                    disabled={updateStatus.isPending}
                    onClick={async () => {
                      try {
                        await updateStatus.mutateAsync({ id: focusedBooking.id, status: "CONFIRMED" });
                        clearFocus();
                      } catch {
                        // Toast from hook
                      }
                    }}
                  >
                    <Check className="h-4 w-4" />
                    Accept
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 gap-2"
                    size="sm"
                    disabled={updateStatus.isPending}
                    onClick={async () => {
                      try {
                        await updateStatus.mutateAsync({ id: focusedBooking.id, status: "DECLINED" });
                        clearFocus();
                      } catch {
                        // Toast from hook
                      }
                    }}
                  >
                    <X className="h-4 w-4" />
                    Decline
                  </Button>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
