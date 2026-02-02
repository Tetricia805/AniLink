import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Bell, CheckCheck } from "lucide-react";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks/useNotifications";
import { useAuthStore } from "@/store/authStore";
import type { NotificationDto } from "@/types/notifications";
import { Skeleton } from "@/components/ui/Skeleton";

function getNotificationHref(n: NotificationDto, userRole?: string): string | undefined {
  // Use actionUrl if provided by backend
  if (n.actionUrl) return n.actionUrl;

  // Fallback: derive from entityType + role
  const entityType = n.entityType?.toLowerCase();
  const entityId = n.entityId || n.relatedId;

  if (!entityType || !entityId) return undefined;

  const role = userRole?.toUpperCase();

  switch (entityType) {
    case "booking":
      if (role === "VET") {
        return `/vet/appointments?status=requested&focus=${entityId}`;
      }
      return `/appointments?status=upcoming&focus=${entityId}`;
    
    case "order":
      if (role === "SELLER") {
        return `/seller/orders?focus=${entityId}`;
      }
      return `/orders/${entityId}`;
    
    case "case":
      if (role === "VET") {
        return `/vet/cases?focus=${entityId}`;
      }
      return `/records?focusCase=${entityId}`;
    
    case "product":
      if (role === "SELLER") {
        return `/seller/products?focus=${entityId}`;
      }
      return `/marketplace/${entityId}`;
    
    case "system":
      // System notifications may have actionUrl embedded
      return undefined;
    
    default:
      return undefined;
  }
}

function NotificationCard({
  notification,
  markAsRead,
  getHref,
  onNavigate,
}: {
  notification: NotificationDto
  markAsRead: { mutate: (id: string) => void; isPending: boolean }
  getHref: (n: NotificationDto) => string | undefined
  onNavigate: (n: NotificationDto) => void
}) {
  const href = getHref(notification);

  const handleViewDetails = () => {
    if (!notification.isRead) {
      markAsRead.mutate(notification.id);
    }
    onNavigate(notification);
  };

  return (
    <Card
      className={`space-y-1 p-4 transition-colors ${
        !notification.isRead ? "border-l-4 border-l-[var(--icon-primary)]" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold">{notification.title}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{notification.message}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {new Date(notification.createdAt).toLocaleString()}
          </p>
        </div>
        {!notification.isRead && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAsRead.mutate(notification.id)}
            disabled={markAsRead.isPending}
            className="shrink-0"
          >
            Mark read
          </Button>
        )}
      </div>
      {href && (
        <Button
          variant="link"
          size="sm"
          onClick={handleViewDetails}
          className="text-xs font-medium text-icon-primary hover:underline mt-2 p-0 h-auto"
        >
          View details →
        </Button>
      )}
    </Card>
  )
}

export function NotificationsPage() {
  const { data: notifications = [], isLoading, isError } = useNotifications(true);
  const markAsRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNavigate = (notification: NotificationDto) => {
    const href = getNotificationHref(notification, user?.role);
    if (href) {
      navigate(href);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-3xl space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-4 w-full mt-3 max-w-md" />
          </Card>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-4 space-y-2">
                <LoadingSkeleton lines={3} />
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-3xl">
          <EmptyState
            title="Could not load notifications"
            description="Please try again later."
          />
        </div>
      </div>
    )
  }

  const sorted = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
  const unreadOnly = sorted.filter((n) => !n.isRead)
  const [tab, setTab] = useState<"all" | "unread">("all")

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-3xl space-y-4">
        <Card className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Bell className="h-5 w-5 text-icon-primary" />
                Notifications
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Stay updated with AniLink alerts. The app uses this to communicate
                booking confirmations, order updates, and reminders.
              </p>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                className="flex items-center gap-2 shrink-0"
              >
                <CheckCheck className="h-4 w-4" />
                Mark all as read
              </Button>
            )}
          </div>
        </Card>
        <Tabs value={tab} onValueChange={(v) => setTab(v as "all" | "unread")}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            {sorted.length > 0 ? (
              <div className="space-y-3">
                {sorted.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    markAsRead={markAsRead}
                    getHref={(n) => getNotificationHref(n, user?.role)}
                    onNavigate={handleNavigate}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No notifications yet"
                description="When the app has updates—like booking confirmations, order status, or reminders—they will appear here."
              />
            )}
          </TabsContent>
          <TabsContent value="unread" className="mt-4">
            {unreadOnly.length > 0 ? (
              <div className="space-y-3">
                {unreadOnly.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    markAsRead={markAsRead}
                    getHref={(n) => getNotificationHref(n, user?.role)}
                    onNavigate={handleNavigate}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No notifications yet"
                description="You have no unread notifications."
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
