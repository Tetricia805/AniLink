import { useState, useCallback, useEffect, useMemo } from "react";
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
import { cn } from "@/lib/utils";
import { useBookingStore } from "@/store/bookingStore";
import { useAnimals } from "@/hooks/useAnimals";
import { animalDtoToRecordsAnimal } from "@/lib/animalMappers";
import { useVetsList } from "@/hooks/useVets";
import { useCreateBooking } from "@/hooks/useBookings";
import type { AppointmentType } from "./AppointmentCard";

function vetIdToSelect(vetId: number | string): string {
  return String(vetId);
}
function animalIdToSelect(animalId: number | string): string {
  return String(animalId);
}

const TYPES: { value: AppointmentType; label: string }[] = [
  { value: "clinic", label: "Clinic visit" },
  { value: "farm", label: "Farm visit" },
  { value: "emergency", label: "Emergency" },
];

export interface BookAppointmentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BookAppointmentSheet({
  open,
  onOpenChange,
  onSuccess,
}: BookAppointmentSheetProps) {
  const { push } = useToast();
  const prefill = useBookingStore((s) => s.prefill);
  const clearPrefill = useBookingStore((s) => s.clearPrefill);
  const onSuccessCallback = useBookingStore((s) => s.onSuccessCallback);
  const createBooking = useCreateBooking();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vetId, setVetId] = useState("");
  const [type, setType] = useState<AppointmentType>("clinic");
  const [animalId, setAnimalId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [reason, setReason] = useState("");

  const { data: vets = [] } = useVetsList();
  const vetOptions = useMemo(
    () =>
      vets.map((v) => ({
        id: String(v.id),
        label: `${v.vet} — ${v.clinic}`,
      })),
    [vets],
  );
  const { data: apiAnimals = [] } = useAnimals();
  const animals = apiAnimals.map(animalDtoToRecordsAnimal);
  const animalOptions = useMemo(
    () =>
      animals
        .filter((a) => a.status !== "Archived")
        .map((a) => ({
          id: String(a.id),
          label: `${a.name}${a.tagId ? ` (${a.tagId})` : ""} — ${a.breed ?? a.species}`,
        })),
    [animals],
  );

  useEffect(() => {
    if (!open) return;
    if (prefill.vetId != null) setVetId(vetIdToSelect(prefill.vetId));
    if (prefill.animalId != null) setAnimalId(animalIdToSelect(prefill.animalId));
  }, [open, prefill.vetId, prefill.animalId]);

  const vet = vetOptions.find((v) => v.id === vetId);
  const animal = animalOptions.find((a) => a.id === animalId);
  const locationRequired = type === "farm";
  const locationError = locationRequired && !location.trim();

  const resetForm = useCallback(() => {
    setVetId("");
    setType("clinic");
    setAnimalId("");
    setDate("");
    setTime("");
    setLocation("");
    setReason("");
    clearPrefill();
  }, [clearPrefill]);

  const handleClose = useCallback(
    (o: boolean) => {
      if (!o) clearPrefill();
      onOpenChange(o);
    },
    [clearPrefill, onOpenChange],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (locationError || !vet || !animal || !date || !time || !reason.trim()) {
      if (locationError) {
        push({ title: "Validation error", description: "Location is required for farm visits." });
      } else {
        push({ title: "Validation error", description: "Please fill in all required fields." });
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const scheduledAt = new Date(`${date}T${time}`).toISOString();
      const visitType = type === "farm" ? "FARM" : "CLINIC";
      const notes = [
        reason.trim(),
        `Animal: ${animal.label}`,
        location.trim() ? `Location: ${location.trim()}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      await createBooking.mutateAsync({
        vetId: vet.id,
        visitType,
        scheduledAt,
        notes,
      });
      onSuccess?.();
      onSuccessCallback?.();
      resetForm();
      handleClose(false);
    } catch {
      // Toast already shown by useCreateBooking
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Book Appointment</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="book-vet">Vet / Clinic</Label>
            <select
              id="book-vet"
              value={vetId}
              onChange={(e) => setVetId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-input-background px-3 py-1 text-base md:text-sm focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              aria-label="Select vet or clinic"
            >
              <option value="">Select vet or clinic…</option>
              {vetOptions.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              TODO: integrate searchable vet list from API.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Appointment type</Label>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <Button
                  key={t.value}
                  type="button"
                  variant={type === t.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setType(t.value)}
                  className="rounded-full"
                >
                  {t.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="book-animal">Animal</Label>
            <select
              id="book-animal"
              value={animalId}
              onChange={(e) => setAnimalId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-input-background px-3 py-1 text-base md:text-sm focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              aria-label="Select animal"
            >
              <option value="">Select animal…</option>
              {animalOptions.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              TODO: integrate animals from API.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="book-date">Date</Label>
              <Input
                id="book-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                aria-required
              />
              <p className="text-xs text-muted-foreground">
                TODO: use date picker component when available.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="book-time">Time</Label>
              <Input
                id="book-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                aria-required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="book-location">
              Location {locationRequired && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id="book-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Kampala · Kololo or farm address"
              aria-required={locationRequired}
              aria-invalid={!!locationError}
              className={cn(locationError && "border-destructive")}
            />
            {locationRequired && (
              <p className="text-xs text-muted-foreground">
                Required for farm visits.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="book-reason">Reason / Symptoms</Label>
            <Textarea
              id="book-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe the issue or symptoms…"
              rows={4}
              aria-required
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              className="flex-1"
            >
              Close
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Requesting…" : "Request appointment"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
