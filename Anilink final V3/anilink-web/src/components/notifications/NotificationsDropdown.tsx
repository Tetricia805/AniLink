import { Link } from "react-router-dom";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/DropdownMenu";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck } from "lucide-react";
import type { NotificationDto } from "@/types/notifications";
import { useMarkNotificationRead } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

const PREVIEW_LIMIT = 6;

interface NotificationsDropdownProps {
  notifications: NotificationDto[];
  isLoading: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function NotificationsDropdown({
  notifications,
  isLoading,
  onOpenChange,
}: NotificationsDropdownProps) {
  const markRead = useMarkNotificationRead();
  const preview = notifications.slice(0, PREVIEW_LIMIT);

  const handleMarkRead = (id: string) => {
    markRead.mutate(id);
  };

  return (
    <DropdownMenuContent align="end" className="w-[320px] p-0" onCloseAutoFocus={(e) => e.preventDefault()}>
      <DropdownMenuLabel className="flex items-center gap-2 px-4 py-3">
        <Bell className="h-4 w-4 text-icon-primary" />
        Notifications
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <div className="max-h-[280px] overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 rounded-lg bg-muted/50 animate-pulse" />
            ))}
          </div>
        ) : preview.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground text-center">
            No notifications yet
          </p>
        ) : (
          preview.map((n) => (
            <DropdownMenuItem
              key={n.id}
              className="flex flex-col items-stretch gap-1 py-3 px-4 cursor-default focus:bg-muted/50"
              onSelect={(e) => e.preventDefault()}
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className={cn(
                    "min-w-0 flex-1",
                    !n.isRead && "border-l-2 border-l-[var(--icon-primary)] pl-2 -ml-2",
                  )}
                >
                  <p className="text-sm font-medium truncate">{n.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 h-7 text-xs"
                    onClick={() => handleMarkRead(n.id)}
                    disabled={markRead.isPending}
                  >
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Read
                  </Button>
                )}
              </div>
            </DropdownMenuItem>
          ))
        )}
      </div>
      <DropdownMenuSeparator />
      <div className="p-2">
        <Button variant="ghost" size="sm" className="w-full" asChild onClick={() => onOpenChange?.(false)}>
          <Link to="/notifications">View all</Link>
        </Button>
      </div>
    </DropdownMenuContent>
  );
}
