import clsx from 'clsx'

/** Burgundy-tinted rather than grey, so loading states stay on-brand. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={clsx('bg-surface animate-shimmer rounded-md', className)} />
  )
}

/**
 * Mirrors PropertyCard: a 4:5 frame beside the detail stack. The shape has to
 * track the real card, otherwise the layout jumps the moment data lands, which
 * is worse than showing nothing.
 */
export function PropertyCardSkeleton() {
  return (
    <div className="border-hairline border bg-white sm:flex">
      <Skeleton className="aspect-[4/5] shrink-0 rounded-none sm:w-[260px] lg:w-[300px]" />

      <div className="flex-1 p-4 md:p-5">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="mt-3 h-3.5 w-28" />
        <Skeleton className="mt-3 h-5 w-56" />
        <Skeleton className="mt-3 h-3 w-full max-w-md" />
        <Skeleton className="mt-2 h-3 w-2/3 max-w-sm" />

        <div className="mt-4 flex gap-4">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-14" />
        </div>

        <div className="border-hairline mt-4 flex items-center justify-between border-t pt-3">
          <Skeleton className="h-3 w-20" />
          <div className="flex gap-2">
            <Skeleton className="h-11 w-16" />
            <Skeleton className="h-11 w-11 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function PropertyFeedSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, index) => (
        <PropertyCardSkeleton key={index} />
      ))}
    </div>
  )
}
