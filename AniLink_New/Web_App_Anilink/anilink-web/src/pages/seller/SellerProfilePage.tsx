import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BackHeader } from "@/components/layout/BackHeader";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { ProfileEditDrawer } from "@/components/profile/ProfileEditDrawer";
import { useAuthStore } from "@/store/authStore";
import { useSellerProfile } from "@/hooks/useSellerProfile";
import { Store } from "lucide-react";

export function SellerProfilePage() {
  const user = useAuthStore((s) => s.user);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fullName = (user?.name ?? "").trim() || "Seller";
  const email = user?.email ?? "";
  const photoUrl = user?.profileImageUrl ?? user?.avatar_url ?? null;

  const { data: sellerProfile, isLoading: profileLoading } = useSellerProfile(
    !!user
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-2xl space-y-6">
        <BackHeader
          title="Seller profile"
          subtitle="View and manage your personal and vendor details."
        />
        <ProfileCard
          fullName={fullName}
          email={email}
          photoUrl={photoUrl}
          roleLabel="Seller"
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
        <Card className="rounded-2xl border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Store details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {profileLoading ? (
              <p className="text-muted-foreground">Loading…</p>
            ) : (
              <>
                {sellerProfile?.storeName && (
                  <p>
                    <span className="font-medium text-foreground">
                      Store name:{" "}
                    </span>
                    {sellerProfile.storeName}
                  </p>
                )}
                {sellerProfile?.contactEmail && (
                  <p>
                    <span className="font-medium text-foreground">
                      Contact email:{" "}
                    </span>
                    {sellerProfile.contactEmail}
                  </p>
                )}
                {!sellerProfile?.storeName && !sellerProfile?.contactEmail && (
                  <p className="text-muted-foreground">
                    No store details yet. Click Edit profile to add them.
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <ProfileEditDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        role="seller"
      />
    </div>
  );
}
