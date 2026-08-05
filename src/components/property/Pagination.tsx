import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import clsx from 'clsx'
import { filtersToQueryString } from '@/lib/property-filters'
import type { PropertyFilters } from '@/lib/types'

interface PaginationProps {
  filters: PropertyFilters
  pageCount: number
  basePath: string
}

const STEP_CLASSES =
  'flex h-10 w-10 items-center justify-center rounded-full border transition-colors'

export function Pagination({ filters, pageCount, basePath }: PaginationProps) {
  if (pageCount <= 1) return null

  const hrefForPage = (page: number) => `${basePath}${filtersToQueryString({ ...filters, page })}`
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1).filter(
    page => page === 1 || page === pageCount || Math.abs(page - filters.page) <= 1
  )

  const hasPrevious = filters.page > 1
  const hasNext = filters.page < pageCount

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex items-center justify-between gap-4 border-t pt-6"
    >
      <ol className="scrollbar-none flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
        {pages.map((page, index) => {
          const previousPage = pages[index - 1]
          const hasGap = previousPage !== undefined && page - previousPage > 1

          return (
            <li key={page} className="flex shrink-0 items-center gap-1.5">
              {hasGap ? (
                <span className="text-muted px-0.5 text-[14px]" aria-hidden="true">
                  …
                </span>
              ) : null}
              <Link
                href={hrefForPage(page)}
                aria-label={`Page ${page}`}
                aria-current={page === filters.page ? 'page' : undefined}
                className={clsx(
                  'flex h-10 w-10 items-center justify-center rounded-full text-[14px] transition-colors',
                  page === filters.page
                    ? 'bg-brand text-brand-ink font-bold'
                    : 'text-ink hover:bg-surface font-semibold'
                )}
              >
                {page}
              </Link>
            </li>
          )
        })}
      </ol>

      <div className="flex shrink-0 items-center gap-2">
        {hasPrevious ? (
          <Link
            href={hrefForPage(filters.page - 1)}
            rel="prev"
            aria-label="Previous page"
            className={clsx(STEP_CLASSES, 'text-ink hover:border-ink hover:bg-surface')}
          >
            <ChevronLeft size={17} aria-hidden="true" />
          </Link>
        ) : (
          <span aria-hidden="true" className={clsx(STEP_CLASSES, 'text-muted/40')}>
            <ChevronLeft size={17} />
          </span>
        )}

        {hasNext ? (
          <Link
            href={hrefForPage(filters.page + 1)}
            rel="next"
            aria-label="Next page"
            className={clsx(STEP_CLASSES, 'text-ink hover:border-ink hover:bg-surface')}
          >
            <ChevronRight size={17} aria-hidden="true" />
          </Link>
        ) : (
          <span aria-hidden="true" className={clsx(STEP_CLASSES, 'text-muted/40')}>
            <ChevronRight size={17} />
          </span>
        )}
      </div>
    </nav>
  )
}
