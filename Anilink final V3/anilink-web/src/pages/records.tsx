import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import {
  Plus,
  Pencil,
  Scan,
  Calendar,
  FileText,
  Heart,
  HeartPulse,
  Package,
  ChevronRight,
} from "lucide-react";
import { AddAnimalSheet } from "@/components/records/AddAnimalSheet";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { useToast } from "@/components/ui/use-toast";
import { EditAnimalSheet } from "@/components/records/EditAnimalSheet";
import { RecordDetailsSheet } from "@/components/records/RecordDetailsSheet";
import { ScanRecordDetailsSheet } from "@/components/records/ScanRecordDetailsSheet";
import { AddRecordMenu } from "@/components/records/AddRecordMenu";
import { useScanRecordsStore } from "@/store/scanRecordsStore";
import { useScanRecords, useScanRecordsRaw } from "@/hooks/useScanRecords";
import { useTimelineRecordsStore } from "@/store/timelineRecordsStore";
import { useAnimals, useCreateAnimal } from "@/hooks/useAnimals";
import { useCases } from "@/hooks/useCases";
import { animalDtoToRecordsAnimal } from "@/lib/animalMappers";
import type { CaseDto } from "@/api/cases";
import type { Animal, TimelineRecord, TimelineRecordType } from "@/types/records";
import type { ScanRecordDto } from "@/api/scan";

type TimelineTab = "all" | "scan" | "vet" | "treatment" | "order";

function getRecordIcon(t: TimelineRecordType) {
  switch (t) {
    case "scan":
      return Scan;
    case "vet":
      return Calendar;
    case "treatment":
      return HeartPulse;
    case "order":
      return Package;
    case "note":
      return FileText;
    default:
      return FileText;
  }
}

function getRecordColor(t: TimelineRecordType): string {
  switch (t) {
    case "scan":
      return "text-muted-foreground";
    case "vet":
      return "text-icon-primary";
    case "treatment":
      return "text-icon-amber";
    case "order":
      return "text-emerald-600";
    case "note":
      return "text-muted-foreground";
    default:
      return "text-muted-foreground";
  }
}

/** Normalize timeline date for display (e.g. "Jan 28, 2026") */
function formatTimelineDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Map API Case to TimelineRecord (type "scan"). */
function caseToTimelineRecord(c: CaseDto): TimelineRecord {
  return {
    id: c.id,
    type: "scan",
    title: `${c.animalType} – ${c.symptoms?.[0] ?? "Health case"}`,
    description: c.notes ?? c.symptoms?.join(", ") ?? "",
    date: c.createdAt ?? new Date().toISOString(),
    details: c.aiAssessment?.status,
    animalId: c.animalId ?? "",
  };
}

