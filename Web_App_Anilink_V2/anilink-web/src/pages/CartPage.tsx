import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmptyState } from '../components/ui/EmptyState'

export function CartPage() {
  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h2 className="text-lg font-semibold">Your cart</h2>
        <p className="text-sm text-muted-foreground">
          Items you add will show up here.
        </p>
      </Card>
      <EmptyState
        title="Cart is empty"
        description="Browse the marketplace and add products."
        action={<Button variant="outline">Browse marketplace</Button>}
      />
    </div>
  )
}
