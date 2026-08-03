import { PropertyFeedSkeleton, Skeleton } from '@/components/ui/Skeleton'

/**
 * The listing page is the one route that stays dynamic, because filters and
 * search read the query string. Without this, changing a filter left the last
 * result set frozen on screen with no sign anything was happening.
 */
export default function PropertiesLoading() {
  return (
    <>
      <div className="app-shell py-8 md:py-12">
        <Skeleton className="h-9 w-64 md:h-12 md:w-96" />
        <Skeleton className="mt-4 h-4 w-full max-w-2xl" />
        <Skeleton className="mt-2 h-4 w-3/4 max-w-xl" />
      </div>

      <div className="border-hairline bg-canvas border-y">
        <div className="app-shell flex items-center gap-3 py-3">
          <Skeleton className="h-11 flex-1 rounded-full" />
          <Skeleton className="hidden h-11 w-32 rounded-full md:block" />
        </div>
        <div className="app-shell flex gap-2 overflow-hidden pb-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-11 w-28 shrink-0 rounded-full" />
          ))}
        </div>
      </div>

      <div className="bg-page">
        <div className="app-shell py-8">
          <Skeleton className="mb-6 h-4 w-56" />
          <PropertyFeedSkeleton count={4} />
        </div>
      </div>
    </>
  )
}
