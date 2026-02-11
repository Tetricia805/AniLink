import { useState, useEffect, useCallback, useRef } from "react";
import { BackHeader } from "@/components/layout/BackHeader";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useScanRecordsStore } from "@/store/scanRecordsStore";
import { useAnimals } from "@/hooks/useAnimals";
import { animalDtoToRecordsAnimal } from "@/lib/animalMappers";
import { mapAnimalsToScanAnimals, getScanAnimalById, mockScanResult } from "@/data/scan";
import { StepSelectAnimal } from "@/components/scan/StepSelectAnimal";
import { StepSymptoms } from "@/components/scan/StepSymptoms";
import { StepPhotos } from "@/components/scan/StepPhotos";
import { StepResults } from "@/components/scan/StepResults";
import type { ScanAnimal } from "@/types/scan";
import type { ScanResult } from "@/types/scan";
import type { SymptomSeverity, SymptomDuration } from "@/types/scan";

const STEPS = [
  { id: 1, key: "select-animal", name: "Select Animal" },
  { id: 2, key: "symptoms", name: "Symptoms" },
  { id: 3, key: "photos", name: "Upload Photos" },
  { id: 4, key: "results", name: "AI Results" },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

export function ScanPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { push } = useToast();
  const addScanRecord = useScanRecordsStore((s) => s.addItem);
  const { data: apiAnimals = [] } = useAnimals();
  const animals = apiAnimals.map(animalDtoToRecordsAnimal);
  const scanAnimals = mapAnimalsToScanAnimals(animals);

  const [step, setStep] = useState<StepKey>("select-animal");
  const [selectedAnimal, setSelectedAnimal] = useState<ScanAnimal | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState<SymptomSeverity | "">("");
  const [duration, setDuration] = useState<SymptomDuration | "">("");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const previewUrlsRef = useRef<string[]>([]);
  previewUrlsRef.current = previewUrls;

  const stepIndex = STEPS.findIndex((s) => s.key === step);
  const currentStep = STEPS[stepIndex];
  const progress = step === "results" ? 100 : ((stepIndex + 1) / 4) * 100;

  useEffect(() => {
    const animalId = searchParams.get("animalId");
    if (!animalId || scanAnimals.length === 0) return;
    const a = getScanAnimalById(scanAnimals, animalId);
    if (a) setSelectedAnimal(a);
  }, [searchParams, scanAnimals]);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch {
          /* noop */
        }
      });
    };
  }, []);

  const revokePreviews = useCallback(() => {
    previewUrls.forEach((u) => {
      try {
        URL.revokeObjectURL(u);
      } catch {
        /* noop */
      }
    });
    setPreviewUrls([]);
    setFiles([]);
  }, [previewUrls]);

  const canGoNext = (): boolean => {
    switch (step) {
      case "select-animal":
        return selectedAnimal != null;
      case "symptoms":
        return symptoms.length > 0 || notes.trim().length > 0;
      case "photos":
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step === "select-animal" && selectedAnimal) {
      setStep("symptoms");
      return;
    }
    if (step === "symptoms") {
      if (!(symptoms.length > 0 || notes.trim().length > 0)) {
        push({
          title: "Symptoms or notes required",
          description: "Add at least one symptom or write notes to continue.",
        });
        return;
      }
      setStep("photos");
      return;
    }
    if (step === "photos") {
      setStep("results");
      setIsAnalyzing(true);
      setResult(null);
      setTimeout(() => {
        setResult(
          mockScanResult({
            symptoms,
            notes,
            photoCount: files.length,
          }),
        );
        setIsAnalyzing(false);
      }, 2000);
    }
  };

  const handleBack = () => {
    if (step === "symptoms") {
      setStep("select-animal");
      return;
    }
    if (step === "photos") {
      setStep("symptoms");
      return;
    }
    if (step === "results") {
      revokePreviews();
      setStep("photos");
      setResult(null);
      return;
    }
  };

  const handleNewScan = () => {
    setStep("select-animal");
    setSelectedAnimal(null);
    setSymptoms([]);
    setSeverity("");
    setDuration("");
    setNotes("");
    revokePreviews();
    setResult(null);
  };

  const handleSaveToRecords = () => {
    if (!selectedAnimal || !result) return;
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    addScanRecord({
      type: "scan",
      title: "AI Health Scan",
      description: result.summary.slice(0, 80) + (result.summary.length > 80 ? "…" : ""),
      date: dateStr,
      details: result.summary,
      animalId: selectedAnimal.id,
    });
    push({ title: "Saved to records", description: "Scan linked to " + selectedAnimal.name + "." });
    navigate(`/records?animalId=${selectedAnimal.id}`);
  };

  const showWizardControls = step !== "results";
  const showBack = showWizardControls && step !== "select-animal";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        <BackHeader title="AI Health Scan" subtitle="Get an AI-assisted health assessment for your animal" />
        <div className="mb-6">
          {showBack && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="mb-4 focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Previous step"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Previous step
            </Button>
          )}
        </div>

        {showWizardControls && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Step {stepIndex + 1} of 4
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}% complete
              </span>
            </div>
            <Progress value={progress} className="h-2 rounded-full" />
            {currentStep && (
              <p className="text-sm font-medium mt-2">{currentStep.name}</p>
            )}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === "select-animal" && (
            <motion.div
              key="select-animal"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <StepSelectAnimal
                animals={scanAnimals}
                selected={selectedAnimal}
                onSelect={setSelectedAnimal}
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!canGoNext()}
                  className="focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === "symptoms" && selectedAnimal && (
            <motion.div
              key="symptoms"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <StepSymptoms
                animal={selectedAnimal}
                symptoms={symptoms}
                severity={severity}
                duration={duration}
                notes={notes}
                onSymptomsChange={setSymptoms}
                onSeverityChange={setSeverity}
                onDurationChange={setDuration}
                onNotesChange={setNotes}
              />
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="focus-visible:ring-2 focus-visible:ring-ring"
                >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!canGoNext()}
                  className="focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === "photos" && selectedAnimal && (
            <motion.div
              key="photos"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <StepPhotos
                animal={selectedAnimal}
                files={files}
                previewUrls={previewUrls}
                onFilesChange={(f, u) => {
                  setFiles(f);
                  setPreviewUrls(u);
                }}
              />
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!canGoNext()}
                  className="focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Analyze
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === "results" && selectedAnimal && (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              <StepResults
                animal={selectedAnimal}
                result={result}
                isLoading={isAnalyzing}
                onSaveToRecords={handleSaveToRecords}
                onNewScan={handleNewScan}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {step === "select-animal" && !selectedAnimal && (
          <Card className="mt-8 rounded-xl border-dashed">
            <CardContent className="py-8 text-center text-muted-foreground">
              <p className="text-sm">
                No animal selected yet. Choose one above to start the scan.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
