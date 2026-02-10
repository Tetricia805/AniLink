import { Button } from "@/components/ui/button";
import { Package, Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem as CartItemType } from "@/types/cart";

export interface CartItemProps {
  item: CartItemType;
  onQuantityChange: (productId: string | number, delta: number) => void;
  onRemove: (productId: string | number) => void;
}

export function CartItem({ item, onQuantityChange, onRemove }: CartItemProps) {
  return (
    <div className="flex gap-3 rounded-xl border border-border bg-card p-3">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
        {item.image ? (
          <img
            src={item.image}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <Package className="h-6 w-6 text-muted-foreground" />
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="truncate text-sm font-medium text-foreground">
          {item.name}
        </p>
        <p className="text-sm font-semibold text-icon-primary">
          UGX {item.priceDisplay}
        </p>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border border-border bg-muted/50">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-r-none"
              onClick={() => onQuantityChange(item.productId, -1)}
              disabled={item.quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span
              className="min-w-[1.75rem] px-1 text-center text-sm tabular-nums"
              aria-label={`Quantity: ${item.quantity}`}
            >
              {item.quantity}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-l-none"
              onClick={() => onQuantityChange(item.productId, 1)}
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(item.productId)}
            aria-label="Remove item"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
