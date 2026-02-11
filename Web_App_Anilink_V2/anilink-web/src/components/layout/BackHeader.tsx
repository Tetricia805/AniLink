import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { getRoleHome } from "@/lib/auth";

export interface BackHeaderProps {
  /** Optional page title shown below the Back button */
  title?: string;
  /** Optional subtitle */
  subtitle?: string;
}

/**
 * Back button (← Back) for secondary/detail pages only.
 * - Click: navigate(-1) if there is history; otherwise redirect to role home.
 * - Use on detail pages (e.g. /vets/:id, /orders/:id, /scan/start), not on primary nav pages.
 */
export function BackHeader({ title, subtitle }: BackHeaderProps) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const role = user?.role;

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(getRoleHome(role ?? "OWNER"), { replace: true });
    }
  };

  return (
    <div className="mb-4 space-y-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleBack}
        className="focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Go back"
      >
        <ArrowLeft className="h-4 w-4 mr-1" aria-hidden />
        Back
      </Button>
      {title ? (
        <div className="space-y-0.5">
          <h1 className="text-2xl font-semibold text-foreground md:text-3xl">{title}</h1>
          {subtitle ? (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
