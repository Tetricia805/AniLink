import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Clock, Phone, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Vet } from "@/types/vets";
import { useBookingStore } from "@/store/bookingStore";
export interface VetCardProps {
  vet: Vet;
  /** When opening Book sheet from records with animalId */
  animalId?: number | string;
}

export function VetCard({ vet, animalId }: VetCardProps) {
  const openWithPrefill = useBookingStore((s) => s.openWithPrefill);

  const handleBook = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openWithPrefill({
      vetId: vet.id,
      vetName: vet.vet,
      clinicName: vet.clinic,
      ...(animalId != null && { animalId }),
    });
  };

  return (
    <Card
      className={cn(
        "group transition-all duration-200",
        "hover:-translate-y-1 hover:shadow-card hover:border-primary/30",
        "rounded-2xl",
      )}
    >
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <Link
            to={`/vets/${vet.id}`}
            className="flex-1 min-w-0 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-medium mb-1 group-hover:text-icon-primary transition-colors">
                  {vet.clinic}
                </h3>
                <p className="text-muted-foreground">{vet.vet}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-icon-amber text-icon-amber" />
                <span className="font-medium">{vet.rating}</span>
                <span className="text-sm text-muted-foreground">
                  ({vet.reviews} reviews)
                </span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{vet.distance} away</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {vet.specialties.map((s, i) => (
                <Badge key={i} variant="secondary">
                  {s}
                </Badge>
              ))}
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{vet.hours}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{vet.phone}</span>
              </div>
            </div>

            <div className="mt-4">
              <Badge
                variant={vet.availability.includes("Now") ? "default" : "secondary"}
                className={vet.availability.includes("Now") ? "bg-primary" : ""}
              >
                {vet.availability}
              </Badge>
            </div>
          </Link>

          <div
            className="flex flex-col gap-2 md:w-40 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <Button type="button" className="w-full" onClick={handleBook}>
              Book Appointment
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link to={`/vets/${vet.id}`}>
                <Map className="h-4 w-4 mr-2" />
                View Details
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
