import { Link, useLocation, useNavigate } from "react-router-dom";
import { Stethoscope, LogOut, Moon, Sun } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProfileMenu } from "@/components/profile/ProfileMenu";
import { NotificationsBell } from "@/components/notifications/NotificationsBell";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { SELLER_NAV_ITEMS } from "@/lib/navConfig";
import { NOTIFICATIONS_QUERY_KEY } from "@/lib/queryClient";

/**
 * Navigation for SELLER role only. Renders only seller routes:
 * Dashboard, Products, Orders, Payouts, Profile, Log out.
 * No owner/vet/admin links. No CSS hiding.
 */
export function SellerNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);
  const { push } = useToast();
  const { theme, toggleTheme } = useTheme();

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
          {SELLER_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path || location.pathname.startsWith(item.path + "/");
            return (
              <Link
                key={item.id}
                to={item.path}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors",
                  isActive ? "text-icon-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
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
              <span className="font-semibold text-xl">AniLink Seller</span>
            </div>

            <div className="flex items-center gap-1">
              {SELLER_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.path ||
                  location.pathname.startsWith(item.path + "/");
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={cn(
                      "relative flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                      isActive
                        ? "bg-icon-primary-subtle text-icon-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
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
