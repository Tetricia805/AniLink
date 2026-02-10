import { useState, useEffect, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { BackHeader } from "@/components/layout/BackHeader";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAnimals } from "@/hooks/useAnimals";
import { animalDtoToRecordsAnimal } from "@/lib/animalMappers";
import { mapAnimalsToScanAnimals, getScanAnimalById } from "@/data/scan";
import { StepSelectAnimal } from "@/components/scan/StepSelectAnimal";
import { PhotoUploader } from "@/components/scan/PhotoUploader";
import { ScanResultsView } from "@/components/scan/ScanResultsView";
import { analyzeScanImage } from "@/api/scan";
import { apiResultToScanResult } from "@/lib/scan/scanResultMapper";
import { SCAN_RECORDS_QUERY_KEY } from "@/lib/queryClient";
import type { ScanAnimal } from "@/types/scan";
import type { ScanResult } from "@/types/scan";

/** AI Scan flow: select-animal -> photos -> results. No symptoms step. */
const STEPS = [
  { id: 1, key: "select-animal", name: "Select Animal" },
  { id: 2, key: "photos", name: "Upload Photos" },
  { id: 3, key: "results", name: "AI Results" },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

export function RecordsScanPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { push } = useToast();
  const queryClient = useQueryClient();
  const { data: apiAnimals = [] } = useAnimals();
  const scanAnimals = mapAnimalsToScanAnimals(apiAnimals.map(animalDtoToRecordsAnimal));

  const [step, setStep] = useState<StepKey>("select-animal");
  const [selectedAnimal, setSelectedAnimal] = useState<ScanAnimal | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanError, setScanError] = useState<{ type: "NOT_CATTLE"; probCattle: number } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastRecordId, setLastRecordId] = useState<string | null>(null);

  const previewUrlsRef = useRef<string[]>([]);
  previewUrlsRef.current = previewUrls;

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
      case "photos":
        return files.length >= 1;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (step === "select-animal" && selectedAnimal) {
      setStep("photos");
      return;
    }
    if (step === "photos" && files[0]) {
      setStep("results");
      setIsAnalyzing(true);
      setResult(null);
      setScanError(null);
      try {
        const apiRes = await analyzeScanImage(files[0], {
          threshold: 0.5,
          animalId: selectedAnimal ? String(selectedAnimal.id) : undefined,
        });
        if (apiRes.ok) {
          setResult(apiResultToScanResult(apiRes));
        } else {
          setScanError({ type: "NOT_CATTLE", probCattle: apiRes.probCattle });
        }
        if (apiRes.record) {
          setLastRecordId(apiRes.record.id);
          queryClient.invalidateQueries({ queryKey: SCAN_RECORDS_QUERY_KEY });
        }
      } catch (err) {
        push({
          title: "Scan analysis failed",
          description: err instanceof Error ? err.message : "Analysis failed. Please try again.",
          variant: "destructive",
        });
        setScanError(null);
        setStep("photos");
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleBack = () => {
    if (step === "photos") {
      setStep("select-animal");
      return;
    }
    if (step === "results") {
      revokePreviews();
      setStep("photos");
      setResult(null);
      setScanError(null);
      return;
    }
  };

  const handleSaveToRecords = () => {
    if (!result && !scanError) return;
    if (selectedAnimal && lastRecordId) {
      navigate(`/records?focusScan=${lastRecordId}&animalId=${selectedAnimal.id}`);
    } else if (selectedAnimal) {
      navigate(`/records?animalId=${selectedAnimal.id}`);
    }
  };

  const handleNewScan = () => {
    setStep("select-animal");
    setSelectedAnimal(null);
    revokePreviews();
    setResult(null);
    setScanError(null);
  };

  const stepIndex = STEPS.findIndex((s) => s.key === step);
  const currentStep = STEPS[stepIndex];
  const progress = step === "results" ? 100 : ((stepIndex + 1) / 3) * 100;
  const showWizardControls = step !== "results";
  const showBack = showWizardControls && step !== "select-animal";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        <BackHeader
          title="AI Health Scan"
          subtitle="Linked to animal records — select animal, upload photo"
        />
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
                Step {stepIndex + 1} of 3
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
              <PhotoUploader
                animalName={selectedAnimal.name}
                files={files}
                previewUrls={previewUrls}
                onFilesChange={(f, u) => {
                  setFiles(f);
                  setPreviewUrls(u);
                }}
              />
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!canGoNext()}
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
              <ScanResultsView
                displayName={selectedAnimal.name}
                displayType={selectedAnimal.type}
                displayImage={selectedAnimal.image}
                result={result}
                isLoading={isAnalyzing}
                onSaveToRecords={handleSaveToRecords}
                onNewScan={handleNewScan}
                onViewRecords={() =>
                  navigate(
                    selectedAnimal
                      ? `/records?animalId=${selectedAnimal.id}`
                      : "/records"
                  )
                }
                scanError={scanError}
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
