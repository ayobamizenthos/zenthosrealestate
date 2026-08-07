'use client'

import { Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { SEARCH_DEBOUNCE_MS } from '@/lib/constants'
import type { PropertyFilters } from '@/lib/types'
import { FilterChips } from './FilterChips'

interface FilterBarProps {
  filters: PropertyFilters
  onChange: (next: PropertyFilters) => void
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const [queryDraft, setQueryDraft] = useState(filters.query)
  const debouncedQuery = useDebouncedValue(queryDraft, SEARCH_DEBOUNCE_MS)

  const latest = useRef({ filters, onChange })

  useEffect(() => {
    latest.current = { filters, onChange }
  })

  useEffect(() => {
    const current = latest.current
    const trimmed = debouncedQuery.trim()
    if (trimmed === current.filters.query) return

    current.onChange({ ...current.filters, query: trimmed })
  }, [debouncedQuery])

  return (
    <div className="sticky top-16 z-30">
      <div className="bg-canvas/95 border-hairline border-b backdrop-blur-md">
        <div className="app-shell">
          <div className="flex items-center gap-2 py-2.5 md:gap-3">
            <div className="border-hairline focus-within:border-ink relative flex h-10 flex-1 items-center gap-2 rounded-pill border px-3.5 transition-colors md:h-11">
              <Search size={15} className="text-muted shrink-0" aria-hidden="true" />
              <input
                type="search"
                value={queryDraft}
                onChange={event => setQueryDraft(event.target.value)}
                placeholder="Search area, city or type"
                aria-label="Search properties"
                className="text-ink placeholder:text-muted h-full min-w-0 flex-1 bg-transparent text-[16px] outline-none [&::-webkit-search-cancel-button]:appearance-none"
              />
              {queryDraft ? (
                <button
                  type="button"
                  onClick={() => setQueryDraft('')}
                  aria-label="Clear search"
                  className="text-muted hover:text-ink -mr-1 flex h-8 w-8 shrink-0 items-center justify-center"
                >
                  <X size={15} aria-hidden="true" />
                </button>
              ) : null}
            </div>
          </div>

          <FilterChips filters={filters} onChange={onChange} />
        </div>
      </div>
    </div>
  )
}
