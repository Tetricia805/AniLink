import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/Sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  MapPin,
  MessageCircle,
  Phone,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Appointment, AppointmentStatus, AppointmentType } from "./AppointmentCard";

function getStatusBadge(status: AppointmentStatus) {
  switch (status) {
    case "pending":
      return { label: "Pending", className: "bg-icon-amber-subtle text-icon-amber" };
    case "upcoming":
      return { label: "Upcoming", className: "bg-icon-secondary-subtle text-icon-secondary" };
    case "completed":
      return { label: "Completed", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" };
    case "cancelled":
      return { label: "Cancelled", className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" };
    case "rejected":
      return { label: "Rejected", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
    default:
      return { label: status, className: "bg-muted text-muted-foreground" };
  }
}

function getTypePill(type: AppointmentType) {
  switch (type) {
    case "clinic":
      return { label: "Clinic visit", className: "bg-icon-primary-subtle text-icon-primary" };
    case "farm":
      return { label: "Farm visit", className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" };
    case "emergency":
      return { label: "Emergency", className: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
  }
}

export interface AppointmentDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  mode: "owner" | "vet";
  onReschedule?: (appointment: Appointment) => void;
  onCancel?: (appointment: Appointment) => void;
  onMessage?: (appointment: Appointment) => void;
}

export function AppointmentDetailsSheet({
  open,
  onOpenChange,
  appointment,
  mode,
  onReschedule,
  onCancel,
  onMessage,
}: AppointmentDetailsSheetProps) {
  if (!appointment) return null;

  const status = getStatusBadge(appointment.status);
  const typePill = getTypePill(appointment.type);
  const canReschedule = mode === "owner" && (appointment.status === "upcoming" || appointment.status === "pending");
  const canCancel = mode === "owner" && (appointment.status === "upcoming" || appointment.status === "pending");
  const canMessage = mode === "vet" && (appointment.status === "upcoming" || appointment.status === "pending");

  const handleReschedule = () => {
    onOpenChange(false);
    onReschedule?.(appointment);
  };

  const handleCancel = () => {
    onOpenChange(false);
    onCancel?.(appointment);
  };

  const handleMessage = () => {
    onMessage?.(appointment);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-md overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Appointment details</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={cn("rounded-full px-2 py-0.5 text-xs", status.className)}>
              {status.label}
            </Badge>
            <Badge className={cn("rounded-full px-2 py-0.5 text-xs", typePill.className)}>
              {typePill.label}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>{new Date(appointment.dateTime).toLocaleString()}</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-icon-primary shrink-0" />
              <p className="font-semibold">{appointment.vetName}</p>
            </div>
            {appointment.clinicName && (
              <p className="text-muted-foreground pl-6">{appointment.clinicName}</p>
            )}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{appointment.location}</span>
          </div>
          {mode === "vet" && (appointment.ownerName || appointment.ownerPhone) && (
            <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
              {appointment.ownerName && (
                <span className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {appointment.ownerName}
                </span>
              )}
              {appointment.ownerPhone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {appointment.ownerPhone}
                </span>
              )}
            </div>
          )}
          <Separator />
          <div className="space-y-1">
            <p className="font-semibold">
              {appointment.animalName}
              {appointment.animalTag ? ` (${appointment.animalTag})` : ""}
            </p>
            <p className="text-muted-foreground">{appointment.species}</p>
          </div>
          <div>
            <p className="font-semibold mb-1">Reason</p>
            <p className="text-muted-foreground">{appointment.reason}</p>
          </div>
          {appointment.cost && (
            <div>
              <p className="font-semibold mb-1">Estimated cost</p>
              <p className="text-icon-primary">{appointment.cost}</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {canReschedule && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReschedule}
            >
              Reschedule
            </Button>
          )}
          {canCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              Cancel
            </Button>
          )}
          {canMessage && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleMessage}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Message farmer
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
