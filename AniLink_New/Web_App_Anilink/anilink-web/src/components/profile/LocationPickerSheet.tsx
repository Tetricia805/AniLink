import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/Sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { MapPin, Navigation } from "lucide-react";
import { useJsApiLoader, GoogleMap, Marker } from "@react-google-maps/api";
import { env } from "@/config/env";

const DEFAULT_CENTER = { lat: 0.3476, lng: 32.5825 };
const MAP_CONTAINER_STYLE = { width: "100%", height: "320px" };

export interface LocationValue {
  lat?: number | null;
  lng?: number | null;
  label?: string | null;
}

export interface LocationPickerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: LocationValue;
  onChange: (value: LocationValue) => void;
}

function MapPicker({
  center,
  onPick,
  selectedLat,
  selectedLng,
}: {
  center: { lat: number; lng: number };
  onPick: (lat: number, lng: number) => void;
  selectedLat?: number | null;
  selectedLng?: number | null;
}) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: env.googleMapsApiKey || "",
  });

  if (loadError || !env.googleMapsApiKey) {
    return (
      <div className="rounded-lg border bg-muted/50 p-4 text-center text-sm text-muted-foreground">
        Map requires Google Maps API key. Use &quot;Use current location&quot;
        instead.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-[320px] items-center justify-center rounded-lg border bg-muted/30">
        <span className="text-sm text-muted-foreground">Loading map…</span>
      </div>
    );
  }

  const position =
    selectedLat != null && selectedLng != null
      ? { lat: selectedLat, lng: selectedLng }
      : undefined;

  return (
    <div className="rounded-lg overflow-hidden border">
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={position ?? center}
        zoom={position ? 15 : 12}
        onClick={(e) => {
          const lat = e.latLng?.lat();
          const lng = e.latLng?.lng();
          if (lat != null && lng != null) onPick(lat, lng);
        }}
      >
        {position && <Marker position={position} />}
      </GoogleMap>
    </div>
  );
}

export function LocationPickerSheet({
  open,
  onOpenChange,
  value,
  onChange,
}: LocationPickerSheetProps) {
  const [label, setLabel] = useState("");
  const [pickedLat, setPickedLat] = useState<number | null>(null);
  const [pickedLng, setPickedLng] = useState<number | null>(null);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const hasSelection =
    (pickedLat != null && pickedLng != null) ||
    (value.lat != null && value.lng != null);
  const displayLat = pickedLat ?? value.lat ?? null;
  const displayLng = pickedLng ?? value.lng ?? null;

  useEffect(() => {
    if (!open) return;
    setLabel(value.label ?? "");
    setPickedLat(value.lat ?? null);
    setPickedLng(value.lng ?? null);
    setGpsError(null);
  }, [open, value.lat, value.lng, value.label]);

  const handleUseCurrentLocation = () => {
    setGpsLoading(true);
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      setGpsLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPickedLat(pos.coords.latitude);
        setPickedLng(pos.coords.longitude);
        setGpsLoading(false);
      },
      () => {
        setGpsError("Could not get your location. Please check permissions.");
        setGpsLoading(false);
      }
    );
  };

  const handleMapPick = (lat: number, lng: number) => {
    setPickedLat(lat);
    setPickedLng(lng);
  };

  const handleConfirmMap = () => {
    if (pickedLat != null && pickedLng != null) {
      setMapModalOpen(false);
    }
  };

  const handleApply = () => {
    if (displayLat != null && displayLng != null) {
      onChange({
        lat: displayLat,
        lng: displayLng,
        label: label.trim() || undefined,
      });
      onOpenChange(false);
    }
  };

  const mapCenter =
    displayLat != null && displayLng != null
      ? { lat: displayLat, lng: displayLng }
      : DEFAULT_CENTER;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full max-w-md overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Set clinic location
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-4 pb-6">
            <p className="text-sm text-muted-foreground">
              Set your clinic location using the map or GPS. Coordinates cannot
              be typed manually.
            </p>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMapModalOpen(true)}
                className="gap-2"
              >
                <MapPin className="h-4 w-4" />
                Pick on map
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUseCurrentLocation}
                disabled={gpsLoading}
                className="gap-2"
              >
                <Navigation className="h-4 w-4" />
                {gpsLoading ? "Getting location…" : "Use current location"}
              </Button>
            </div>

            {gpsError && (
              <p className="text-sm text-destructive">{gpsError}</p>
            )}

            {hasSelection && (
              <>
                <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                  <p className="font-medium text-foreground">Selected coordinates</p>
                  <p className="text-muted-foreground font-mono text-xs mt-1">
                    {displayLat?.toFixed(6)}, {displayLng?.toFixed(6)}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location-label">
                    Location label (e.g. Kampala, Kololo)
                  </Label>
                  <Input
                    id="location-label"
                    placeholder="Area or district for map display"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleApply}
                disabled={!hasSelection}
              >
                Apply
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={mapModalOpen} onOpenChange={setMapModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pick location on map</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Click on the map to set your clinic location.
          </p>
          <MapPicker
            center={mapCenter}
            onPick={handleMapPick}
            selectedLat={pickedLat}
            selectedLng={pickedLng}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setMapModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmMap}
              disabled={pickedLat == null || pickedLng == null}
            >
              Confirm location
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
