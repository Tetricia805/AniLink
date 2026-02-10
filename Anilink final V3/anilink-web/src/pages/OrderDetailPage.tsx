import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { BackHeader } from '@/components/layout/BackHeader'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { useOrder, useCancelOrder } from '@/hooks/useOrders'
import { ContactSellerModal } from '@/components/orders/ContactSellerModal'
import { MessageCircle, Package, MapPin, Calendar } from 'lucide-react'

function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const s = status?.toLowerCase() ?? ''
  if (s === 'cancelled') return 'destructive'
  if (s === 'delivered') return 'default'
  if (s === 'pending' || s === 'confirmed') return 'secondary'
  return 'outline'
}

function canCancel(status: string): boolean {
  const s = status?.toLowerCase() ?? ''
  return s === 'pending' || s === 'confirmed'
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: order, isLoading, isError } = useOrder(id)
  const cancelOrder = useCancelOrder()
  const [contactModalOpen, setContactModalOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-3xl space-y-4">
        <BackHeader />
        <LoadingSkeleton lines={8} />
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-3xl space-y-4">
        <BackHeader />
        <ErrorState
          title="Order not found"
          description="Please check the URL or go back."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/orders'))}
            >
              Back
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-3xl space-y-6">
      <BackHeader
        title={`Order ${order.id.slice(0, 8)}`}
        subtitle={order.sellerName ?? 'Marketplace order'}
      />

      <div className="grid gap-4 md:gap-6">
        {/* Header: status + date */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Badge variant={getStatusVariant(order.status)} className="capitalize text-sm">
                {order.status}
              </Badge>
              {order.createdAt && (
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {new Date(order.createdAt).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Seller block */}
        <Card>
          <CardHeader className="pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Seller</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-medium">{order.sellerName ?? 'Seller'}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setContactModalOpen(true)}
              className="gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Contact seller
            </Button>
          </CardContent>
        </Card>

        {/* Items list */}
        <Card>
          <CardHeader className="pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Items</h3>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {order.items.map((item, i) => (
                <li key={i} className="flex justify-between items-start py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="font-medium">{item.productTitle}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} × UGX {item.price.toLocaleString()}
                    </p>
                  </div>
                  <span className="font-medium">
                    UGX {(item.price * item.quantity).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
            <Separator className="my-4" />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-primary">UGX {order.totalAmount.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Delivery block */}
        <Card>
          <CardHeader className="pb-2">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Delivery
            </h3>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="capitalize text-sm">{order.deliveryType?.toLowerCase() ?? '—'}</p>
            {order.deliveryAddress && (
              <p className="text-sm flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                {order.deliveryAddress}
              </p>
            )}
            {order.deliveryDistrict && (
              <p className="text-sm text-muted-foreground">{order.deliveryDistrict}</p>
            )}
            {!order.deliveryAddress && !order.deliveryDistrict && (
              <p className="text-sm text-muted-foreground">No delivery address specified.</p>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {canCancel(order.status) && (
            <Button
              variant="destructive"
              onClick={() => cancelOrder.mutate(order.id)}
              disabled={cancelOrder.isPending}
            >
              {cancelOrder.isPending ? 'Cancelling…' : 'Cancel order'}
            </Button>
          )}
        </div>
      </div>

      <ContactSellerModal
        open={contactModalOpen}
        onOpenChange={setContactModalOpen}
        sellerName={order.sellerName}
        sellerPhone={order.sellerPhone}
        sellerEmail={order.sellerEmail}
        orderId={order.id}
      />
    </div>
  )
}
