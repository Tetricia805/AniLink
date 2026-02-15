import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BackHeader } from "@/components/layout/BackHeader";
import {
  MapPin,
  Star,
  Clock,
  Phone,
  Map,
  MessageCircle,
  Stethoscope,
} from "lucide-react";
import { useVet } from "@/hooks/useVets";
import { useBookingStore } from "@/store/bookingStore";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

const WHATSAPP_BASE = "https://wa.me/";

function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, "").replace(/^256/, "256");
}

function directionsUrl(address: string, lat?: number, lng?: number): string {
  if (lat != null && lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export function VetDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { push } = useToast();
  const openWithPrefill = useBookingStore((s) => s.openWithPrefill);

  const { data: vet, isLoading, isError, error } = useVet(id);

  const handleBook = () => {
    if (!vet) return;
    openWithPrefill({
      vetId: vet.id,
      vetName: vet.vet,
      clinicName: vet.clinic,
    });
  };

  const handleViewOnMap = () => {
    if (!vet) return;
    navigate(`/vets/map?focus=${vet.id}`);
  };

  const handleCall = () => {
    if (!vet) return;
    window.location.href = `tel:${vet.phone}`;
  };

  const handleWhatsApp = () => {
    if (!vet) return;
    const num = vet.whatsapp ? cleanPhone(vet.whatsapp) : cleanPhone(vet.phone);
    window.open(`${WHATSAPP_BASE}${num}`, "_blank");
  };

  const handleMessage = () => {
    push({ title: "Message", description: "TODO: open message flow." });
  };

  const handleDirections = () => {
    if (!vet) return;
    const url = directionsUrl(vet.address ?? "", vet.lat, vet.lng);
    window.open(url, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-3xl">
          <BackHeader />
          <LoadingSkeleton lines={12} />
        </div>
      </div>
    );
  }

  if (isError || !vet) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-3xl">
          <BackHeader />
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {isError && error instanceof Error ? error.message : "Vet not found."}
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => navigate("/vets")}
              >
                Browse vets
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const mapUrl =
    vet.lat != null && vet.lng != null
      ? `https://www.google.com/maps?q=${vet.lat},${vet.lng}&z=15&output=embed`
      : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-3xl">
        <BackHeader title={vet.clinic} subtitle={vet.vet} />

        <Card className="mb-6 rounded-2xl border border-border shadow-soft">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-icon-amber text-icon-amber" />
                    <span className="font-medium">{vet.rating}</span>
                    <span className="text-sm text-muted-foreground">
                      ({vet.reviews} reviews)
                    </span>
                  </div>
                  <Badge variant="secondary" className="bg-icon-primary-subtle text-icon-primary">
                    {vet.availability}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {vet.services?.map((s) => (
                    <Badge key={s} variant="secondary">
                      {s}
                    </Badge>
                  ))}
                  {vet.farmVisits && (
                    <Badge variant="secondary">Farm visits</Badge>
                  )}
                  {vet.twentyFourSeven && (
                    <Badge variant="secondary">24/7</Badge>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <Button type="button" onClick={handleBook}>
                  <Stethoscope className="h-4 w-4 mr-2" />
                  Book appointment
                </Button>
                <Button type="button" variant="outline" onClick={handleViewOnMap}>
                  <Map className="h-4 w-4 mr-2" />
                  View on map
                </Button>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-2">Availability</h3>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {vet.hours}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Contact</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCall}
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleWhatsApp}
                  >
                    WhatsApp
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleMessage}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Message
                  </Button>
                </div>
              </div>
            </div>

            {vet.address && (
              <>
                <Separator className="my-6" />
                <div>
                  <h3 className="font-semibold mb-2">Location</h3>
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4" />
                    {vet.address}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleDirections}
                    >
                      Get directions
                    </Button>
                  </div>
                  {mapUrl && (
                    <div className="mt-4 rounded-xl overflow-hidden border border-border bg-muted aspect-video">
                      <iframe
                        title="Map"
                        src={mapUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="w-full h-full min-h-[200px]"
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
