'use client'

import clsx from 'clsx'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import type { ReactNode } from 'react'
import { filtersToQueryString } from '@/lib/property-filters'
import type { PropertyFilters } from '@/lib/types'
import { FilterBar } from './FilterBar'

interface PropertyBrowserProps {
  filters: PropertyFilters
  heading: string
  intro: string
  children: ReactNode
}

export function PropertyBrowser({ filters, heading, intro, children }: PropertyBrowserProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const applyFilters = useCallback(
    (next: PropertyFilters) => {
      startTransition(() => {
        router.replace(`${pathname}${filtersToQueryString({ ...next, page: 1 })}`, {
          scroll: false,
        })
      })
    },
    [pathname, router]
  )

  return (
    <>
      <div className="bg-canvas">
        {/* Kept short on phones so results start above the fold. */}
        <div className="app-shell pt-5 pb-4 md:pt-12 md:pb-6">
          <h1 className="text-ink text-[26px] leading-tight font-extrabold sm:text-[30px] md:text-[40px]">
            {heading}
          </h1>
          <p className="text-muted mt-2 line-clamp-2 max-w-3xl text-[14px] leading-relaxed sm:line-clamp-none md:mt-3 md:text-[15px]">
            {intro}
          </p>
        </div>
      </div>

      <FilterBar filters={filters} onChange={applyFilters} />

      <div className="bg-page min-h-screen">
        <div className="app-shell py-6 md:py-8">
          <div className={clsx('transition-opacity duration-200', isPending && 'opacity-40')}>
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
