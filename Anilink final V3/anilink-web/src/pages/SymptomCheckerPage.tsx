import { useState } from "react";
import { BackHeader } from "@/components/layout/BackHeader";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { SymptomsForm } from "@/components/scan/SymptomsForm";
import { ScanResultsView } from "@/components/scan/ScanResultsView";
import { mockScanResult } from "@/data/scan";
import type { SymptomSeverity, SymptomDuration } from "@/types/scan";

export function SymptomCheckerPage() {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState<SymptomSeverity | "">("");
  const [duration, setDuration] = useState<SymptomDuration | "">("");
  const [notes, setNotes] = useState("");
  const [phase, setPhase] = useState<"form" | "results">("form");

  const canAnalyze = symptoms.length > 0 || notes.trim().length > 0;

  const handleAnalyze = () => {
    if (!canAnalyze) return;
    setPhase("results");
  };

  const result = phase === "results" ? mockScanResult({ symptoms, notes, photoCount: 0 }) : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        <BackHeader
          title="Symptom Checker"
          subtitle="Describe symptoms for preliminary recommendations"
        />

        {phase === "form" && (
          <div className="space-y-6">
            <SymptomsForm
              symptoms={symptoms}
              severity={severity}
              duration={duration}
              notes={notes}
              onSymptomsChange={setSymptoms}
              onSeverityChange={setSeverity}
              onDurationChange={setDuration}
              onNotesChange={setNotes}
            />
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleAnalyze}
                disabled={!canAnalyze}
              >
                Get Recommendations
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {phase === "results" && result && (
          <ScanResultsView
            displayName="Symptom Checker"
            displayType="Preliminary assessment"
            result={result}
            isLoading={false}
            onNewScan={() => setPhase("form")}
          />
        )}
      </div>
    </div>
  );
}
