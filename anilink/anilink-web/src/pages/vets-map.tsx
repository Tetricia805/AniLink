import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BackHeader } from "@/components/layout/BackHeader";
import { MapPin, Map, Stethoscope, ExternalLink } from "lucide-react";
import { useVetsList } from "@/hooks/useVets";
import { useBookingStore } from "@/store/bookingStore";
import type { Vet } from "@/types/vets";

function directionsUrl(v: Vet): string {
  if (v.lat != null && v.lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${v.lat},${v.lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.address ?? "")}`;
}

export function VetsMapPage() {
  const [searchParams] = useSearchParams();
  const focusId = searchParams.get("focus");
  const [selectedId, setSelectedId] = useState<string | null>(focusId ?? null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);

  const openWithPrefill = useBookingStore((s) => s.openWithPrefill);
  const { data: vets = [] } = useVetsList();

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setLocationLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocationError(null);
        setLocationLoading(false);
      },
      () => {
        setLocationError("Location access denied or unavailable.");
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  useEffect(() => {
    if (focusId) setSelectedId(focusId);
  }, [focusId]);

  const selected = selectedId ? vets.find((v) => String(v.id) === selectedId) ?? null : null;
  const defaultCenter = { lat: 0.3476, lng: 32.5825 };
  const mapCenter =
    userLocation ??
    (selected && selected.lat != null && selected.lng != null
      ? { lat: selected.lat, lng: selected.lng }
      : defaultCenter);
  const mapUrl = `https://www.google.com/maps?q=${mapCenter.lat},${mapCenter.lng}&z=12&output=embed`;

  const handleBook = (v: Vet) => {
    openWithPrefill({ vetId: v.id, vetName: v.vet, clinicName: v.clinic });
  };

  const handleDirections = (v: Vet) => {
    window.open(directionsUrl(v), "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
        <BackHeader
          title="Map View"
          subtitle="Find vets near you. Tap a vet for details and directions."
        />

        {locationLoading && (
          <Card className="mb-6 rounded-xl border-border">
            <CardContent className="py-6 text-center text-muted-foreground">
              Getting your location…
            </CardContent>
          </Card>
        )}

        {locationError && !locationLoading && (
          <Card className="mb-6 rounded-xl border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/50">
            <CardContent className="py-6">
              <p className="text-sm text-icon-amber mb-2">
                {locationError}
              </p>
              <p className="text-xs text-muted-foreground">
                You can still browse vets and open directions in Google Maps.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden border border-border bg-muted aspect-[4/3] min-h-[280px]">
              <iframe
                title="Map"
                src={mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full min-h-[280px]"
              />
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Map className="h-3 w-3" />
              Map preview. Use &quot;Get directions&quot; to open in Google Maps.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-semibold text-lg">Veterinarians</h2>
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {vets.map((v) => (
                <Card
                  key={String(v.id)}
                  className={`transition-all rounded-xl border border-border ${
                    selectedId === String(v.id)
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/30"
                  }`}
                >
                  <CardContent className="p-4">
                    <button
                      type="button"
                      onClick={() => setSelectedId(String(v.id))}
                      className="w-full text-left rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      aria-pressed={selectedId === String(v.id)}
                      aria-label={`Select ${v.clinic}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{v.clinic}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {v.vet}
                          </p>
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{v.distance} · {v.address ?? ""}</span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                          {v.availability}
                        </Badge>
                      </div>
                    </button>
                    {selectedId === String(v.id) && (
                      <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-2">
                        <Button type="button" size="sm" asChild>
                          <Link to={`/vets/${v.id}`}>View details</Link>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleBook(v)}
                        >
                          <Stethoscope className="h-3 w-3 mr-1" />
                          Book
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDirections(v)}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Directions
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
