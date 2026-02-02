import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/profile/UserAvatar";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
import { useState } from "react";
import { EditProfileSheet } from "@/components/profile/EditProfileSheet";
import { MapPin, Phone, Mail, HeartPulse } from "lucide-react";

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const profile = useProfileStore();
  const [sheetOpen, setSheetOpen] = useState(false);

  const fullName = (user?.name ?? profile.fullName ?? "").trim() || "AniLink user";
  const role = user?.role ?? "OWNER";
  const email = profile.email || user?.email || "";
  const phone = profile.phone || user?.phone || "";
  const location = profile.location || "Add your location";
  const farmName = profile.farmName || "Add farm name";
  const animals =
    profile.preferredAnimals.length > 0
      ? profile.preferredAnimals.join(", ")
      : "Not set";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl space-y-6">
        <Card className="rounded-2xl">
          <CardContent className="p-6 flex flex-col md:flex-row md:items-center gap-6 justify-between">
            <div className="flex items-center gap-4">
              <UserAvatar
                fullName={fullName}
                photoUrl={profile.profilePhotoUrl ?? user?.profileImageUrl}
                size="lg"
              />
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold mb-1">
                  {fullName}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="secondary">{role}</Badge>
                  <Badge variant="secondary" className="bg-icon-primary-subtle text-icon-primary">
                    <HeartPulse className="h-3 w-3 mr-1" />
                    AniLink Owner
                  </Badge>
                </div>
                <div className="flex flex-col text-sm text-muted-foreground gap-1">
                  {email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{email}</span>
                    </div>
                  )}
                  {phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{location}</span>
                  </div>
                </div>
              </div>
            </div>
            <Button type="button" variant="outline" onClick={() => setSheetOpen(true)}>
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Personal info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Full name: </span>
                {fullName}
              </p>
              <p>
                <span className="font-medium text-foreground">Email: </span>
                {email || "Not set"}
              </p>
              <p>
                <span className="font-medium text-foreground">Phone: </span>
                {phone || "Not set"}
              </p>
              <p>
                <span className="font-medium text-foreground">Location: </span>
                {location}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Farm info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Farm name: </span>
                {farmName}
              </p>
              <p>
                <span className="font-medium text-foreground">
                  Preferred animals:{" "}
                </span>
                {animals}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <EditProfileSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}

