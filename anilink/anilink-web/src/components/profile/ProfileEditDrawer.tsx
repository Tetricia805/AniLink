import { useEffect, useState, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/Sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthStore } from "@/store/authStore";
import { useUpdateMe, useUploadAvatar } from "@/hooks/useProfile";
import {
  useVetProfile,
  useUpdateVetProfile,
  useVetAvailability,
  useUpdateVetAvailability,
} from "@/hooks/useVetProfile";
import {
  useSellerProfile,
  useUpdateSellerProfile,
} from "@/hooks/useSellerProfile";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Building2, Calendar, MapPin, Store } from "lucide-react";
import {
  LocationPickerSheet,
  type LocationValue,
} from "./LocationPickerSheet";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const DEFAULT_SLOT = { start: "08:00", end: "17:00" };

function buildWeeklySchedule(daysOn: Record<string, boolean>) {
  const schedule: Record<string, { start: string; end: string }[]> = {};
  DAYS.forEach((day, i) => {
    const key = DAY_KEYS[i];
    schedule[key] = daysOn[day] ? [DEFAULT_SLOT] : [];
  });
  return schedule;
}

function daysOnFromSchedule(
  weeklySchedule?: Record<string, { start: string; end: string }[]>
) {
  const out: Record<string, boolean> = {};
  DAYS.forEach((day, i) => {
    const key = DAY_KEYS[i];
    const slots = weeklySchedule?.[key];
    out[day] = Array.isArray(slots) && slots.length > 0;
  });
  return out;
}

export interface ProfileEditDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: "owner" | "vet" | "seller" | "admin";
}

