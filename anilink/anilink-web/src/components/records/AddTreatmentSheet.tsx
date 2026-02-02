import { useState } from "react";
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
import { useTimelineRecordsStore } from "@/store/timelineRecordsStore";
import type { Animal } from "@/types/records";

function formatDateForTimeline(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export interface AddTreatmentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animal: Animal | null;
  onSuccess: () => void;
}

export function AddTreatmentSheet({
  open,
  onOpenChange,
  animal,
  onSuccess,
}: AddTreatmentSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const addRecord = useTimelineRecordsStore((s) => s.addItem);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !animal) return;
    setIsSubmitting(true);
    try {
      addRecord({
        type: "treatment",
        title: name.trim(),
        description: notes.trim() || "—",
        date: formatDateForTimeline(date),
        details: notes.trim() || undefined,
        animalId: animal.id,
      });
      onSuccess();
      setName("");
      setDate(new Date().toISOString().slice(0, 10));
      setNotes("");
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Add Treatment</SheetTitle>
          {animal && (
            <p className="text-sm text-muted-foreground">for {animal.name}</p>
          )}
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="treatment-name">Treatment name *</Label>
            <Input
              id="treatment-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Antibiotics, Dewormer"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="treatment-date">Date</Label>
            <Input
              id="treatment-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="treatment-notes">Notes (optional)</Label>
            <Textarea
              id="treatment-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Adding…" : "Add Treatment"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
