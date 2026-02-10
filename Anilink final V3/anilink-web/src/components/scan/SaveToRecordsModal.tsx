/**
 * Modal for saving AI scan to records.
 * - If animals exist: show animal picker, then save.
 * - If no animals: show "Register an animal to save this scan" with Register Animal / Not now.
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Animal } from "@/types/records";

export interface SaveToRecordsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animals: Animal[];
  onSelectAnimal: (animal: Animal) => void;
  onRegisterAnimal: () => void;
  onNotNow: () => void;
  isLoading?: boolean;
}

export function SaveToRecordsModal({
  open,
  onOpenChange,
  animals,
  onSelectAnimal,
  onRegisterAnimal,
  onNotNow,
  isLoading,
}: SaveToRecordsModalProps) {
  const hasAnimals = animals.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save scan to records</DialogTitle>
          <DialogDescription>
            {hasAnimals
              ? "Select an animal to link this scan to."
              : "Register an animal to save this scan to your health records."}
          </DialogDescription>
        </DialogHeader>

        {hasAnimals ? (
          <div className="space-y-2 py-2 max-h-48 overflow-y-auto">
            {animals.map((animal) => (
              <button
                key={animal.id}
                type="button"
                onClick={() => onSelectAnimal(animal)}
                disabled={isLoading}
                className="w-full text-left p-4 rounded-lg border border-border hover:bg-muted/60 transition-colors flex items-center gap-3"
              >
                <span className="text-2xl">{animal.image ?? "🐾"}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{animal.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {animal.breed ?? animal.species}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              You need to register an animal before you can save scans to your records.
            </p>
            <div className="flex flex-col gap-2">
              <Button type="button" onClick={onRegisterAnimal} disabled={isLoading}>
                <Plus className="h-4 w-4 mr-2" />
                Register Animal
              </Button>
              <Button type="button" variant="ghost" onClick={onNotNow}>
                Not now
              </Button>
            </div>
          </div>
        )}

        {hasAnimals && (
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
