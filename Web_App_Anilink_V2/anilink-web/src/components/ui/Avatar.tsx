import { useTheme } from "@/hooks/use-theme";
import { getInitialsFromFullName } from "@/lib/userUtils";

interface AvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

/** In dark mode, cycle avatar color by name: green → blue → yellow */
const DARK_AVATAR_COLORS = [
  "bg-icon-primary-subtle text-icon-primary",
  "bg-icon-secondary-subtle text-icon-secondary",
  "bg-icon-amber-subtle text-icon-amber",
] as const;

function getDarkAvatarColorIndex(name: string): number {
  const sum = (name || "A")
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return Math.abs(sum) % DARK_AVATAR_COLORS.length;
}

export function Avatar({ name, imageUrl, size = "md" }: AvatarProps) {
  const { theme } = useTheme();
  const initials = getInitialsFromFullName(name) || "A";

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`rounded-full object-cover ${sizeClasses[size]}`}
      />
    );
  }

  const isDark = theme === "dark";
  const colorClass = isDark
    ? DARK_AVATAR_COLORS[getDarkAvatarColorIndex(name)]
    : "bg-primary/20 text-primary";

  return (
    <div
      className={`flex items-center justify-center rounded-full font-medium ${sizeClasses[size]} ${colorClass}`}
    >
      {initials || "A"}
    </div>
  );
}
