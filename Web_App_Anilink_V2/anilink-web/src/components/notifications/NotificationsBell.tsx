import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { useNotifications, useUnreadCount } from "@/hooks/useNotifications";
import { useAuthStore } from "@/store/authStore";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { cn } from "@/lib/utils";

/**
 * Notifications bell + badge for the authenticated header.
 * Renders for all roles (owner, vet, seller, admin).
 */
export function NotificationsBell() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [open, setOpen] = useState(false);

  const { data: notifications = [], isLoading } = useNotifications(isAuthenticated);
  const unreadCount = useUnreadCount(isAuthenticated);

  if (!isAuthenticated) return null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9"
          aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span
              className={cn(
                "absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-medium",
                "bg-destructive text-destructive-foreground",
              )}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <NotificationsDropdown
        notifications={notifications}
        isLoading={isLoading}
        onOpenChange={setOpen}
      />
    </DropdownMenu>
  );
}
