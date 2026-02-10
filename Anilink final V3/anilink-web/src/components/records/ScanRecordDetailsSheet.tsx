/**
 * Details drawer for AI scan records (from backend).
 */

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/Sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Scan, Stethoscope } from "lucide-react";
import type { ScanRecordDto } from "@/api/scan";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export interface ScanRecordDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: ScanRecordDto | null;
  animalName?: string | null;
  onStartScan?: () => void;
  onBookVet?: () => void;
}

export function ScanRecordDetailsSheet({
  open,
  onOpenChange,
  record,
  animalName,
  onStartScan,
  onBookVet,
}: ScanRecordDetailsSheetProps) {
  if (!record) return null;

  const label =
    record.fmd_label && record.fmd_confidence != null
      ? `${record.fmd_label} (${(record.fmd_confidence * 100).toFixed(0)}%)`
      : `NOT_CATTLE (cattle_prob: ${(record.cattle_prob * 100).toFixed(1)}%)`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-md overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Scan details</SheetTitle>
        </SheetHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="gap-1">
              <Scan className="h-3 w-3" />
              AI Health Scan
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {formatDate(record.created_at)}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-1">{label}</h4>
            {animalName && (
              <p className="text-sm text-muted-foreground">
                Linked to: {animalName}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Cattle confidence</p>
              <p className="font-medium">{(record.cattle_prob * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Non-cattle</p>
              <p className="font-medium">{(record.non_cattle_prob * 100).toFixed(1)}%</p>
            </div>
            {record.fmd_label && (
              <>
                <div>
                  <p className="text-muted-foreground">FMD result</p>
                  <p className="font-medium">{record.fmd_label}</p>
                </div>
                {record.fmd_confidence != null && (
                  <div>
                    <p className="text-muted-foreground">FMD confidence</p>
                    <p className="font-medium">{(record.fmd_confidence * 100).toFixed(1)}%</p>
                  </div>
                )}
              </>
            )}
          </div>

          {record.gate_rule && (
            <div>
              <h4 className="text-sm font-medium mb-1">Gate rule</h4>
              <p className="text-sm text-muted-foreground">{record.gate_rule}</p>
            </div>
          )}
        </div>

        {(onStartScan || onBookVet) && (
          <div className="mt-6 flex flex-wrap gap-2">
            {onStartScan && (
              <Button type="button" size="sm" onClick={onStartScan}>
                <Scan className="h-4 w-4 mr-1" />
                Start Scan
              </Button>
            )}
            {onBookVet && (
              <Button type="button" variant="outline" size="sm" onClick={onBookVet}>
                <Stethoscope className="h-4 w-4 mr-1" />
                Book Vet
              </Button>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
