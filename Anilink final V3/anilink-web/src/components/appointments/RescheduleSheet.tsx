import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/Sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import type { Appointment } from "./AppointmentCard";

export interface RescheduleSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  onSuccess?: (appointmentId: string, newDateTime: string, note?: string) => void;
}

function toDateLocal(iso: string) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toTimeLocal(iso: string) {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${min}`;
}

export function RescheduleSheet({
  open,
  onOpenChange,
  appointment,
  onSuccess,
}: RescheduleSheetProps) {
  const { push } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (appointment && open) {
      setDate(toDateLocal(appointment.dateTime));
      setTime(toTimeLocal(appointment.dateTime));
      setNote("");
    }
  }, [appointment, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment || !date || !time) {
      push({ title: "Validation error", description: "Please select date and time." });
      return;
    }

    setIsSubmitting(true);
    try {
      const newDateTime = new Date(`${date}T${time}`).toISOString();
      // TODO: Call backend reschedule endpoint. Mock for now.
      onSuccess?.(appointment.id, newDateTime, note.trim() || undefined);
      push({ title: "Appointment rescheduled", description: "The new date and time have been saved." });
      onOpenChange(false);
    } catch {
      push({ title: "Reschedule failed", description: "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!appointment) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Reschedule Appointment</SheetTitle>
        </SheetHeader>
        <div className="mb-6 rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">{appointment.vetName}</p>
          {appointment.clinicName && <p>{appointment.clinicName}</p>}
          <p>{appointment.animalName}{appointment.animalTag ? ` (${appointment.animalTag})` : ""} · {appointment.species}</p>
          <p>Current: {new Date(appointment.dateTime).toLocaleString()}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="reschedule-date">New date</Label>
              <Input
                id="reschedule-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                aria-required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reschedule-time">New time</Label>
              <Input
                id="reschedule-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                aria-required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reschedule-note">Note (optional)</Label>
            <Textarea
              id="reschedule-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Prefer morning slot…"
              rows={3}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Close
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Updating…" : "Confirm reschedule"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
