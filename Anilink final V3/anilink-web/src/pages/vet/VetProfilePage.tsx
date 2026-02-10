import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BackHeader } from "@/components/layout/BackHeader";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { ProfileEditDrawer } from "@/components/profile/ProfileEditDrawer";
import { useAuthStore } from "@/store/authStore";
import { Building2, Calendar, MapPin } from "lucide-react";
import { useVetProfile, useVetAvailability } from "@/hooks/useVetProfile";
import { sectionTransition } from "@/lib/motion";

export function VetProfilePage() {
  const user = useAuthStore((s) => s.user);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fullName = (user?.name ?? "").trim() || "Vet";
  const email = user?.email ?? "";
  const photoUrl = user?.profileImageUrl ?? user?.avatar_url ?? null;

  const { data: vetProfile, isLoading: vetLoading } = useVetProfile(!!user);
  const { data: availability, isLoading: availLoading } = useVetAvailability(!!user);

  const daysDisplay =
    availability?.weeklySchedule &&
    Object.entries(availability.weeklySchedule)
      .filter(([, slots]) => Array.isArray(slots) && slots.length > 0)
      .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1))
      .join(", ");

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-3xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <BackHeader
          title="Clinic profile"
          subtitle="View and manage your clinic details, services, and availability."
        />

        <ProfileCard
          fullName={fullName}
          email={email}
          photoUrl={photoUrl}
          roleLabel="Vet"
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDrawerOpen(true)}
            >
              Edit profile
            </Button>
          }
        />
        </motion.div>

        {(vetProfile || vetLoading) && (
          <motion.div {...sectionTransition}>
          <Card className="rounded-2xl border border-border transition-all duration-200 hover:shadow-lg hover:border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Clinic details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {vetLoading ? (
                <p className="text-muted-foreground">Loading…</p>
              ) : (
                <>
                  {vetProfile?.clinicName && (
                    <p>
                      <span className="font-medium text-foreground">Clinic: </span>
                      {vetProfile.clinicName}
                    </p>
                  )}
                  {vetProfile?.district && (
                    <p>
                      <span className="font-medium text-foreground">District: </span>
                      {vetProfile.district}
                    </p>
                  )}
                  {vetProfile?.address && (
                    <p>
                      <span className="font-medium text-foreground">Address: </span>
                      {vetProfile.address}
                    </p>
                  )}
                  {vetProfile?.latitude != null && vetProfile?.longitude != null && (
                    <div className="space-y-2">
                      <p className="flex items-center gap-2 font-medium text-foreground">
                        <MapPin className="h-4 w-4 shrink-0" />
                        Clinic location
                      </p>
                      <div className="aspect-video w-full max-w-md rounded-lg overflow-hidden border bg-muted">
                        <iframe
                          title="Clinic map"
                          src={`https://www.google.com/maps?q=${vetProfile.latitude},${vetProfile.longitude}&z=15&output=embed`}
                          className="w-full h-full border-0"
                          allowFullScreen
                        />
                      </div>
                      <p className="text-muted-foreground">
                        {[vetProfile.district, vetProfile.address, vetProfile.locationLabel]
                          .filter(Boolean)
                          .join(" · ") || "Location set"}
                      </p>
                    </div>
                  )}
                  {vetProfile?.locationLabel && vetProfile?.latitude == null && (
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span>{vetProfile.locationLabel}</span>
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
          </motion.div>
        )}

        {(availability || availLoading) && (
          <motion.div {...sectionTransition}>
          <Card className="rounded-2xl border border-border transition-all duration-200 hover:shadow-lg hover:border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {availLoading ? (
                <p className="text-muted-foreground">Loading…</p>
              ) : (
                <>
                  <p>
                    <span className="font-medium text-foreground">Days: </span>
                    {daysDisplay || "Not set"}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Farm visits: </span>
                    {availability?.acceptFarmVisits ? "Yes" : "No"}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">24/7 emergency: </span>
                    {availability?.isEmergency247 ? "Yes" : "No"}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          </motion.div>
        )}
      </div>

      <ProfileEditDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        role="vet"
      />
    </div>
  );
}
