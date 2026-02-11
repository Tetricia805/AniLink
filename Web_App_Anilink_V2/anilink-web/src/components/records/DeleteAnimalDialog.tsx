import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/button";
import type { Animal } from "@/types/records";

export interface DeleteAnimalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animal: Animal | null;
  onConfirm?: (animal: Animal) => void;
}

export function DeleteAnimalDialog({
  open,
  onOpenChange,
  animal,
  onConfirm,
}: DeleteAnimalDialogProps) {
  const handleKeep = () => onOpenChange(false);
  const handleDelete = () => {
    if (animal) {
      onConfirm?.(animal);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete animal?</DialogTitle>
          <DialogDescription>
            This will permanently remove {animal?.name} from your records. This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="secondary" onClick={handleKeep}>
            Keep
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
          >
            Delete animal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
