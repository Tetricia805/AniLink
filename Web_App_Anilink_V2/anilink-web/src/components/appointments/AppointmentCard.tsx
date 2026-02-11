import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Calendar,
  MapPin,
  MessageCircle,
  Phone,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type AppointmentStatus = "pending" | "upcoming" | "completed" | "cancelled" | "rejected";
export type AppointmentType = "clinic" | "farm" | "emergency";

export interface Appointment {
  id: string;
  status: AppointmentStatus;
  dateTime: string;
  type: AppointmentType;
  vetName: string;
  clinicName?: string;
  location: string;
  animalName: string;
  animalTag?: string;
  species: string;
  reason: string;
  cost?: string;
  ownerName?: string;
  ownerPhone?: string;
}

export interface AppointmentCardProps {
  appointment: Appointment;
  mode: "owner" | "vet";
  onView?: (appointment: Appointment) => void;
  onCancel?: (appointment: Appointment) => void;
  onReschedule?: (appointment: Appointment) => void;
  onAccept?: (appointment: Appointment) => void;
  onDecline?: (appointment: Appointment) => void;
  onMessage?: (appointment: Appointment) => void;
}

function getStatusBadge(status: AppointmentStatus) {
  switch (status) {
    case "pending":
      return { label: "Pending", className: "bg-icon-amber-subtle text-icon-amber" };
    case "upcoming":
      return { label: "Upcoming", className: "bg-blue-100 text-blue-700" };
    case "completed":
      return { label: "Completed", className: "bg-emerald-100 text-emerald-700" };
    case "cancelled":
      return { label: "Cancelled", className: "bg-slate-100 text-slate-600" };
    case "rejected":
      return { label: "Rejected", className: "bg-red-100 text-red-700" };
    default:
      return { label: status, className: "bg-muted text-muted-foreground" };
  }
}

function getTypePill(type: AppointmentType) {
  switch (type) {
    case "clinic":
      return { label: "Clinic visit", className: "bg-icon-primary-subtle text-icon-primary" };
    case "farm":
      return { label: "Farm visit", className: "bg-emerald-50 text-emerald-700" };
    case "emergency":
      return { label: "Emergency", className: "bg-red-50 text-red-700" };
  }
}

function formatDateTime(value: string) {
  const date = new Date(value);
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AppointmentCard({
  appointment,
  mode,
  onView,
  onCancel,
  onReschedule,
  onAccept,
  onDecline,
  onMessage,
}: AppointmentCardProps) {
  const status = getStatusBadge(appointment.status);
  const typePill = getTypePill(appointment.type);
  const isEmergency = appointment.type === "emergency";

  const handleView = () => onView?.(appointment);
  const handleCancel = () => onCancel?.(appointment);
  const handleReschedule = () => onReschedule?.(appointment);
  const handleAccept = () => onAccept?.(appointment);
  const handleDecline = () => onDecline?.(appointment);
  const handleMessage = () => onMessage?.(appointment);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleView}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleView();
        }
      }}
      className="group rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card
        className={cn(
          "rounded-2xl border border-border bg-card/80 shadow-soft transition-all duration-200",
          "group-hover:-translate-y-1 group-hover:shadow-card",
          "active:scale-[0.99]",
          isEmergency && "border-red-200 bg-red-50/40 dark:bg-red-950/20",
        )}
      >
        <CardContent className="p-4 md:p-6 space-y-4">
          {/* Top row: date/time + status + type */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatDateTime(appointment.dateTime)}</span>
            </div>
            <div className="flex items-center gap-2">
              {isEmergency && <AlertTriangle className="h-4 w-4 text-red-500" />}
              <Badge className={cn("rounded-full px-2 py-0.5 text-xs", status.className)}>
                {status.label}
              </Badge>
              <Badge className={cn("rounded-full px-2 py-0.5 text-xs", typePill.className)}>
                {typePill.label}
              </Badge>
            </div>
          </div>

          {/* Main content */}
          <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,2fr)]">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-icon-primary" />
                <p className="font-medium text-sm md:text-base truncate">
                  {appointment.vetName}
                  {appointment.clinicName ? ` \u00b7 ${appointment.clinicName}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{appointment.location}</span>
              </div>

              {mode === "vet" && appointment.ownerName && (
                <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span className="truncate">
                    {appointment.ownerName}
                    {appointment.ownerPhone ? ` \u00b7 ${appointment.ownerPhone}` : ""}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {appointment.animalName}
                    {appointment.animalTag ? ` (${appointment.animalTag})` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{appointment.species}</p>
                </div>
                {appointment.cost && (
                  <p className="text-sm font-semibold text-icon-primary whitespace-nowrap">{appointment.cost}</p>
                )}
              </div>
              <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                {appointment.reason}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div
            className="flex flex-wrap items-center gap-2 pt-2"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={handleView}
              className="text-xs md:text-sm"
            >
              View details
            </Button>

            {mode === "owner" && appointment.status === "upcoming" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReschedule}
                  className="text-xs md:text-sm"
                >
                  Reschedule
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  className="text-xs md:text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Cancel
                </Button>
              </>
            )}

            {mode === "owner" && appointment.status === "pending" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="text-xs md:text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Cancel request
              </Button>
            )}

            {mode === "vet" && appointment.status === "pending" && (
              <>
                <Button
                  size="sm"
                  onClick={handleAccept}
                  className="text-xs md:text-sm"
                >
                  Accept
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDecline}
                  className="text-xs md:text-sm text-red-600 border-red-200 hover:bg-red-50"
                >
                  Decline
                </Button>
              </>
            )}

            {mode === "vet" && appointment.status === "upcoming" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMessage}
                  className="text-xs md:text-sm"
                >
                  <MessageCircle className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  Message owner
                </Button>
                <Button
                  size="sm"
                  onClick={handleAccept}
                  className="text-xs md:text-sm"
                >
                  Mark completed
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

