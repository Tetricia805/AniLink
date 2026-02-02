import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/button";
import type { Appointment } from "./AppointmentCard";

export interface CancelAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  onConfirm?: (appointment: Appointment) => void;
}

export function CancelAppointmentDialog({
  open,
  onOpenChange,
  appointment,
  onConfirm,
}: CancelAppointmentDialogProps) {
  const handleKeep = () => onOpenChange(false);
  const handleCancelAppointment = () => {
    if (appointment) {
      onConfirm?.(appointment);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel appointment?</DialogTitle>
          <DialogDescription>
            This will cancel your booking request.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="secondary" onClick={handleKeep}>
            Keep
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleCancelAppointment}
          >
            Cancel appointment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
