import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Map, Bug } from "lucide-react";
import { VetCard } from "@/components/vets/VetCard";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { useVetsList } from "@/hooks/useVets";
import { listVets } from "@/api/vets";
import type { Vet } from "@/types/vets";

type FilterId = "farm-visits" | "24-7" | "livestock" | "poultry" | "pets";

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "farm-visits", label: "Farm Visits" },
  { id: "24-7", label: "24/7" },
  { id: "livestock", label: "Livestock" },
  { id: "poultry", label: "Poultry" },
  { id: "pets", label: "Pets" },
];

function matchesFilter(vet: Vet, filterId: FilterId): boolean {
  switch (filterId) {
    case "farm-visits":
      return vet.farmVisits === true || vet.specialties.some((s) => /farm/i.test(s));
    case "24-7":
      return vet.twentyFourSeven === true || vet.specialties.some((s) => /24\/7/i.test(s));
    case "livestock":
      return vet.services?.includes("Livestock") ?? vet.specialties.some((s) => /livestock/i.test(s));
    case "poultry":
      return vet.services?.includes("Poultry") ?? vet.specialties.some((s) => /poultry/i.test(s));
    case "pets":
      return vet.services?.includes("Pets") ?? vet.specialties.some((s) => /pets/i.test(s));
    default:
      return false;
  }
}

export function VetsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<FilterId[]>([]);
  const [debugOpen, setDebugOpen] = useState(false);
  const [rawResponse, setRawResponse] = useState<string>("");

  const { data: vets = [], isLoading, isError, error } = useVetsList();

  const toggleFilter = (id: FilterId) => {
    setActiveFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  };

  const filteredVets = useMemo(() => {
    let list = vets.filter((vet) => {
      const matchSearch =
        !searchQuery.trim() ||
        vet.clinic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vet.vet.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFilters =
        activeFilters.length === 0 ||
        activeFilters.every((f) => matchesFilter(vet, f));
      return matchSearch && matchFilters;
    });
    return list;
  }, [vets, searchQuery, activeFilters]);

  const loadDebugResponse = async () => {
    try {
      const dtos = await listVets();
      setRawResponse(JSON.stringify(dtos, null, 2));
    } catch (e) {
      setRawResponse(String(e));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl mb-2">Find a Vet</h1>
          <p className="text-muted-foreground">
            Discover and book trusted veterinary services near you
          </p>
        </div>

        {import.meta.env.DEV && (
          <div className="mb-4 flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const willOpen = !debugOpen;
                setDebugOpen(willOpen);
                if (willOpen) loadDebugResponse();
              }}
            >
              <Bug className="h-4 w-4 mr-1" />
              Debug: show raw API response
            </Button>
            {debugOpen && (
              <Button type="button" variant="ghost" size="sm" onClick={loadDebugResponse}>
                Refresh
              </Button>
            )}
          </div>
        )}
        {import.meta.env.DEV && debugOpen && (
          <Card className="mb-6 rounded-xl border-amber-200 dark:border-amber-900">
            <CardContent className="p-4">
              <pre className="text-xs overflow-auto max-h-64 bg-muted p-3 rounded">
                {rawResponse || "Loading…"}
              </pre>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6 rounded-xl">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for vet or clinic..."
                className="pl-10 h-12 rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          {FILTERS.map((f) => (
            <Button
              key={f.id}
              type="button"
              variant={activeFilters.includes(f.id) ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => toggleFilter(f.id)}
            >
              {f.label}
            </Button>
          ))}
          {activeFilters.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-sm"
              onClick={() => setActiveFilters([])}
            >
              Clear all
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {filteredVets.length} {filteredVets.length === 1 ? "vet" : "vets"} found
          </p>
          <Button type="button" variant="outline" size="sm" asChild>
            <Link to="/vets/map">
              <Map className="h-4 w-4 mr-2" />
              Map View
            </Link>
          </Button>
        </div>

        {isError && (
          <Card className="mb-6 rounded-2xl border-destructive/50">
            <CardContent className="p-6 text-center">
              <p className="text-destructive font-medium">Failed to load vets</p>
              <p className="text-sm text-muted-foreground mt-1">
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
              {import.meta.env.DEV && error && (
                <pre className="mt-2 text-left text-xs overflow-auto max-h-32 bg-muted p-2 rounded">
                  {String(error)}
                </pre>
              )}
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="space-y-4">
            <LoadingSkeleton lines={6} />
            <LoadingSkeleton lines={6} />
            <LoadingSkeleton lines={6} />
          </div>
        ) : filteredVets.length === 0 ? (
          <Card className="rounded-2xl">
            <CardContent className="p-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No vets found</h3>
              <p className="text-muted-foreground mb-6">
                {vets.length === 0
                  ? "No vets in the system yet. Try again later or check the backend."
                  : "Try adjusting your search or filters"}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilters([]);
                }}
              >
                Clear filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredVets.map((vet) => (
              <VetCard key={String(vet.id)} vet={vet} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
