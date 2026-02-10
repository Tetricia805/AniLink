import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getMarketplaceProduct } from '../api/marketplace'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BackHeader } from '@/components/layout/BackHeader'
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton'
import { ErrorState } from '../components/ui/ErrorState'

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['marketplace-product', id],
    queryFn: () => getMarketplaceProduct(id || ''),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-3xl space-y-4">
        <BackHeader />
        <LoadingSkeleton lines={4} />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-3xl space-y-4">
        <BackHeader />
        <ErrorState title="Product not found" description="Please try again." />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-3xl space-y-4">
      <BackHeader title={data.title} subtitle={data.description} />
      <Card className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-primary">
            UGX {data.price.toLocaleString()}
          </span>
          <Button>Add to cart</Button>
        </div>
      </Card>
    </div>
  )
}
