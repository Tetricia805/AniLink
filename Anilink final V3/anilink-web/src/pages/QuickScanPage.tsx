import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { BackHeader } from "@/components/layout/BackHeader";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAnimals, useCreateAnimal } from "@/hooks/useAnimals";
import { animalDtoToRecordsAnimal } from "@/lib/animalMappers";
import { SCAN_RECORDS_QUERY_KEY } from "@/lib/queryClient";
import { PhotoUploader } from "@/components/scan/PhotoUploader";
import { ScanResultsView } from "@/components/scan/ScanResultsView";
import { SaveToRecordsModal } from "@/components/scan/SaveToRecordsModal";
import { AddAnimalSheet } from "@/components/records/AddAnimalSheet";
import { analyzeScanImage } from "@/api/scan";
import { apiResultToScanResult } from "@/lib/scan/scanResultMapper";
import type { ScanResult } from "@/types/scan";
import type { Animal } from "@/types/records";

export function QuickScanPage() {
  const { push } = useToast();
  const queryClient = useQueryClient();
  const { data: apiAnimals = [] } = useAnimals();
  const animals = apiAnimals.map(animalDtoToRecordsAnimal).filter((a) => a.status !== "Archived");
  const createAnimal = useCreateAnimal();

  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanError, setScanError] = useState<{ type: "NOT_CATTLE"; probCattle: number } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [phase, setPhase] = useState<"upload" | "results">("upload");
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [addAnimalOpen, setAddAnimalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const previewUrlsRef = useRef<string[]>([]);
  const filesRef = useRef<File[]>([]);
  const fileForSaveRef = useRef<File | null>(null);
  previewUrlsRef.current = previewUrls;
  filesRef.current = files;

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
    fileForSaveRef.current = null;
  }, [previewUrls]);

  const handleAnalyze = async () => {
    const currentFiles = filesRef.current;
    if (currentFiles.length < 1) {
      push({ title: "No image", description: "Please select an image first.", variant: "destructive" });
      return;
    }
    const file = currentFiles[0];
    setPhase("results");
    setIsAnalyzing(true);
    setResult(null);
    setScanError(null);
    fileForSaveRef.current = file;
    try {
      const apiRes = await analyzeScanImage(file, { threshold: 0.5 });
      if (apiRes.ok) {
        setResult(apiResultToScanResult(apiRes));
      } else {
        setScanError({ type: "NOT_CATTLE", probCattle: apiRes.probCattle });
      }
    } catch (err) {
      push({
        title: "Scan analysis failed",
        description: err instanceof Error ? err.message : "Analysis failed. Please try again.",
        variant: "destructive",
      });
      setScanError(null);
      setPhase("upload");
      fileForSaveRef.current = null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const performSaveWithAnimal = useCallback(
    async (animal: Animal) => {
      const file = fileForSaveRef.current;
      if (!file) {
        push({ title: "Error", description: "Image no longer available. Please run a new scan." });
        return;
      }
      setIsSaving(true);
      try {
        const apiRes = await analyzeScanImage(file, {
          threshold: 0.5,
          animalId: String(animal.id),
        });
        setSaveModalOpen(false);
        queryClient.invalidateQueries({ queryKey: SCAN_RECORDS_QUERY_KEY });
        if (apiRes.record) {
          push({
            title: "Saved to records",
            description: `Scan linked to ${animal.name}.`,
          });
        }
      } catch (err) {
        push({
          title: "Save failed",
          description: err instanceof Error ? err.message : "Could not save scan.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    },
    [push, queryClient]
  );

  const handleSaveToRecords = () => {
    if (!result && !scanError) return;
    setSaveModalOpen(true);
  };

  const handleSelectAnimal = (animal: Animal) => {
    performSaveWithAnimal(animal);
  };

  const handleRegisterAnimal = () => {
    setSaveModalOpen(false);
    setAddAnimalOpen(true);
  };

  const handleAnimalCreated = async (
    data: Parameters<typeof createAnimal.mutate>[0]
  ) => {
    const created = await createAnimal.mutateAsync(data);
    const animal = animalDtoToRecordsAnimal(created);
    setAddAnimalOpen(false);
    await performSaveWithAnimal(animal);
  };

  const handleNotNow = () => {
    setSaveModalOpen(false);
  };

  const handleNewScan = () => {
    revokePreviews();
    setResult(null);
    setScanError(null);
    setPhase("upload");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        <BackHeader
          title="AI Health Scan"
          subtitle="Upload a photo for AI health assessment (Cattle + FMD detection)"
        />

        {phase === "upload" && (
          <div className="space-y-6">
            <PhotoUploader
              files={files}
              previewUrls={previewUrls}
              onFilesChange={(f, u) => {
                setFiles(f);
                setPreviewUrls(u);
              }}
            />

            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
              <Link
                to="/scan/symptoms"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                No photo? Try Symptom Checker instead
              </Link>
              <Button
                type="button"
                onClick={handleAnalyze}
                disabled={files.length < 1}
              >
                Analyze
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {phase === "results" && (
          <ScanResultsView
            displayName="AI Health Scan"
            displayType="AI Health Scan"
            displayImage="🐄"
            result={result}
            isLoading={isAnalyzing}
            onSaveToRecords={handleSaveToRecords}
            onNewScan={handleNewScan}
            scanError={scanError}
          />
        )}
      </div>

      <SaveToRecordsModal
        open={saveModalOpen}
        onOpenChange={setSaveModalOpen}
        animals={animals}
        onSelectAnimal={handleSelectAnimal}
        onRegisterAnimal={handleRegisterAnimal}
        onNotNow={handleNotNow}
        isLoading={isSaving}
      />

      <AddAnimalSheet
        open={addAnimalOpen}
        onOpenChange={setAddAnimalOpen}
        onCreate={handleAnimalCreated}
        isPending={createAnimal.isPending}
      />
    </div>
  );
}
