import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { filtersToQueryString } from '@/lib/property-filters'
import type { PropertyFilters } from '@/lib/types'

interface PaginationProps {
  filters: PropertyFilters
  pageCount: number
  basePath: string
}

export function Pagination({ filters, pageCount, basePath }: PaginationProps) {
  if (pageCount <= 1) return null

  const hrefForPage = (page: number) => `${basePath}${filtersToQueryString({ ...filters, page })}`
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1).filter(
    page => page === 1 || page === pageCount || Math.abs(page - filters.page) <= 1
  )

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-1.5">
      {filters.page > 1 ? (
        <Link
          href={hrefForPage(filters.page - 1)}
          rel="prev"
          aria-label="Previous page"
          className="text-ink hover:border-brand flex h-11 w-11 items-center justify-center rounded-control border transition-colors"
        >
          <ChevronLeft size={17} aria-hidden="true" />
        </Link>
      ) : null}

      {pages.map((page, index) => {
        const previousPage = pages[index - 1]
        const hasGap = previousPage !== undefined && page - previousPage > 1

        return (
          <span key={page} className="flex items-center gap-1.5">
            {hasGap ? (
              <span className="text-muted px-1" aria-hidden="true">
                …
              </span>
            ) : null}
            <Link
              href={hrefForPage(page)}
              aria-label={`Page ${page}`}
              aria-current={page === filters.page ? 'page' : undefined}
              className={
                page === filters.page
                  ? 'bg-brand text-brand-ink rounded-control flex h-11 min-w-11 items-center justify-center px-3 text-[14px] font-bold'
                  : 'text-ink hover:border-brand rounded-control flex h-11 min-w-11 items-center justify-center border px-3 text-[14px] font-semibold transition-colors'
              }
            >
              {page}
            </Link>
          </span>
        )
      })}

      {filters.page < pageCount ? (
        <Link
          href={hrefForPage(filters.page + 1)}
          rel="next"
          aria-label="Next page"
          className="text-ink hover:border-brand flex h-11 w-11 items-center justify-center rounded-control border transition-colors"
        >
          <ChevronRight size={17} aria-hidden="true" />
        </Link>
      ) : null}
    </nav>
  )
}
