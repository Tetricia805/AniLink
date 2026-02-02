import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScanAnimal } from "@/types/scan";

export interface StepSelectAnimalProps {
  animals: ScanAnimal[];
  selected: ScanAnimal | null;
  onSelect: (animal: ScanAnimal) => void;
}

export function StepSelectAnimal({
  animals,
  selected,
  onSelect,
}: StepSelectAnimalProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select an Animal</CardTitle>
          <CardDescription>
            Choose which animal you want to scan. Click a card to select.
          </CardDescription>
        </CardHeader>
      </Card>

      {animals.length === 0 ? (
        <Card className="rounded-xl border-dashed">
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground mb-4">
              No animals yet. Add an animal in Records first to run a scan.
            </p>
            <Button asChild variant="default">
              <Link to="/records">
                <Plus className="h-4 w-4 mr-2" />
                Add animal
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {animals.map((animal) => {
          const isSelected = selected?.id === animal.id;
          return (
            <button
              key={animal.id}
              type="button"
              onClick={() => onSelect(animal)}
              className={cn(
                "text-left rounded-xl border-2 transition-all outline-none",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "hover:shadow-md hover:border-primary/50",
                isSelected
                  ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
                  : "border-border bg-card hover:bg-muted/30",
              )}
            >
              <div className="p-6 flex items-center gap-4">
                <div className="text-5xl shrink-0">{animal.image}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-medium">{animal.name}</h3>
                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 text-icon-primary shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{animal.type}</p>
                  <Badge variant="secondary">{animal.age}</Badge>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      )}

      {selected && (
        <Card className="rounded-xl border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Selected</CardTitle>
            <CardDescription>Scan will be linked to this animal.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-4">
              <span className="text-3xl">{selected.image}</span>
              <div>
                <p className="font-medium">{selected.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selected.type} · {selected.age}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
