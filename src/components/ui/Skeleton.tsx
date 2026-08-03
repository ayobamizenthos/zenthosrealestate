import clsx from 'clsx'

/** Burgundy-tinted rather than grey, so loading states stay on-brand. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('bg-surface animate-shimmer rounded-md', className)} />
}

export function PropertyCardSkeleton() {
  return (
    <div className="rounded-card shadow-card overflow-hidden bg-white">
      <Skeleton className="aspect-[4/5] w-full rounded-none" />
      <div className="space-y-2.5 p-3.5 md:p-4">
        <Skeleton className="h-5 w-2/5" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3.5 w-3/5" />
      </div>
    </div>
  )
}

export function PropertyGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3 lg:gap-6">
      {Array.from({ length: count }, (_, index) => (
        <PropertyCardSkeleton key={index} />
      ))}
    </div>
  )
}
