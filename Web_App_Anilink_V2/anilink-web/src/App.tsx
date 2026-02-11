import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes/AppRoutes";
import { ToastProviderContext } from "./components/ui/use-toast";
import { Toaster } from "./components/ui/Toaster";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { BookAppointmentSheet } from "@/components/appointments/BookAppointmentSheet";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useBookingStore } from "@/store/bookingStore";
import { AuthLoadingScreen } from "@/components/layout/AuthLoadingScreen";

export default function App() {
  const hydrate = useAuthStore((state) => state.hydrate);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  const cartDrawerOpen = useCartStore((s) => s.cartDrawerOpen);
  const setCartDrawerOpen = useCartStore((s) => s.setCartDrawerOpen);

  const bookSheetOpen = useBookingStore((s) => s.open);
  const setBookSheetOpen = useBookingStore((s) => s.setOpen);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hasHydrated) {
    return (
      <ToastProviderContext>
        <AuthLoadingScreen />
        <Toaster />
      </ToastProviderContext>
    );
  }

  const isOwner = user?.role === "OWNER";

  return (
    <ToastProviderContext>
      <BrowserRouter>
        {isAuthenticated && isOwner && (
          <>
            <CartDrawer
              open={cartDrawerOpen}
              onOpenChange={setCartDrawerOpen}
            />
            <BookAppointmentSheet
              open={bookSheetOpen}
              onOpenChange={setBookSheetOpen}
            />
          </>
        )}
        <AppRoutes />
      </BrowserRouter>
      <Toaster />
    </ToastProviderContext>
  );
}
