import { Link, useLocation, useNavigate } from "react-router-dom";
import { Stethoscope, ShoppingCart, LogOut, Moon, Sun } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfileMenu } from "@/components/profile/ProfileMenu";
import { NotificationsBell } from "@/components/notifications/NotificationsBell";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useUnreadCount } from "@/hooks/useNotifications";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { getNavItemsForRole } from "@/lib/navConfig";
import { NOTIFICATIONS_QUERY_KEY } from "@/lib/queryClient";

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const cartCount = useCartStore((s) =>
    (s.items ?? []).reduce((a, i) => a + i.quantity, 0),
  );
  const setCartDrawerOpen = useCartStore((s) => s.setCartDrawerOpen);
  const { push } = useToast();
  const { theme, toggleTheme } = useTheme();

  const queryClient = useQueryClient();
  const role = user?.role ?? "OWNER";
  const navItems = getNavItemsForRole(role);
  const notificationUnreadCount = useUnreadCount(!!user);

  const isOwner = role === "OWNER";
  const isMarketplaceRoute = location.pathname.startsWith("/marketplace");
  const shouldShowNavCart =
    isOwner && !isMarketplaceRoute && cartCount > 0;

  const handleLogout = () => {
    queryClient.removeQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    logout();
    push({ title: "Logged out", description: "You have been successfully logged out." });
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
            const isNotifications = item.id === "notifications";
            const showNotificationBadge = isNotifications && notificationUnreadCount > 0;

            return (
              <Link
                key={item.id}
                to={item.path}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors",
                  isActive
                    ? "text-icon-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
                {showNotificationBadge && (
                  <span className="absolute -top-0.5 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
                    {notificationUnreadCount > 99 ? "99+" : notificationUnreadCount}
                  </span>
                )}
              </Link>
            );
          })}
          {shouldShowNavCart && (
            <button
              type="button"
              onClick={() => setCartDrawerOpen(true)}
              className="relative flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors text-muted-foreground hover:text-foreground"
              aria-label={`Cart, ${cartCount} items`}
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-0.5 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                {cartCount}
              </span>
              <span className="text-xs">Cart</span>
            </button>
          )}
          <div className="flex flex-col items-center justify-center">
            <NotificationsBell />
          </div>
          <div className="flex flex-col items-center justify-center">
            <ProfileMenu />
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors text-muted-foreground hover:text-destructive"
            aria-label="Log out"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-xs">Log out</span>
          </button>
        </div>
      </nav>

      {/* Desktop Top Navigation */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary">
                <Stethoscope className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-xl">AniLink</span>
            </div>

            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
                const isNotifications = item.id === "notifications";
                const showNotificationBadge = isNotifications && notificationUnreadCount > 0;

                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={cn(
                      "relative flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                      isActive
                        ? "bg-icon-primary-subtle text-icon-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                    {showNotificationBadge && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
                        {notificationUnreadCount > 99 ? "99+" : notificationUnreadCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-9 w-9"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              <NotificationsBell />
              {shouldShowNavCart && (
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  className="relative flex items-center gap-2"
                  onClick={() => setCartDrawerOpen(true)}
                  aria-label={`Cart, ${cartCount} items`}
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span className="hidden sm:inline">Cart</span>
                  <Badge className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                    {cartCount}
                  </Badge>
                </Button>
              )}
              <ProfileMenu />
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Log out</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

