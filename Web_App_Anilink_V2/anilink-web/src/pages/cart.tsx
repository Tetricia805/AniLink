import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CartItem } from "@/components/cart/CartItem";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import { ShoppingBag } from "lucide-react";

function formatUgx(n: number): string {
  return n.toLocaleString("en-UG");
}

// TODO: Replace with real delivery options from backend
const DELIVERY_UGX = 10_000;

export function CartPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = items.reduce((a, i) => a + i.price * i.quantity, 0);
  const itemCount = items.reduce((a, i) => a + i.quantity, 0);
  const total = subtotal + DELIVERY_UGX;
  const isEmpty = items.length === 0;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true, state: { from: "/cart" } });
    }
  }, [isAuthenticated, navigate]);

  const handleCheckout = () => {
    navigate("/checkout");
  };

  const handleBrowseMarketplace = () => {
    navigate("/marketplace");
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
        <PageHeader
          title="Your Cart"
          subtitle={
            isEmpty ? "Your cart is empty" : `${itemCount} items`
          }
        />

        {isEmpty ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-4 py-16">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-2 text-center">
                <h3 className="text-lg font-semibold text-foreground">
                  Your cart is empty
                </h3>
                <p className="text-sm text-muted-foreground">
                  Browse the marketplace and add products to your cart.
                </p>
              </div>
              <Button type="button" onClick={handleBrowseMarketplace}>
                Browse marketplace
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {items.map((item) => (
                <CartItem
                  key={item.productId}
                  item={item}
                  onQuantityChange={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>

            <div className="lg:sticky lg:top-24 lg:self-start">
              <Card className="border-border shadow-soft">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold">Order summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
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
                    <span className="text-icon-primary">
                      UGX {formatUgx(total)}
                    </span>
                  </div>
                  <Button
                    type="button"
                    className="w-full"
                    size="lg"
                    onClick={handleCheckout}
                  >
                    Proceed to checkout
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleBrowseMarketplace}
                  >
                    Continue shopping
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
