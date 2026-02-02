import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "@/components/profile/UserAvatar";
import { Mail } from "lucide-react";

export interface ProfileCardProps {
  /** Full name (from auth user). */
  fullName: string;
  /** Email (read-only). */
  email: string;
  /** Avatar image URL. */
  photoUrl?: string | null;
  /** Optional: role badge or label. */
  roleLabel?: string;
  /** Optional: extra action in header (e.g. Edit Profile button). */
  action?: ReactNode;
  /** Role-specific sections (clinic, store, farm, availability). */
  children?: ReactNode;
}

/**
 * Universal profile shell: avatar, name, email, optional action.
 * Use on /profile, /vet/profile, /seller/profile with role-specific children.
 */
export function ProfileCard({
  fullName,
  email,
  photoUrl,
  roleLabel,
  action,
  children,
}: ProfileCardProps) {
  return (
    <Card className="rounded-2xl border border-border shadow-soft">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <UserAvatar fullName={fullName} photoUrl={photoUrl} size="lg" />
            <div>
              <h2 className="text-xl font-semibold">{fullName}</h2>
              {roleLabel && (
                <span className="inline-block mt-1 text-sm text-muted-foreground">{roleLabel}</span>
              )}
              {email && (
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span>{email}</span>
                </div>
              )}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
        {children ? <div className="mt-6 pt-6 border-t border-border">{children}</div> : null}
      </CardContent>
    </Card>
  );
}
