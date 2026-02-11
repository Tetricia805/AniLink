import { ShoppingBag } from 'lucide-react'
import { Badge } from './badge'
import { Button } from './button'
import { Card } from './card'
import type { MarketplaceProductDto } from '@/types/marketplace'

export function ProductCard({ product, onQuickAdd }: { product: MarketplaceProductDto; onQuickAdd?: () => void }) {
  return (
    <Card className="space-y-3 p-5 transition hover:-translate-y-0.5 hover:shadow-card">
      <div className="flex items-start gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <ShoppingBag className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">{product.title}</h3>
          <p className="text-xs text-muted-foreground">{product.category}</p>
          <div className="flex flex-wrap gap-2">
            {product.isVerified ? <Badge variant="default">Vet-approved</Badge> : null}
            <Badge variant="outline">{product.stock && product.stock > 0 ? 'In stock' : 'Limited'}</Badge>
          </div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{product.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold text-primary">
          UGX {product.price.toLocaleString()}
        </span>
        <Button size="sm" variant="outline" onClick={onQuickAdd}>
          Quick add
        </Button>
      </div>
    </Card>
  )
}