export function RecordsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: apiAnimals = [], isLoading: animalsLoading, isError: animalsError } = useAnimals();
  const { data: cases = [], isLoading: casesLoading } = useCases();
  const createAnimal = useCreateAnimal();
  const { push } = useToast();
  const localScanRecords = useScanRecordsStore((s) => s.items);
  const { data: apiScanRecords = [] } = useScanRecords();
  const { data: apiScanRecordsRaw = [] } = useScanRecordsRaw();
  const scanRecords = apiScanRecords.length > 0 ? apiScanRecords : localScanRecords;
  const timelineRecords = useTimelineRecordsStore((s) => s.items ?? []);
  const animals = useMemo(() => apiAnimals.map(animalDtoToRecordsAnimal), [apiAnimals]);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [timelineTab, setTimelineTab] = useState<TimelineTab>("all");
  const [addAnimalOpen, setAddAnimalOpen] = useState(false);
  const [editAnimalOpen, setEditAnimalOpen] = useState(false);
  const [recordDetailsOpen, setRecordDetailsOpen] = useState(false);
  const [scanRecordDetailsOpen, setScanRecordDetailsOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TimelineRecord | null>(null);
  const [selectedScanRecord, setSelectedScanRecord] = useState<ScanRecordDto | null>(null);
  const [focusedRecordId, setFocusedRecordId] = useState<string | null>(null);
  const focusedItemRef = useRef<HTMLDivElement | null>(null);

  const caseRecords = useMemo(() => cases.map(caseToTimelineRecord), [cases]);
  const mergedTimeline = useMemo(
    () =>
      [...caseRecords, ...scanRecords, ...timelineRecords].sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [caseRecords, scanRecords, timelineRecords],
  );

  useEffect(() => {
    const animalId = searchParams.get("animalId");
    if (!animalId || animals.length === 0) return;
    const a = animals.find((x) => String(x.id) === animalId);
    if (a) setSelectedAnimal(a);
  }, [searchParams, animals]);

  const focusCaseId = searchParams.get("focusCase");
  const focusScanId = searchParams.get("focusScan");
  const hasShownNotFoundRef = useRef(false);

  useEffect(() => {
    if (!focusCaseId) {
      hasShownNotFoundRef.current = false;
      return;
    }
    if (casesLoading) return;
    const c = cases.find(
      (x) => x.id === focusCaseId || x.id.startsWith(focusCaseId)
    );
    if (c) {
      hasShownNotFoundRef.current = false;
      const record = caseToTimelineRecord(c);
      setSelectedRecord(record);
      setRecordDetailsOpen(true);
      setScanRecordDetailsOpen(false);
      setFocusedRecordId(record.id as string);
      if (c.animalId && animals.length > 0) {
        const a = animals.find((x) => String(x.id) === c.animalId);
        if (a) setSelectedAnimal(a);
      } else if (animals.length > 0) {
        setSelectedAnimal(animals[0]);
      }
      setTimelineTab("scan");
    } else if (!hasShownNotFoundRef.current) {
      hasShownNotFoundRef.current = true;
      push({ title: "Case not found", description: "The case may have been removed or the link is invalid." });
    }
  }, [focusCaseId, cases, casesLoading, animals, push]);

  useEffect(() => {
    if (!focusScanId) return;
    const scan = apiScanRecordsRaw.find((r) => r.id === focusScanId || String(r.id).startsWith(focusScanId));
    if (scan) {
      setSelectedScanRecord(scan);
      setScanRecordDetailsOpen(true);
      setRecordDetailsOpen(false);
      setFocusedRecordId(scan.id);
      setTimelineTab("scan");
      if (scan.animal_id && animals.length > 0) {
        const a = animals.find((x) => String(x.id) === scan.animal_id);
        if (a) setSelectedAnimal(a);
      }
    } else {
      push({ title: "Scan not found", description: "The scan may not be saved yet or the link is invalid." });
    }
  }, [focusScanId, apiScanRecordsRaw, animals, push]);

  const handleRecordDetailsClose = useCallback((open: boolean) => {
    setRecordDetailsOpen(open);
    if (!open) setFocusedRecordId(null);
  }, []);

  const handleScanRecordDetailsClose = useCallback((open: boolean) => {
    setScanRecordDetailsOpen(open);
    if (!open) {
      setSelectedScanRecord(null);
      setFocusedRecordId(null);
    }
  }, []);

  const animalTimeline = useMemo(
    () =>
      mergedTimeline.filter(
        (r) => !selectedAnimal || String(r.animalId) === String(selectedAnimal.id),
      ),
    [mergedTimeline, selectedAnimal],
  );

  const filteredTimeline = useMemo(() => {
    if (timelineTab === "all") return animalTimeline;
    if (timelineTab === "vet")
      return animalTimeline.filter((r) => r.type === "vet" || r.type === "note");
    if (timelineTab === "scan")
      return animalTimeline.filter((r) => r.type === "scan");
    return animalTimeline.filter((r) => r.type === timelineTab);
  }, [animalTimeline, timelineTab]);

  useEffect(() => {
    if (focusedRecordId && focusedItemRef.current) {
      focusedItemRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [focusedRecordId, filteredTimeline]);

  const handleCreateAnimal = async (data: Parameters<typeof createAnimal.mutate>[0]) => {
    const created = await createAnimal.mutateAsync(data);
    setSelectedAnimal(animalDtoToRecordsAnimal(created));
  };

  const handleEditSave = (_animal: Animal) => {
    push({ title: "Update", description: "Animal update is not yet supported by the API." });
  };

  const handleEditArchive = (_animal: Animal) => {
    push({ title: "Archive", description: "Archive is not yet supported by the API." });
  };

  const handleEditDelete = (_animal: Animal) => {
    push({ title: "Delete", description: "Delete is not yet supported by the API." });
  };

  const handleViewDetails = (record: TimelineRecord) => {
    setFocusedRecordId(null);
    if (record.type === "scan") {
      const raw = apiScanRecordsRaw.find((r) => String(r.id) === String(record.id));
      if (raw) {
        setSelectedScanRecord(raw);
        setScanRecordDetailsOpen(true);
        setRecordDetailsOpen(false);
      } else {
        setSelectedRecord(record);
        setRecordDetailsOpen(true);
        setScanRecordDetailsOpen(false);
      }
    } else {
      setSelectedRecord(record);
      setRecordDetailsOpen(true);
      setScanRecordDetailsOpen(false);
    }
  };

  const handleViewScanDetails = (scan: ScanRecordDto) => {
    setSelectedScanRecord(scan);
    setScanRecordDetailsOpen(true);
  };

  const handleStartScan = () => {
    if (selectedAnimal) {
      navigate(`/records/scan?animalId=${selectedAnimal.id}`);
    } else {
      navigate("/records/scan");
    }
  };

  const handleBookVet = () => {
    const params = new URLSearchParams({ new: "1" });
    if (selectedAnimal) params.set("animalId", String(selectedAnimal.id));
    navigate(`/appointments?${params.toString()}`);
  };

  const displayAnimals = animals.filter((a) => a.status !== "Archived");
  const scanCount = animalTimeline.filter((r) => r.type === "scan").length;
  const vetCount = animalTimeline.filter(
    (r) => r.type === "vet" || r.type === "note",
  ).length;
  const treatmentCount = animalTimeline.filter(
    (r) => r.type === "treatment",
  ).length;

  if (animalsLoading) {
    return (
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        <LoadingSkeleton lines={8} />
      </div>
    );
  }

  if (animalsError) {
    return (
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        <Card className="border-destructive/50">
          <CardContent className="p-8 text-center">
            <h2 className="text-lg font-semibold text-destructive mb-2">Failed to load animals</h2>
            <p className="text-sm text-muted-foreground mb-4">
              The server returned an error. Please check your connection and try again.
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        <motion.div
          className="flex items-start justify-between mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <h1 className="text-3xl md:text-4xl mb-2">Health Records</h1>
            <p className="text-muted-foreground">
              Track and manage your animals&apos; health history
            </p>
          </div>
          <Button
            type="button"
            size="lg"
            onClick={() => setAddAnimalOpen(true)}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Animal
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <h2 className="text-lg font-medium mb-4">My Animals</h2>
                <div className="space-y-2">
                  {displayAnimals.map((animal) => (
                    <button
                      key={animal.id}
                      type="button"
                      className={`w-full text-left p-4 rounded-lg transition-all ${
                        selectedAnimal?.id === animal.id
                          ? "bg-primary/10 border-2 border-primary"
                          : "bg-muted hover:bg-muted/80 border-2 border-transparent"
                      }`}
                      onClick={() => setSelectedAnimal(animal)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">
                          {animal.image ?? "🐾"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium">{animal.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {animal.breed ?? animal.species}
                          </p>
                        </div>
                        <ChevronRight
                          className={`h-5 w-5 flex-shrink-0 ${
                            selectedAnimal?.id === animal.id
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {selectedAnimal ? (
              <>
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="text-6xl">
                          {selectedAnimal.image ?? "🐾"}
                        </div>
                        <div>
                          <h2 className="text-2xl font-semibold mb-1">
                            {selectedAnimal.name}
                          </h2>
                          <p className="text-muted-foreground mb-3">
                            {selectedAnimal.breed ?? selectedAnimal.species}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {selectedAnimal.ageOrDob && (
                              <Badge variant="secondary">
                                {selectedAnimal.ageOrDob}
                              </Badge>
                            )}
                            <Badge
                              variant="secondary"
                              className="bg-primary/10 text-primary"
                            >
                              <Heart className="h-3 w-3 mr-1" />
                              {selectedAnimal.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditAnimalOpen(true)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                      <div>
                        <div className="text-2xl font-semibold mb-1">
                          {scanCount}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Scans
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-semibold mb-1">
                          {vetCount}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Vet Visits
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-semibold mb-1">
                          {treatmentCount}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Treatments
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                      <h3 className="text-xl font-semibold">Health Timeline</h3>
                      <AddRecordMenu
                        animal={selectedAnimal}
                        onAdded={() => {}}
                      />
                    </div>

                    <Tabs
                      value={timelineTab}
                      onValueChange={(v) => setTimelineTab(v as TimelineTab)}
                    >
                      <TabsList className="mb-4">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="scan">Scans</TabsTrigger>
                        <TabsTrigger value="vet">Vet Visits</TabsTrigger>
                        <TabsTrigger value="treatment">Treatments</TabsTrigger>
                        <TabsTrigger value="order">Orders</TabsTrigger>
                      </TabsList>

                      {(["all", "scan", "vet", "treatment", "order"] as const).map(
                        (tab) => (
                          <TabsContent
                            key={tab}
                            value={tab}
                            className="mt-0"
                          >
                            {filteredTimeline.length === 0 ? (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                              <Heart className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium mb-2">
                              No records yet for {selectedAnimal.name}
                            </h3>
                            <p className="text-muted-foreground mb-6">
                              Start tracking {selectedAnimal.name}&apos;s
                              health by performing your first scan or booking a
                              vet visit
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                              <Button
                                type="button"
                                onClick={handleStartScan}
                              >
                                <Scan className="h-4 w-4 mr-2" />
                                Start Scan
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleBookVet}
                              >
                                <Calendar className="h-4 w-4 mr-2" />
                                Book Vet
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {filteredTimeline.map((item, index) => {
                              const Icon = getRecordIcon(item.type);
                              const color = getRecordColor(item.type);
                              const isFocused = focusedRecordId != null && String(item.id) === String(focusedRecordId);
                              return (
                                <div
                                  key={item.id}
                                  ref={isFocused ? focusedItemRef : undefined}
                                  className={`relative transition-all ${isFocused ? "ring-2 ring-primary rounded-lg -m-1 p-1" : ""}`}
                                >
                                  {index !== filteredTimeline.length - 1 && (
                                    <div className="absolute left-5 top-12 bottom-0 w-px bg-border" />
                                  )}
                                  <div className="flex gap-4">
                                    <div
                                      className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0 relative z-10 ${color}`}
                                    >
                                      <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 pb-6">
                                      <div className="flex items-start justify-between mb-2">
                                        <div>
                                          <h4 className="font-medium">
                                            {item.title}
                                          </h4>
                                          <p className="text-sm text-muted-foreground">
                                            {item.description}
                                          </p>
                                        </div>
                                        <span className="text-sm text-muted-foreground whitespace-nowrap ml-4">
                                          {formatTimelineDate(item.date)}
                                        </span>
                                      </div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="mt-2"
                                        onClick={() => handleViewDetails(item)}
                                      >
                                        View Details
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                          </TabsContent>
                        ),
                      )}
                    </Tabs>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Scans / AI Cases</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Your AI health scans from the backend. Select an animal to see its full timeline.
                  </p>
                  {apiScanRecordsRaw.length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Scan className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No scans yet</h3>
                      <p className="text-muted-foreground mb-6">
                        Run an AI Health Scan to see results here.
                      </p>
                      <Button type="button" onClick={handleStartScan}>
                        <Scan className="h-4 w-4 mr-2" />
                        Start Scan
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {apiScanRecordsRaw.map((r) => {
                        const animalName = r.animal_id
                          ? animals.find((a) => String(a.id) === r.animal_id)?.name
                          : null;
                        const label =
                          r.fmd_label && r.fmd_confidence != null
                            ? `${r.fmd_label} (${(r.fmd_confidence * 100).toFixed(0)}%)`
                            : `NOT_CATTLE (${(r.cattle_prob * 100).toFixed(1)}%)`;
                        const isFocused = focusedRecordId != null && String(r.id) === String(focusedRecordId);
                        return (
                          <div
                            key={r.id}
                            ref={isFocused ? focusedItemRef : undefined}
                            className={`rounded-lg border p-4 transition-all ${
                              isFocused ? "ring-2 ring-primary" : "hover:bg-muted/40"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0 flex-1">
                                <h4 className="font-medium">{label}</h4>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                  {formatTimelineDate(r.created_at)}
                                  {animalName && ` · ${animalName}`}
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewScanDetails(r)}
                              >
                                View Details
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="mt-6 pt-6 border-t">
                    <Button type="button" variant="outline" onClick={() => setAddAnimalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Animal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <AddAnimalSheet
        open={addAnimalOpen}
        onOpenChange={setAddAnimalOpen}
        onCreate={handleCreateAnimal}
        isPending={createAnimal.isPending}
      />
      <EditAnimalSheet
        open={editAnimalOpen}
        onOpenChange={setEditAnimalOpen}
        animal={selectedAnimal}
        onSave={handleEditSave}
        onArchive={handleEditArchive}
        onDelete={handleEditDelete}
      />
      <RecordDetailsSheet
        open={recordDetailsOpen}
        onOpenChange={handleRecordDetailsClose}
        record={selectedRecord}
        selectedAnimalId={selectedAnimal?.id ?? null}
      />
      <ScanRecordDetailsSheet
        open={scanRecordDetailsOpen}
        onOpenChange={handleScanRecordDetailsClose}
        record={selectedScanRecord}
        animalName={
          selectedScanRecord?.animal_id
            ? animals.find((a) => String(a.id) === selectedScanRecord.animal_id)?.name
            : null
        }
        onStartScan={() => {
          setScanRecordDetailsOpen(false);
          handleStartScan();
        }}
        onBookVet={() => {
          setScanRecordDetailsOpen(false);
          handleBookVet();
        }}
      />
    </div>
  );
}
