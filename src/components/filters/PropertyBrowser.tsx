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
        <div className="app-shell pt-8 pb-6 md:pt-12">
          <h1 className="text-ink text-[30px] leading-tight font-extrabold md:text-[40px]">
            {heading}
          </h1>
          <p className="text-muted mt-3 max-w-3xl text-[15px] leading-relaxed">{intro}</p>
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
