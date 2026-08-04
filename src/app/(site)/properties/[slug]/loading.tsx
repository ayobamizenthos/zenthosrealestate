import { Skeleton } from '@/components/ui/Skeleton'

export default function PropertyDetailLoading() {
  return (
    <>
      <div>
        <div className="app-shell py-3">
          <Skeleton className="h-4 w-72" />
        </div>
      </div>

      <div className="app-shell py-6 md:py-8">
        <div className="md:hidden">
          <Skeleton className="aspect-[4/5] w-full" />
        </div>

        <div className="hidden gap-2 md:grid md:grid-cols-[1.15fr_1fr]">
          <Skeleton className="aspect-[4/5]" />
          <div className="grid grid-cols-2 grid-rows-2 gap-2">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-full w-full" />
            ))}
          </div>
        </div>

        <div className="mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-10">
          <div className="min-w-0">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-3 h-9 w-full max-w-md md:h-12" />
            <Skeleton className="mt-3 h-4 w-56" />
            <Skeleton className="mt-5 h-10 w-64 md:h-12" />

            <div className="mt-8 grid grid-cols-2 border sm:grid-cols-4">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="flex items-center gap-3 px-4 py-3.5">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-10" />
                    <Skeleton className="mt-1.5 h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>

            <Skeleton className="mt-10 h-6 w-48" />
            <Skeleton className="mt-3 h-3.5 w-full" />
            <Skeleton className="mt-2 h-3.5 w-full" />
            <Skeleton className="mt-2 h-3.5 w-2/3" />
          </div>

          <aside className="mt-10 hidden lg:mt-0 lg:block">
            <div className="border bg-white p-5">
              <Skeleton className="h-8 w-44" />
              <Skeleton className="mt-3 h-3.5 w-36" />
              <Skeleton className="mt-5 h-12 w-full rounded-control" />
              <Skeleton className="mt-2 h-12 w-full rounded-control" />
              <Skeleton className="mt-2 h-12 w-full rounded-control" />
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
