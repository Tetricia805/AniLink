import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SellerOrder, SellerOrderStatus } from "@/types/seller";
import { OrderStatusSelect } from "./OrderStatusSelect";

interface OrderDetailsSheetProps {
  order: SellerOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (orderId: string, status: SellerOrderStatus) => void;
  getNextStatus: (status: SellerOrderStatus) => SellerOrderStatus | null;
}

export function OrderDetailsSheet({
  order,
  open,
  onOpenChange,
  onStatusChange,
  getNextStatus,
}: OrderDetailsSheetProps) {
  if (!order) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Order {order.id.slice(0, 8)}</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant="secondary" className="capitalize">
              {order.status}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            Created: {new Date(order.createdAt).toLocaleString()}
          </div>
          {order.deliveryInfo && (
            <div className="text-sm">
              <span className="text-muted-foreground">Delivery: </span>
              {order.deliveryInfo}
            </div>
          )}
          {order.buyerName && (
            <div className="text-sm">
              <span className="text-muted-foreground">Buyer: </span>
              {order.buyerName}
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium mb-2">Items</h3>
            <ul className="space-y-2">
              {order.items.map((item, i) => (
                <li
                  key={i}
                  className="flex justify-between text-sm border-b border-border pb-2 last:border-0"
                >
                  <span>
                    {item.productName} × {item.quantity}
                  </span>
                  <span>UGX {(item.price * item.quantity).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-between font-semibold pt-2">
            <span>Total</span>
            <span className="text-primary">UGX {order.total.toLocaleString()}</span>
          </div>

          <div className="pt-4 flex gap-2">
            <OrderStatusSelect
              currentStatus={order.status}
              orderId={order.id}
              onStatusChange={onStatusChange}
              getNextStatus={getNextStatus}
            />
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
