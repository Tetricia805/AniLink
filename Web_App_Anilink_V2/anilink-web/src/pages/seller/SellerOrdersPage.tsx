import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { useSellerOrders, useUpdateSellerOrderStatus } from "@/hooks/useSellerOrders";
import type { SellerOrderDto } from "@/api/sellerOrders";
import type { SellerOrderStatus } from "@/types/seller";
import { OrderStatusSelect } from "@/components/seller/OrderStatusSelect";
import { OrderDetailsSheet } from "@/components/seller/OrderDetailsSheet";

const STATUS_FLOW: SellerOrderStatus[] = ["confirmed", "packed", "dispatched", "delivered"];

function getNextStatus(status: string): SellerOrderStatus | null {
  const s = status.toLowerCase();
  const i = STATUS_FLOW.indexOf(s as SellerOrderStatus);
  return i < STATUS_FLOW.length - 1 ? STATUS_FLOW[i + 1]! : null;
}

/** Map API DTO to component shape (OrderDetailsSheet expects total, deliveryInfo, items with price). */
function toSheetOrder(dto: SellerOrderDto) {
  return {
    id: dto.id,
    status: dto.status.toLowerCase() as SellerOrderStatus,
    total: dto.totalAmount,
    createdAt: dto.createdAt ?? new Date().toISOString(),
    deliveryInfo: dto.deliveryAddress ?? undefined,
    buyerName: undefined,
    items: dto.items.map((it) => ({
      productId: it.productId ?? "",
      productName: it.productName ?? "Product",
      quantity: it.quantity,
      price: it.unitPrice,
    })),
  };
}

export function SellerOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: orders = [], isLoading, isError } = useSellerOrders();
  const updateStatus = useUpdateSellerOrderStatus();

  const [selectedOrder, setSelectedOrder] = useState<SellerOrderDto | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const orderIdFromUrl = searchParams.get("order") ?? searchParams.get("focus");
  useEffect(() => {
    if (orderIdFromUrl && orders.length > 0) {
      const order = orders.find((o) => o.id === orderIdFromUrl || o.id.startsWith(orderIdFromUrl));
      if (order) {
        setSelectedOrder(order);
        setDetailsOpen(true);
        setSearchParams({}, { replace: true });
      }
    }
  }, [orderIdFromUrl, orders, setSearchParams]);

  const handleViewDetails = (order: SellerOrderDto) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const handleStatusChange = (orderId: string, status: SellerOrderStatus) => {
    updateStatus.mutate({ orderId, status });
    setSelectedOrder((prev) =>
      prev?.id === orderId ? { ...prev, status } : prev,
    );
  };

  if (isLoading) return <LoadingSkeleton lines={6} />;
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-6">
        <p className="text-destructive">Could not load orders.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
        <h1 className="text-2xl md:text-3xl font-semibold mb-2">Orders</h1>
        <p className="text-muted-foreground mb-6">
          Orders placed for your products. Update status as you fulfill.
        </p>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-8">
              <EmptyState
                title="No orders yet"
                description="When buyers order your products, orders will appear here."
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="font-medium">Order {order.id.slice(0, 8)}</span>
                        <span className="text-muted-foreground text-sm ml-2">
                          {new Date(order.createdAt ?? "").toLocaleDateString(undefined, {
                            dateStyle: "medium",
                          })}
                        </span>
                      </div>
                      <Badge variant="secondary" className="capitalize shrink-0">
                        {order.status}
                      </Badge>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {order.items.length} item(s) · UGX {order.totalAmount.toLocaleString()}
                    </div>

                    {order.deliveryAddress && (
                      <div className="text-sm text-muted-foreground">
                        Delivery: {order.deliveryAddress}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(order)}
                      >
                        View details
                      </Button>
                      <OrderStatusSelect
                        currentStatus={order.status.toLowerCase() as SellerOrderStatus}
                        orderId={order.id}
                        onStatusChange={handleStatusChange}
                        getNextStatus={getNextStatus}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <OrderDetailsSheet
        order={selectedOrder ? toSheetOrder(selectedOrder) : null}
        open={detailsOpen}
        onOpenChange={(open) => {
          setDetailsOpen(open);
          if (!open) setSelectedOrder(null);
        }}
        onStatusChange={handleStatusChange}
        getNextStatus={getNextStatus}
      />
    </div>
  );
}
