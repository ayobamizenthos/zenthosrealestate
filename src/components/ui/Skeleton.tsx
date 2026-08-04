import clsx from 'clsx'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={clsx('bg-surface animate-shimmer rounded-md', className)} />
  )
}

export function PropertyCardSkeleton() {
  return (
    <div className="border-hairline overflow-hidden rounded-card border bg-white">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />

      <div className="p-4 md:p-5">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="mt-3 h-3.5 w-24" />
        <Skeleton className="mt-2.5 h-5 w-44" />
        <Skeleton className="mt-3 h-3 w-40" />

        <div className="mt-4 flex gap-4">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>

        <div className="border-hairline mt-4 flex items-center justify-between border-t pt-3">
          <Skeleton className="h-3 w-20" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function PropertyFeedSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {Array.from({ length: count }, (_, index) => (
        <PropertyCardSkeleton key={index} />
      ))}
    </div>
  )
}
