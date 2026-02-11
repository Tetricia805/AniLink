import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { ProfileEditDrawer } from "@/components/profile/ProfileEditDrawer";
import { useAuthStore } from "@/store/authStore";
import { useAdminSettings, useUpdateAdminSettings } from "@/hooks/useAdmin";
import { Settings } from "lucide-react";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

export function AdminSettingsPage() {
  const user = useAuthStore((s) => s.user);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: settings, isLoading, isError } = useAdminSettings();
  const updateSettings = useUpdateAdminSettings();

  const [platformFeePercent, setPlatformFeePercent] = useState("0");
  const [maxBookingDistanceKm, setMaxBookingDistanceKm] = useState("50");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [defaultCurrency, setDefaultCurrency] = useState("UGX");

  useEffect(() => {
    if (settings) {
      setPlatformFeePercent(String(settings.platform_fee_percent));
      setMaxBookingDistanceKm(String(settings.max_booking_distance_km));
      setNotificationsEnabled(settings.notifications_enabled);
      setDefaultCurrency(settings.default_currency || "UGX");
    }
  }, [settings]);

  const fullName = (user?.name ?? "").trim() || "Admin";
  const email = user?.email ?? "";
  const photoUrl = user?.profileImageUrl ?? user?.avatar_url ?? null;

  const isDirty =
    settings &&
    (parseFloat(platformFeePercent) !== settings.platform_fee_percent ||
      parseFloat(maxBookingDistanceKm) !== settings.max_booking_distance_km ||
      notificationsEnabled !== settings.notifications_enabled ||
      defaultCurrency !== (settings.default_currency || "UGX"));

  const handleSave = () => {
    updateSettings.mutate({
      platform_fee_percent: parseFloat(platformFeePercent) || 0,
      max_booking_distance_km: parseFloat(maxBookingDistanceKm) || 50,
      notifications_enabled: notificationsEnabled,
      default_currency: defaultCurrency,
    });
  };

  if (isLoading && !settings) return <LoadingSkeleton lines={6} />;
  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-2xl">
          <p className="text-destructive">Could not load settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-2xl space-y-6">
        <h1 className="text-2xl md:text-3xl font-semibold mb-2">Admin Settings</h1>
        <p className="text-muted-foreground mb-6">
          Personal profile and platform settings.
        </p>

        <ProfileCard
          fullName={fullName}
          email={email}
          photoUrl={photoUrl}
          roleLabel="Admin"
          action={
            <Button variant="outline" size="sm" onClick={() => setDrawerOpen(true)}>
              Edit profile
            </Button>
          }
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Platform settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="platform_fee">Platform fee (%)</Label>
              <Input
                id="platform_fee"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={platformFeePercent}
                onChange={(e) => setPlatformFeePercent(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="max_distance">Max booking distance (km)</Label>
              <Input
                id="max_distance"
                type="number"
                min="1"
                max="500"
                value={maxBookingDistanceKm}
                onChange={(e) => setMaxBookingDistanceKm(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="default_currency">Default currency</Label>
              <Input
                id="default_currency"
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value)}
                placeholder="UGX"
                className="mt-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="notifications_enabled"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="rounded border"
              />
              <Label htmlFor="notifications_enabled">Notifications enabled</Label>
            </div>
            {isDirty && (
              <Button onClick={handleSave} disabled={updateSettings.isPending}>
                {updateSettings.isPending ? "Saving…" : "Save settings"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <ProfileEditDrawer open={drawerOpen} onOpenChange={setDrawerOpen} role="admin" />
    </div>
  );
}
