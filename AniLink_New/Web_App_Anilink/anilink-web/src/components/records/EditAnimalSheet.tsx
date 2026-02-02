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
import { DeleteAnimalDialog } from "./DeleteAnimalDialog";
import type { Animal, AnimalSpecies, AnimalStatus } from "@/types/records";

const SPECIES_OPTIONS: AnimalSpecies[] = ["Livestock", "Poultry", "Pets"];
const STATUS_OPTIONS: AnimalStatus[] = [
  "Healthy",
  "Sick",
  "Under Treatment",
  "Recovered",
  "Archived",
];

export interface EditAnimalSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animal: Animal | null;
  onSave: (animal: Animal) => void;
  onArchive?: (animal: Animal) => void;
  onDelete?: (animal: Animal) => void;
}

export function EditAnimalSheet({
  open,
  onOpenChange,
  animal,
  onSave,
  onArchive,
  onDelete,
}: EditAnimalSheetProps) {
  const { push } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [species, setSpecies] = useState<AnimalSpecies>("Livestock");
  const [breed, setBreed] = useState("");
  const [tagId, setTagId] = useState("");
  const [sex, setSex] = useState("");
  const [ageOrDob, setAgeOrDob] = useState("");
  const [status, setStatus] = useState<AnimalStatus>("Healthy");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (animal && open) {
      setName(animal.name);
      setSpecies(animal.species);
      setBreed(animal.breed ?? "");
      setTagId(animal.tagId ?? "");
      setSex(animal.sex ?? "");
      setAgeOrDob(animal.ageOrDob ?? "");
      setStatus(animal.status);
      setNotes(animal.notes ?? "");
    }
  }, [animal, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!animal || !name.trim()) {
      push({ title: "Validation error", description: "Name is required." });
      return;
    }
    setIsSubmitting(true);
    try {
      const updated: Animal = {
        ...animal,
        name: name.trim(),
        species,
        breed: breed.trim() || undefined,
        tagId: tagId.trim() || undefined,
        sex: sex.trim() || undefined,
        ageOrDob: ageOrDob.trim() || undefined,
        status,
        notes: notes.trim() || undefined,
      };
      onSave(updated);
      push({ title: "Profile updated", description: `${updated.name}'s profile has been saved.` });
      onOpenChange(false);
    } catch {
      push({ title: "Update failed", description: "Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = () => {
    if (!animal) return;
    onArchive?.({ ...animal, status: "Archived" });
    push({ title: "Animal archived", description: `${animal.name} has been archived.` });
    onOpenChange(false);
  };

  const handleDeleteConfirm = (a: Animal) => {
    onDelete?.(a);
    push({ title: "Animal deleted", description: `${a.name} has been removed.` });
    setDeleteDialogOpen(false);
    onOpenChange(false);
  };

  if (!animal) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Edit Animal Profile</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-species">Species *</Label>
              <select
                id="edit-species"
                value={species}
                onChange={(e) => setSpecies(e.target.value as AnimalSpecies)}
                className="flex h-9 w-full rounded-md border border-input bg-input-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {SPECIES_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-breed">Breed (optional)</Label>
              <Input
                id="edit-breed"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-tag">Tag ID (optional)</Label>
                <Input
                  id="edit-tag"
                  value={tagId}
                  onChange={(e) => setTagId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-sex">Sex (optional)</Label>
                <Input
                  id="edit-sex"
                  value={sex}
                  onChange={(e) => setSex(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-age">Age or DOB (optional)</Label>
              <Input
                id="edit-age"
                value={ageOrDob}
                onChange={(e) => setAgeOrDob(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <select
                id="edit-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as AnimalStatus)}
                className="flex h-9 w-full rounded-md border border-input bg-input-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes (optional)</Label>
              <Textarea
                id="edit-notes"
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
                {isSubmitting ? "Saving…" : "Save"}
              </Button>
            </div>
            <div className="flex flex-col gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleArchive}
              >
                Archive animal
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete animal
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
      <DeleteAnimalDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        animal={animal}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
