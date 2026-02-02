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

export interface AddNoteSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animal: Animal | null;
  onSuccess: () => void;
}

export function AddNoteSheet({
  open,
  onOpenChange,
  animal,
  onSuccess,
}: AddNoteSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [content, setContent] = useState("");
  const addRecord = useTimelineRecordsStore((s) => s.addItem);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !animal) return;
    setIsSubmitting(true);
    try {
      addRecord({
        type: "note",
        title: title.trim(),
        description: content.trim().slice(0, 80) + (content.length > 80 ? "…" : ""),
        date: formatDateForTimeline(date),
        details: content.trim(),
        animalId: animal.id,
      });
      onSuccess();
      setTitle("");
      setDate(new Date().toISOString().slice(0, 10));
      setContent("");
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Add Note</SheetTitle>
          {animal && (
            <p className="text-sm text-muted-foreground">for {animal.name}</p>
          )}
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="note-title">Title *</Label>
            <Input
              id="note-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Follow-up observation"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note-date">Date</Label>
            <Input
              id="note-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note-content">Content *</Label>
            <Textarea
              id="note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Your note…"
              rows={4}
              required
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
              {isSubmitting ? "Adding…" : "Add Note"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