export function ProfileEditDrawer({
  open,
  onOpenChange,
  role = "owner",
}: ProfileEditDrawerProps) {
  const user = useAuthStore((s) => s.user);
  const { push } = useToast();
  const queryClient = useQueryClient();

  const isVet = role === "vet";
  const isSeller = role === "seller";

  const { data: vetProfile, isLoading: vetLoading } = useVetProfile(
    open && isVet && !!user
  );
  const { data: availability, isLoading: availLoading } = useVetAvailability(
    open && isVet && !!user
  );
  const { data: sellerProfile, isLoading: sellerLoading } = useSellerProfile(
    open && isSeller && !!user
  );

  const updateMe = useUpdateMe();
  const uploadAvatar = useUploadAvatar();
  const updateVet = useUpdateVetProfile();
  const updateAvailability = useUpdateVetAvailability();
  const updateSeller = useUpdateSellerProfile();

  // Universal
  const [fullName, setFullName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Seller-only
  const [storeName, setStoreName] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  // Vet-only
  const [clinicName, setClinicName] = useState("");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [locationLat, setLocationLat] = useState<number | null>(null);
  const [locationLng, setLocationLng] = useState<number | null>(null);
  const [daysOn, setDaysOn] = useState<Record<string, boolean>>(
    Object.fromEntries(DAYS.map((d) => [d, d !== "Sun"]))
  );
  const [farmVisits, setFarmVisits] = useState(false);
  const [emergency24_7, setEmergency24_7] = useState(false);

  const [locationPickerOpen, setLocationPickerOpen] = useState(false);

  // Reset form when drawer opens
  useEffect(() => {
    if (!open || !user) return;
    setFullName(user.name ?? "");
    setPhone(user.phone ?? "");
    setPhotoFile(null);
  }, [open, user?.name, user?.phone]);

  useEffect(() => {
    if (!isVet || !vetProfile) return;
    setClinicName(vetProfile.clinicName ?? "");
    setDistrict(vetProfile.district ?? "");
    setAddress(vetProfile.address ?? "");
    setLocationLabel(vetProfile.locationLabel ?? "");
    setLocationLat(vetProfile.latitude ?? null);
    setLocationLng(vetProfile.longitude ?? null);
    setPhone(vetProfile.phone ?? user?.phone ?? "");
  }, [isVet, vetProfile, user?.phone]);

  useEffect(() => {
    if (!isVet || !availability) return;
    setFarmVisits(availability.acceptFarmVisits ?? false);
    setEmergency24_7(availability.isEmergency247 ?? false);
    setDaysOn(daysOnFromSchedule(availability.weeklySchedule));
  }, [isVet, availability]);

  useEffect(() => {
    if (!isSeller || !sellerProfile) return;
    setStoreName(sellerProfile.storeName ?? "");
    setContactEmail(sellerProfile.contactEmail ?? "");
  }, [isSeller, sellerProfile]);

  const isDirty = useCallback(() => {
    const nameChanged = fullName.trim() !== (user?.name ?? "").trim();
    const phoneChanged = phone !== (user?.phone ?? null);
    const photoChanged = !!photoFile;
    if (nameChanged || phoneChanged || photoChanged) return true;

    if (isVet && vetProfile) {
      if (clinicName !== (vetProfile.clinicName ?? "")) return true;
      if (district !== (vetProfile.district ?? "")) return true;
      if (address !== (vetProfile.address ?? "")) return true;
      if (locationLabel !== (vetProfile.locationLabel ?? "")) return true;
      if (locationLat !== (vetProfile.latitude ?? null)) return true;
      if (locationLng !== (vetProfile.longitude ?? null)) return true;
      if (farmVisits !== (availability?.acceptFarmVisits ?? false)) return true;
      if (emergency24_7 !== (availability?.isEmergency247 ?? false)) return true;
      const prevDays = daysOnFromSchedule(availability?.weeklySchedule);
      if (DAYS.some((d) => (daysOn[d] ?? false) !== (prevDays[d] ?? false)))
        return true;
    }
    if (isSeller && sellerProfile) {
      if (storeName !== (sellerProfile.storeName ?? "")) return true;
      if (contactEmail !== (sellerProfile.contactEmail ?? "")) return true;
    }
    return false;
  }, [
    fullName,
    phone,
    photoFile,
    user?.name,
    user?.phone,
    isVet,
    vetProfile,
    availability,
    clinicName,
    district,
    address,
    locationLabel,
    locationLat,
    locationLng,
    farmVisits,
    emergency24_7,
    daysOn,
    isSeller,
    sellerProfile,
    storeName,
    contactEmail,
  ]);

  const handleLocationChange = (val: LocationValue) => {
    setLocationLat(val.lat ?? null);
    setLocationLng(val.lng ?? null);
    if (val.label != null) setLocationLabel(val.label);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dirty = isDirty();
    if (!dirty) {
      onOpenChange(false);
      return;
    }
    try {
      if (photoFile) {
        await uploadAvatar.mutateAsync(photoFile);
      }
      await updateMe.mutateAsync({
        fullName: fullName.trim() || undefined,
        phone: phone.trim() || null,
      });

      if (isVet) {
        await updateVet.mutateAsync({
          clinicName: clinicName.trim() || undefined,
          district: district.trim() || undefined,
          address: address.trim() || undefined,
          locationLabel: locationLabel.trim() || undefined,
          latitude: locationLat ?? undefined,
          longitude: locationLng ?? undefined,
        });
        await updateAvailability.mutateAsync({
          acceptFarmVisits: farmVisits,
          isEmergency247: emergency24_7,
          weeklySchedule: buildWeeklySchedule(daysOn),
        });
      }
      if (isSeller) {
        await updateSeller.mutateAsync({
          storeName: storeName.trim() || undefined,
          contactEmail: contactEmail.trim() || undefined,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["vets", "me"] });
      queryClient.invalidateQueries({ queryKey: ["vets", "me", "availability"] });
      queryClient.invalidateQueries({ queryKey: ["seller", "profile"] });
      push({ title: "Saved", description: "Your profile has been updated." });
      onOpenChange(false);
    } catch {
      // Toasts handled in hooks
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const email = user?.email ?? "";
  const isPending =
    updateMe.isPending ||
    uploadAvatar.isPending ||
    updateVet.isPending ||
    updateAvailability.isPending ||
    updateSeller.isPending;
  const initializing =
    (isVet && (vetLoading || availLoading)) || (isSeller && sellerLoading);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full max-w-md overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Edit Profile</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-6 pb-6">
            {/* Universal section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Full name</Label>
                <Input
                  id="profile-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-phone">Phone</Label>
                <Input
                  id="profile-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+256 ..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-email">Email</Label>
                <Input
                  id="profile-email"
                  type="email"
                  value={email}
                  readOnly
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed here.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-photo">Profile photo (optional)</Label>
                <Input
                  id="profile-photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                />
                {photoFile && (
                  <p className="text-xs text-muted-foreground">
                    Selected: {photoFile.name}. Will upload when you save.
                  </p>
                )}
              </div>
            </div>

            {/* Seller-only section */}
            {isSeller && (
              <div className="border-t pt-6 space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  Store details
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store name</Label>
                  <Input
                    id="storeName"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Your store or business name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="Store contact email (can differ from login)"
                  />
                </div>
              </div>
            )}

            {/* Vet-only section */}
            {isVet && (
              <>
                <div className="border-t pt-6 space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Clinic details
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="clinicName">Clinic name</Label>
                    <Input
                      id="clinicName"
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      placeholder="Your clinic name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district">District</Label>
                    <Input
                      id="district"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="e.g. Kampala"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Clinic address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="locationLabel">Location label</Label>
                    <Input
                      id="locationLabel"
                      value={locationLabel}
                      onChange={(e) => setLocationLabel(e.target.value)}
                      placeholder="e.g. Kampala, Kololo"
                    />
                  </div>
                  {/* Clinic location: locked when lat/lng set; only change via map or GPS */}
                  <div className="space-y-2">
                    <Label>Clinic location</Label>
                    {locationLat != null && locationLng != null ? (
                      <div className="rounded-lg border bg-muted/20 p-3 space-y-2">
                        <div className="aspect-video w-full max-w-xs rounded overflow-hidden bg-muted">
                          <iframe
                            title="Clinic location"
                            src={`https://www.google.com/maps?q=${locationLat},${locationLng}&z=15&output=embed`}
                            className="w-full h-full border-0"
                            allowFullScreen
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {[district, address, locationLabel].filter(Boolean).join(" · ") ||
                            `${locationLat.toFixed(4)}, ${locationLng.toFixed(4)}`}
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setLocationPickerOpen(true)}
                          className="gap-2"
                        >
                          <MapPin className="h-4 w-4" />
                          Change location
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setLocationPickerOpen(true)}
                          className="gap-2"
                        >
                          <MapPin className="h-4 w-4" />
                          Set location (map or GPS)
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Availability
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {DAYS.map((day) => (
                      <div key={day} className="flex items-center gap-2">
                        <Checkbox
                          id={`day-${day}`}
                          checked={daysOn[day] ?? false}
                          onCheckedChange={(checked) =>
                            setDaysOn((prev) => ({ ...prev, [day]: !!checked }))
                          }
                        />
                        <Label
                          htmlFor={`day-${day}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {day}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="farmVisits"
                        checked={farmVisits}
                        onCheckedChange={(checked) => setFarmVisits(!!checked)}
                      />
                      <Label
                        htmlFor="farmVisits"
                        className="text-sm font-normal cursor-pointer"
                      >
                        Accept farm visits
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="emergency24_7"
                        checked={emergency24_7}
                        onCheckedChange={(checked) =>
                          setEmergency24_7(!!checked)
                        }
                      />
                      <Label
                        htmlFor="emergency24_7"
                        className="text-sm font-normal cursor-pointer"
                      >
                        24/7 emergency
                      </Label>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isDirty() || isPending || initializing}
              >
                {isPending ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <LocationPickerSheet
        open={locationPickerOpen}
        onOpenChange={setLocationPickerOpen}
        value={{
          lat: locationLat,
          lng: locationLng,
          label: locationLabel,
        }}
        onChange={handleLocationChange}
      />
    </>
  );
}
