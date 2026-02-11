import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { COMMON_SYMPTOMS, SEVERITY_OPTIONS, DURATION_OPTIONS } from "@/data/scan";
import type { ScanAnimal } from "@/types/scan";
import type { SymptomSeverity, SymptomDuration } from "@/types/scan";

export interface StepSymptomsProps {
  animal: ScanAnimal;
  symptoms: string[];
  severity: SymptomSeverity | "";
  duration: SymptomDuration | "";
  notes: string;
  onSymptomsChange: (symptoms: string[]) => void;
  onSeverityChange: (v: SymptomSeverity | "") => void;
  onDurationChange: (v: SymptomDuration | "") => void;
  onNotesChange: (v: string) => void;
}

export function StepSymptoms({
  animal,
  symptoms,
  severity,
  duration,
  notes,
  onSymptomsChange,
  onSeverityChange,
  onDurationChange,
  onNotesChange,
}: StepSymptomsProps) {
  const toggleSymptom = (s: string) => {
    if (symptoms.includes(s)) {
      onSymptomsChange(symptoms.filter((x) => x !== s));
    } else {
      onSymptomsChange([...symptoms, s]);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Describe Symptoms</CardTitle>
          <CardDescription>
            Add common symptoms for {animal.name}, severity, duration, and any extra notes. At least one symptom or notes is required.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <div>
            <Label className="mb-2 block">Common symptoms</Label>
            <div className="flex flex-wrap gap-2">
              {COMMON_SYMPTOMS.map((s) => {
                const active = symptoms.includes(s);
                return (
                  <Button
                    key={s}
                    type="button"
                    variant={active ? "default" : "outline"}
                    size="sm"
                    className="rounded-full"
                    onClick={() => toggleSymptom(s)}
                  >
                    {s}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scan-severity" className="mb-2 block">
                Severity
              </Label>
              <select
                id="scan-severity"
                value={severity}
                onChange={(e) =>
                  onSeverityChange((e.target.value || "") as SymptomSeverity | "")
                }
                className="flex h-9 w-full rounded-md border border-input bg-input-background px-3 py-1 text-sm focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                aria-label="Select severity"
              >
                {SEVERITY_OPTIONS.map((o) => (
                  <option key={o.value || "none"} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="scan-duration" className="mb-2 block">
                Duration
              </Label>
              <select
                id="scan-duration"
                value={duration}
                onChange={(e) =>
                  onDurationChange((e.target.value || "") as SymptomDuration | "")
                }
                className="flex h-9 w-full rounded-md border border-input bg-input-background px-3 py-1 text-sm focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                aria-label="Select duration"
              >
                {DURATION_OPTIONS.map((o) => (
                  <option key={o.value || "none"} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="scan-notes" className="mb-2 block">
              Additional notes
            </Label>
            <Textarea
              id="scan-notes"
              placeholder="E.g. The animal has been eating less for the past 3 days, slight limping on left hind leg..."
              className="min-h-[120px] resize-none"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
