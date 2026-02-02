import { Star } from 'lucide-react'

interface RatingStarsProps {
  rating: number
  showValue?: boolean
}

export function RatingStars({ rating, showValue = false }: RatingStarsProps) {
  const clamped = Math.max(0, Math.min(5, rating))
  const fullStars = Math.floor(clamped)

  return (
    <div className="flex items-center gap-1 text-sm">
      {[...Array(5)].map((_, index) => {
        const isFull = index < fullStars
        return (
          <span
            key={`star-${index}`}
            className={isFull ? 'text-amber-400' : 'text-gray-300'}
          >
            <Star className="h-4 w-4 fill-current" />
          </span>
        )
      })}
      {showValue ? (
        <span className="ml-2 text-xs text-muted-foreground">{rating.toFixed(1)}</span>
      ) : null}
    </div>
  )
}
