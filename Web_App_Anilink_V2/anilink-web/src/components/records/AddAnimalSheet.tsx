import { useState, useRef, useEffect } from "react";
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
import { searchSpecies, type SpeciesOption } from "@/data/speciesWithIcons";
import type { Animal, AnimalSpecies, AnimalStatus } from "@/types/records";

const STATUS_OPTIONS: AnimalStatus[] = [
  "Healthy",
  "Sick",
  "Under Treatment",
  "Recovered",
];

export interface AddAnimalSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Callback when adding via local store (legacy). */
  onSuccess?: (animal: Omit<Animal, "id">) => void;
  /** Mutation for API create. When provided, uses API instead of onSuccess. */
  onCreate?: (data: { name: string; type: string; breed?: string; dateOfBirth?: string; gender?: string; tagNumber?: string; notes?: string }) => void;
  isPending?: boolean;
}

export function AddAnimalSheet({
  open,
  onOpenChange,
  onSuccess,
  onCreate,
  isPending,
}: AddAnimalSheetProps) {
  const { push } = useToast();
  const speciesInputRef = useRef<HTMLInputElement>(null);
  const speciesDropdownRef = useRef<HTMLDivElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [speciesSearch, setSpeciesSearch] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesOption | null>(null);
  const [speciesDropdownOpen, setSpeciesDropdownOpen] = useState(false);
  const [breed, setBreed] = useState("");
  const [tagId, setTagId] = useState("");
  const [sex, setSex] = useState("");
  const [ageOrDob, setAgeOrDob] = useState("");
  const [status, setStatus] = useState<AnimalStatus>("Healthy");
  const [notes, setNotes] = useState("");

  const speciesMatches = searchSpecies(selectedSpecies ? "" : speciesSearch);
  const showDropdown = speciesDropdownOpen && speciesMatches.length > 0;

  useEffect(() => {
    if (!open) {
      setSpeciesSearch("");
      setSelectedSpecies(null);
      setSpeciesDropdownOpen(false);
    }
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        speciesDropdownRef.current &&
        !speciesDropdownRef.current.contains(e.target as Node) &&
        speciesInputRef.current &&
        !speciesInputRef.current.contains(e.target as Node)
      ) {
        setSpeciesDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const reset = () => {
    setName("");
    setSpeciesSearch("");
    setSelectedSpecies(null);
    setBreed("");
    setTagId("");
    setSex("");
    setAgeOrDob("");
    setStatus("Healthy");
    setNotes("");
  };

  const handleSpeciesSelect = (option: SpeciesOption) => {
    setSelectedSpecies(option);
    setSpeciesSearch(option.label);
    setBreed(option.label);
    setSpeciesDropdownOpen(false);
  };

  const handleSpeciesInputChange = (value: string) => {
    setSpeciesSearch(value);
    setSelectedSpecies(null);
    setSpeciesDropdownOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      push({ title: "Validation error", description: "Name is required." });
      return;
    }
    if (!selectedSpecies) {
      push({
        title: "Validation error",
        description: "Please select a species from the list.",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      if (onCreate) {
        onCreate({
          name: name.trim(),
          type: selectedSpecies.label,
          breed: breed.trim() || undefined,
          dateOfBirth: ageOrDob.trim() || undefined,
          gender: sex.trim() || undefined,
          tagNumber: tagId.trim() || undefined,
          notes: notes.trim() || undefined,
        });
        reset();
        onOpenChange(false);
      } else if (onSuccess) {
        const animalData: Omit<Animal, "id"> = {
          name: name.trim(),
          species: selectedSpecies.category as AnimalSpecies,
          breed: breed.trim() || undefined,
          tagId: tagId.trim() || undefined,
          sex: sex.trim() || undefined,
          ageOrDob: ageOrDob.trim() || undefined,
          status,
          notes: notes.trim() || undefined,
          image: selectedSpecies.icon,
        };
        onSuccess(animalData);
        push({
          title: "Animal added",
          description: `${animalData.name} has been added to your records.`,
        });
        reset();
        onOpenChange(false);
      }
    } catch {
      push({ title: "Failed to add animal", description: "Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Add Animal</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="add-name">Name *</Label>
            <Input
              id="add-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Bella"
              required
            />
          </div>
          <div className="space-y-2 relative" ref={speciesDropdownRef}>
            <Label htmlFor="add-species">Species *</Label>
            <Input
              ref={speciesInputRef}
              id="add-species"
              value={selectedSpecies ? selectedSpecies.label : speciesSearch}
              onChange={(e) => handleSpeciesInputChange(e.target.value)}
              onFocus={() => setSpeciesDropdownOpen(true)}
              placeholder="e.g. Dairy Cow, Chicken, Dog"
              autoComplete="off"
              required
            />
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-56 overflow-auto rounded-md border border-border bg-popover shadow-md">
                {speciesMatches.map((option) => (
                  <button
                    key={`${option.label}-${option.category}`}
                    type="button"
                    className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-accent focus:bg-accent focus:outline-none"
                    onClick={() => handleSpeciesSelect(option)}
                  >
                    <span className="text-2xl" aria-hidden>
                      {option.icon}
                    </span>
                    <span>{option.label}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {option.category}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-breed">Breed (optional)</Label>
            <Input
              id="add-breed"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder="e.g. Dairy Cow, Rhode Island Red"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="add-tag">Tag ID (optional)</Label>
              <Input
                id="add-tag"
                value={tagId}
                onChange={(e) => setTagId(e.target.value)}
                placeholder="e.g. UG-001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-sex">Sex (optional)</Label>
              <Input
                id="add-sex"
                value={sex}
                onChange={(e) => setSex(e.target.value)}
                placeholder="M / F"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-age">Age or DOB (optional)</Label>
            <Input
              id="add-age"
              value={ageOrDob}
              onChange={(e) => setAgeOrDob(e.target.value)}
              placeholder="e.g. 3 years or 2022-01-15"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-status">Status</Label>
            <select
              id="add-status"
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
            <Label htmlFor="add-notes">Notes (optional)</Label>
            <Textarea
              id="add-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes…"
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
            <Button type="submit" className="flex-1" disabled={isSubmitting || isPending}>
              {isSubmitting || isPending ? "Adding…" : "Add Animal"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
