import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/Sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Scan, Stethoscope } from "lucide-react";
import type { TimelineRecord, TimelineRecordType } from "@/types/records";

function getTypeLabel(t: TimelineRecordType): string {
  switch (t) {
    case "scan":
      return "Scan";
    case "vet":
      return "Vet Visit";
    case "treatment":
      return "Treatment";
    case "order":
      return "Order";
    default:
      return t;
  }
}

function getTypeIcon(t: TimelineRecordType) {
  switch (t) {
    case "scan":
      return Scan;
    case "vet":
      return Stethoscope;
    case "treatment":
    case "order":
      return FileText;
    default:
      return FileText;
  }
}

export interface RecordDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: TimelineRecord | null;
  selectedAnimalId: string | number | null;
}

export function RecordDetailsSheet({
  open,
  onOpenChange,
  record,
  selectedAnimalId,
}: RecordDetailsSheetProps) {
  const navigate = useNavigate();

  const handleStartScan = () => {
    onOpenChange(false);
    if (selectedAnimalId != null) {
      navigate(`/scan/start?animalId=${selectedAnimalId}`);
    } else {
      navigate("/scan/start");
    }
  };

  const handleBookVet = () => {
    onOpenChange(false);
    const params = new URLSearchParams({ new: "1" });
    if (selectedAnimalId != null) params.set("animalId", String(selectedAnimalId));
    navigate(`/appointments?${params.toString()}`);
  };

  if (!record) return null;

  const Icon = getTypeIcon(record.type);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-md overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Record details</SheetTitle>
        </SheetHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Icon className="h-3 w-3" />
              {getTypeLabel(record.type)}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {record.date}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-1">{record.title}</h4>
            <p className="text-sm text-muted-foreground">{record.description}</p>
          </div>
          {record.details && (
            <div>
              <h4 className="text-sm font-medium mb-1">Details</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {record.details}
              </p>
            </div>
          )}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={handleStartScan}>
            <Scan className="h-4 w-4 mr-1" />
            Start Scan
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleBookVet}
          >
            <Stethoscope className="h-4 w-4 mr-1" />
            Book Vet
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
