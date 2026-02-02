import { useTheme } from "@/hooks/use-theme";
import { getInitialsFromFullName } from "@/lib/userUtils";

export type UserAvatarSize = "sm" | "md" | "lg";

const sizeClasses: Record<UserAvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

const DARK_AVATAR_COLORS = [
  "bg-icon-primary-subtle text-icon-primary",
  "bg-icon-secondary-subtle text-icon-secondary",
  "bg-icon-amber-subtle text-icon-amber",
] as const;

function getDarkAvatarColorIndex(fullName: string): number {
  const sum = (fullName || "A")
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return Math.abs(sum) % DARK_AVATAR_COLORS.length;
}

export interface UserAvatarProps {
  /** Full name for initials fallback (parsed: first 2 words → 2 letters, 1 word → first 2 letters). */
  fullName: string;
  /** Profile image URL; if missing, initials are shown. */
  photoUrl?: string | null;
  size?: UserAvatarSize;
  onClick?: () => void;
  /** Optional aria-label for the button wrapper when onClick is provided. */
  "aria-label"?: string;
  className?: string;
}

/**
 * Shared avatar for all roles: image or initials from full name.
 * Use in navbar and profile; consistent across owner, vet, seller, admin.
 */
export function UserAvatar({
  fullName,
  photoUrl,
  size = "md",
  onClick,
  "aria-label": ariaLabel,
  className = "",
}: UserAvatarProps) {
  const { theme } = useTheme();
  const initials = getInitialsFromFullName(fullName) || "U";

  const content = photoUrl ? (
    <img
      src={photoUrl}
      alt={fullName || "Profile"}
      className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
    />
  ) : (
    <div
      className={`flex items-center justify-center rounded-full font-medium ${sizeClasses[size]} ${
        theme === "dark"
          ? DARK_AVATAR_COLORS[getDarkAvatarColorIndex(fullName || "A")]
          : "bg-primary/20 text-primary"
      } ${className}`}
    >
      {initials}
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={ariaLabel ?? "Profile menu"}
      >
        {content}
      </button>
    );
  }

  return content;
}
