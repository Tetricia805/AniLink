import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Button } from "@/components/ui/button";
import { Plus, HeartPulse, FileText, Syringe, Scan } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { AddTreatmentSheet } from "./AddTreatmentSheet";
import { AddNoteSheet } from "./AddNoteSheet";
import { AddVaccineSheet } from "./AddVaccineSheet";
import type { Animal } from "@/types/records";

export type AddRecordKind = "treatment" | "note" | "vaccine";

export interface AddRecordMenuProps {
  animal: Animal | null;
  onAdded?: () => void;
}

export function AddRecordMenu({ animal, onAdded }: AddRecordMenuProps) {
  const navigate = useNavigate();
  const { push } = useToast();
  const [open, setOpen] = useState<AddRecordKind | null>(null);

  const handleOpen = (kind: AddRecordKind) => {
    setOpen(kind);
  };

  const handleSuccess = () => {
    push({ title: "Record added", description: "Your record has been saved. TODO: connect to API." });
    setOpen(null);
    onAdded?.();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add record
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={() => {
              const url = animal ? `/records/scan?animalId=${animal.id}` : "/records/scan";
              navigate(url);
            }}
          >
            <Scan className="h-4 w-4 mr-2" />
            Start Scan
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleOpen("treatment")}>
            <HeartPulse className="h-4 w-4 mr-2" />
            Add Treatment
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleOpen("note")}>
            <FileText className="h-4 w-4 mr-2" />
            Add Note
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleOpen("vaccine")}>
            <Syringe className="h-4 w-4 mr-2" />
            Add Vaccine
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AddTreatmentSheet
        open={open === "treatment"}
        onOpenChange={(o) => !o && setOpen(null)}
        animal={animal}
        onSuccess={handleSuccess}
      />
      <AddNoteSheet
        open={open === "note"}
        onOpenChange={(o) => !o && setOpen(null)}
        animal={animal}
        onSuccess={handleSuccess}
      />
      <AddVaccineSheet
        open={open === "vaccine"}
        onOpenChange={(o) => !o && setOpen(null)}
        animal={animal}
        onSuccess={handleSuccess}
      />
    </>
  );
}
