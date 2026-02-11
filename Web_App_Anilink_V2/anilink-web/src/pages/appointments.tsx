import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/DropdownMenu";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { AppointmentCard, type Appointment } from "@/components/appointments/AppointmentCard";
import { RescheduleSheet } from "@/components/appointments/RescheduleSheet";
import { AppointmentDetailsSheet } from "@/components/appointments/AppointmentDetailsSheet";
import { CancelAppointmentDialog } from "@/components/appointments/CancelAppointmentDialog";
import { useToast } from "@/components/ui/use-toast";
import { useBookingStore } from "@/store/bookingStore";
import { useBookings, useUpdateBookingStatus } from "@/hooks/useBookings";
import { bookingDtoToAppointment } from "@/api/bookings";
import { Filter, Search, SlidersHorizontal } from "lucide-react";

type TabKey = "upcoming" | "pending" | "past" | "cancelled";

export function AppointmentsPage() {
  const [searchParams] = useSearchParams();
  const { data: bookings = [], isLoading } = useBookings();
  const updateStatus = useUpdateBookingStatus();
  const openWithPrefill = useBookingStore((s) => s.openWithPrefill);
  const setOnSuccessCallback = useBookingStore((s) => s.setOnSuccessCallback);

  const appointments = useMemo(
    () => bookings.map(bookingDtoToAppointment),
    [bookings],
  );

  const [tab, setTab] = useState<TabKey>("upcoming");
  const [search, setSearch] = useState("");
  const [typeFilters, setTypeFilters] = useState<Appointment["type"][]>([]);
  const [sort, setSort] = useState<"soonest" | "latest">("soonest");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const { push } = useToast();

  useEffect(() => {
    const initialTab = searchParams.get("status");
    if (initialTab === "upcoming") setTab("upcoming");
    else if (initialTab === "pending") setTab("pending");
    else if (initialTab === "past") setTab("past");
    else if (initialTab === "cancelled") setTab("cancelled");
    else setTab("upcoming");
  }, [searchParams]);

  const focusId = searchParams.get("focus");
  useEffect(() => {
    if (!focusId || appointments.length === 0) return;
    const appt = appointments.find((a) => a.id === focusId);
    if (appt) {
      setSelectedAppointment(appt);
      setDetailsOpen(true);
      const tabForStatus = appt.status === "pending" ? "pending" : appt.status === "upcoming" ? "upcoming" : appt.status === "completed" ? "past" : "cancelled";
      setTab(tabForStatus);
    }
  }, [focusId, appointments]);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      const animalId = searchParams.get("animalId");
      openWithPrefill(animalId ? { animalId } : {});
    }
  }, [searchParams, openWithPrefill]);

  useEffect(() => {
    setOnSuccessCallback(() => setTab("pending"));
    return () => setOnSuccessCallback(null);
  }, [setOnSuccessCallback]);

  const toggleTypeFilter = (type: Appointment["type"]) => {
    setTypeFilters((current) =>
      current.includes(type) ? current.filter((t) => t !== type) : [...current, type],
    );
  };

  const handleView = useCallback((appt: Appointment) => {
    setSelectedAppointment(appt);
    setDetailsOpen(true);
  }, []);

  const handleReschedule = useCallback((appt: Appointment) => {
    setSelectedAppointment(appt);
    setDetailsOpen(false);
    setRescheduleOpen(true);
  }, []);

  const handleCancelClick = useCallback((appt: Appointment) => {
    setSelectedAppointment(appt);
    setDetailsOpen(false);
    setCancelDialogOpen(true);
  }, []);

  const handleRescheduleSuccess = useCallback(
    (_appointmentId: string, _newDateTime: string) => {
      push({ title: "Reschedule", description: "Reschedule is not yet supported. Please cancel and create a new booking." });
      setRescheduleOpen(false);
    },
    [push],
  );

  const handleCancelConfirm = useCallback(
    async (appointment: Appointment) => {
      try {
        await updateStatus.mutateAsync({ id: appointment.id, status: "CANCELLED" });
        setSelectedAppointment(null);
        setCancelDialogOpen(false);
      } catch {
        // Toast from mutation
      }
    },
    [updateStatus],
  );

  const handleMessage = useCallback(() => {
    push({ title: "Message", description: "TODO: open message or call flow." });
  }, [push]);

  const filteredAppointments = useMemo(() => {
    let list = appointments.slice();

    // Tab filter
    list = list.filter((appt) => {
      switch (tab) {
        case "upcoming":
          return appt.status === "upcoming";
        case "pending":
          return appt.status === "pending";
        case "past":
          return appt.status === "completed";
        case "cancelled":
          return appt.status === "cancelled" || appt.status === "rejected";
        default:
          return true;
      }
    });

    // Type filters
    if (typeFilters.length > 0) {
      list = list.filter((appt) => typeFilters.includes(appt.type));
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((appt) => {
        return (
          appt.vetName.toLowerCase().includes(q) ||
          (appt.clinicName && appt.clinicName.toLowerCase().includes(q)) ||
          appt.location.toLowerCase().includes(q) ||
          appt.animalName.toLowerCase().includes(q)
        );
      });
    }

    // Sort
    list.sort((a, b) => {
      const da = new Date(a.dateTime).getTime();
      const db = new Date(b.dateTime).getTime();
      return sort === "soonest" ? da - db : db - da;
    });

    return list;
  }, [appointments, tab, typeFilters, search, sort]);

  const hasResults = filteredAppointments.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl space-y-6">
        <PageHeader
          title="Appointments"
          subtitle="Keep track of your upcoming visits, farm calls, and past consultations."
          action={
            <Button type="button" onClick={() => openWithPrefill({})}>
              Book a vet
            </Button>
          }
        />

        <Card>
          <CardContent className="p-4 md:p-6 space-y-4">
            {/* Tabs */}
            <Tabs value={tab} onValueChange={(value) => setTab(value as TabKey)}>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <TabsList>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="past">Past</TabsTrigger>
                  <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                </TabsList>

                <div className="flex flex-wrap gap-2">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by vet, animal, or location"
                      className="pl-9 text-sm"
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" aria-label="Sort appointments">
                        <SlidersHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => setSort("soonest")}>
                        Soonest first
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSort("latest")}>
                        Latest first
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <Separator className="my-3" />

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Filter className="h-3 w-3" />
                  Filters:
                </span>
                <Button
                  type="button"
                  variant={typeFilters.includes("farm") ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                  onClick={() => toggleTypeFilter("farm")}
                >
                  Farm visit
                </Button>
                <Button
                  type="button"
                  variant={typeFilters.includes("clinic") ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                  onClick={() => toggleTypeFilter("clinic")}
                >
                  Clinic visit
                </Button>
                <Button
                  type="button"
                  variant={typeFilters.includes("emergency") ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                  onClick={() => toggleTypeFilter("emergency")}
                >
                  Emergency
                </Button>
              </div>

              <TabsContent value={tab} className="mt-4 space-y-4">
                {isLoading ? (
                  <div className="space-y-4">
                    <LoadingSkeleton lines={4} />
                    <LoadingSkeleton lines={4} />
                    <LoadingSkeleton lines={4} />
                  </div>
                ) : hasResults ? (
                  <div className="space-y-4">
                    {filteredAppointments.map((appt) => (
                      <AppointmentCard
                        key={appt.id}
                        appointment={appt}
                        mode="owner"
                        onView={handleView}
                        onCancel={handleCancelClick}
                        onReschedule={handleReschedule}
                        onAccept={() => push({ title: "Updated", description: "TODO: vet accept API." })}
                        onDecline={() => push({ title: "Declined", description: "TODO: vet decline API." })}
                        onMessage={handleMessage}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No appointments found"
                    description="You don't have any appointments in this category yet. Try adjusting your filters or book a vet."
                    action={
                      <Button type="button" size="sm" onClick={() => openWithPrefill({})}>
                        Book a vet
                      </Button>
                    }
                  />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <RescheduleSheet
        open={rescheduleOpen}
        onOpenChange={setRescheduleOpen}
        appointment={selectedAppointment}
        onSuccess={handleRescheduleSuccess}
      />
      <AppointmentDetailsSheet
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        appointment={selectedAppointment}
        mode="owner"
        onReschedule={handleReschedule}
        onCancel={handleCancelClick}
        onMessage={handleMessage}
      />
      <CancelAppointmentDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        appointment={selectedAppointment}
        onConfirm={handleCancelConfirm}
      />
    </div>
  );
}

