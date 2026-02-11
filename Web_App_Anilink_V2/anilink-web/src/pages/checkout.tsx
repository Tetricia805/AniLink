import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useCreateOrder } from "@/hooks/useOrders";
import { useEffect } from "react";

const DELIVERY_UGX = 10_000;

function formatUgx(n: number): string {
  return n.toLocaleString("en-UG");
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const createOrder = useCreateOrder();
  const subtotal = items.reduce((a, i) => a + i.price * i.quantity, 0);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true, state: { from: "/checkout" } });
    }
  }, [isAuthenticated, navigate]);

  const total = subtotal + DELIVERY_UGX;

  const handlePlaceOrder = () => {
    const orderItems = items.map((i) => ({
      productId: String(i.productId),
      quantity: i.quantity,
      price: i.price,
    }));
    createOrder.mutate(
      {
        items: orderItems,
        deliveryType: "DELIVERY",
        deliveryAddress: undefined,
        deliveryDistrict: undefined,
      },
      {
        onSuccess: () => {
          clear();
          navigate("/orders", { replace: true });
        },
      }
    );
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-2xl">
        <PageHeader
          title="Checkout"
          subtitle="Review your order and complete purchase"
        />
        <Card className="border-border shadow-soft">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal ({items.length} items)</span>
                <span className="text-foreground">
                  UGX {formatUgx(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery</span>
                <span className="text-foreground">
                  UGX {formatUgx(DELIVERY_UGX)}
                </span>
              </div>
            </div>
            <div className="flex justify-between border-t border-border pt-4 text-base font-semibold">
              <span>Total</span>
              <span className="text-primary">UGX {formatUgx(total)}</span>
            </div>
            <Button
              type="button"
              className="w-full"
              size="lg"
              onClick={handlePlaceOrder}
              disabled={items.length === 0 || createOrder.isPending}
            >
              {createOrder.isPending ? "Placing order…" : "Place order"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => navigate("/cart")}
            >
              Back to cart
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
