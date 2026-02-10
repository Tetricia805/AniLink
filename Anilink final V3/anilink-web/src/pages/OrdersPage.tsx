import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/button'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { useOrders } from '@/hooks/useOrders'

export function OrdersPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { data: orders = [], isLoading, isError } = useOrders()
  const didAutoNavigate = useRef(false)

  const focusId = searchParams.get('focus') ?? searchParams.get('order')
  const lastFocusId = useRef<string | null>(null)
  useEffect(() => {
    if (focusId !== lastFocusId.current) {
      lastFocusId.current = focusId
      didAutoNavigate.current = false
    }
    if (!focusId || isLoading) return
    if (didAutoNavigate.current) return
    const order = orders.find((o) => o.id === focusId || o.id.startsWith(focusId))
    if (order) {
      didAutoNavigate.current = true
      navigate(`/orders/${order.id}`, { replace: true })
    }
  }, [focusId, orders, isLoading, navigate])

  if (isLoading) {
    return <LoadingSkeleton lines={6} />
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <Card className="p-5">
          <p className="text-destructive">Could not load orders.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h2 className="text-lg font-semibold">Orders</h2>
        <p className="text-sm text-muted-foreground">
          Track your marketplace orders and booking requests.
        </p>
      </Card>
      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Your orders will appear here once you place an order from the marketplace."
          action={
            <Link to="/marketplace">
              <Button variant="outline">Go to marketplace</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} to={`/orders/${order.id}`}>
              <Card className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">Order {order.id.slice(0, 8)}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.items.length} item(s) · UGX {order.totalAmount.toLocaleString()}
                    </div>
                    {order.createdAt && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full capitalize ${
                      order.status === 'delivered'
                        ? 'bg-primary/10 text-primary'
                        : order.status === 'cancelled'
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
