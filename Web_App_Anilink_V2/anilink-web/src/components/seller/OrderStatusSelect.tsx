import { Button } from "@/components/ui/button";
import type { SellerOrderStatus } from "@/types/seller";

interface OrderStatusSelectProps {
  currentStatus: SellerOrderStatus;
  orderId: string;
  onStatusChange: (orderId: string, status: SellerOrderStatus) => void;
  getNextStatus: (status: SellerOrderStatus) => SellerOrderStatus | null;
}

const LABELS: Record<SellerOrderStatus, string> = {
  confirmed: "Mark packed",
  packed: "Mark dispatched",
  dispatched: "Mark delivered",
  delivered: "Delivered",
};

export function OrderStatusSelect({
  currentStatus,
  orderId,
  onStatusChange,
  getNextStatus,
}: OrderStatusSelectProps) {
  const next = getNextStatus(currentStatus);
  if (!next) return null;

  const label = LABELS[currentStatus] ?? `Mark ${next}`;
  return (
    <Button
      size="sm"
      onClick={() => onStatusChange(orderId, next)}
    >
      {label}
    </Button>
  );
}
