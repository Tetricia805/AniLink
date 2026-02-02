import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/Sheet";
import { Button } from "@/components/ui/button";
import { CartItem } from "./CartItem";
import { useCartStore } from "@/store/cartStore";
import { ShoppingBag } from "lucide-react";

export interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatUgx(n: number): string {
  return n.toLocaleString("en-UG");
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const count = items.reduce((a, i) => a + i.quantity, 0);
  const subtotal = items.reduce((a, i) => a + i.price * i.quantity, 0);

  const handleContinueShopping = () => {
    onOpenChange(false);
    navigate("/marketplace");
  };

  const handleProceedToCheckout = () => {
    onOpenChange(false);
    navigate("/checkout");
  };

  const handleBrowseMarketplace = () => {
    onOpenChange(false);
    navigate("/marketplace");
  };

  const isEmpty = items.length === 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full max-w-md flex-col p-0">
        <SheetHeader className="border-b border-border px-6 py-4">
          <SheetTitle>Your Cart</SheetTitle>
          {!isEmpty && (
            <p className="text-sm text-muted-foreground">
              {count} {count === 1 ? "item" : "items"}
            </p>
          )}
        </SheetHeader>

        {isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="space-y-2 text-center">
              <h3 className="text-base font-semibold text-foreground">
                Your cart is empty
              </h3>
              <p className="text-sm text-muted-foreground">
                Add products from the marketplace to get started.
              </p>
            </div>
            <Button
              type="button"
              onClick={handleBrowseMarketplace}
              className="w-full sm:w-auto"
            >
              Browse marketplace
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.productId}>
                    <CartItem
                      item={item}
                      onQuantityChange={updateQuantity}
                      onRemove={removeItem}
                    />
                  </li>
                ))}
              </ul>
            </div>
            <footer className="sticky bottom-0 border-t border-border bg-card px-6 py-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Subtotal
                </span>
                <span className="text-lg font-semibold text-foreground">
                  UGX {formatUgx(subtotal)}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleContinueShopping}
                >
                  Continue shopping
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  onClick={handleProceedToCheckout}
                >
                  Proceed to checkout
                </Button>
              </div>
            </footer>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
