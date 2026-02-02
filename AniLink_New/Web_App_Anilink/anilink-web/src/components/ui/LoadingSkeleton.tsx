import { Skeleton } from './Skeleton'

interface LoadingSkeletonProps {
  lines?: number
}

export function LoadingSkeleton({ lines = 3 }: LoadingSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={`skeleton-${index}`} className="h-4 w-full" />
      ))}
    </div>
  )
}
