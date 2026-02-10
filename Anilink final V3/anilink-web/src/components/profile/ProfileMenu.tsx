import { useNavigate } from "react-router-dom";
import { UserAvatar } from "@/components/profile/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/DropdownMenu";
import { Button } from "@/components/ui/button";
import { User, Settings } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
import type { UserRole } from "@/types/auth";

function getProfilePaths(role: UserRole | undefined): { view: string; settings: string } {
  switch (role) {
    case "VET":
      return { view: "/vet/profile", settings: "/vet/profile" };
    case "SELLER":
      return { view: "/seller/profile", settings: "/seller/profile" };
    case "ADMIN":
      return { view: "/admin/settings", settings: "/admin/settings" };
    default:
      return { view: "/profile", settings: "/settings" };
  }
}

export function ProfileMenu() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const profile = useProfileStore();

  const fullName = (user?.name ?? profile.fullName ?? "").trim() || "AniLink user";
  const photoUrl = user?.profileImageUrl ?? user?.avatar_url ?? profile.profilePhotoUrl ?? null;
  const paths = getProfilePaths(user?.role);

  const handleProfile = () => navigate(paths.view);
  const handleSettings = () => navigate(paths.settings);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-12 px-2 rounded-full flex items-center gap-3"
        >
          <UserAvatar fullName={fullName} photoUrl={photoUrl} size="lg" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{fullName}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleProfile} className="cursor-pointer">
          <User className="h-4 w-4 mr-2" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSettings} className="cursor-pointer">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

