'use client'

import { LoaderCircle, Search, X } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { propertyCardImage } from '@/lib/cloudinary'
import { LOCATION_LANDING_PAGES, SEARCH_DEBOUNCE_MS, SEARCH_MIN_CHARS } from '@/lib/constants'
import { displayPriceCompact } from '@/lib/format'
import { searchProperties } from '@/lib/queries/properties'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { PropertySummary } from '@/lib/types'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { useRecentSearches } from '@/hooks/useRecentSearches'

export function SearchOverlay({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [term, setTerm] = useState('')

  const [resolved, setResolved] = useState<{ query: string; matches: PropertySummary[] }>({
    query: '',
    matches: [],
  })
  const debouncedTerm = useDebouncedValue(term, SEARCH_DEBOUNCE_MS)
  const { recentSearches, remember, clear } = useRecentSearches()

  useLockBodyScroll(true)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [onClose])

  const query = debouncedTerm.trim()
  const isQueryReady = query.length >= SEARCH_MIN_CHARS

  useEffect(() => {
    if (!isQueryReady) return

    let cancelled = false

    searchProperties(createSupabaseBrowserClient(), query)
      .then(results => {
        if (!cancelled) setResolved({ query, matches: results })
      })
      .catch(() => {
        if (!cancelled) setResolved({ query, matches: [] })
      })

    return () => {
      cancelled = true
    }
  }, [query, isQueryReady])

  const matches = isQueryReady && resolved.query === query ? resolved.matches : []
  const isSearching = isQueryReady && resolved.query !== query

  const runSearch = useCallback(
    (query: string) => {
      const trimmed = query.trim()
      if (!trimmed) return
      remember(trimmed)
      onClose()
      router.push(`/properties?q=${encodeURIComponent(trimmed)}`)
    },
    [onClose, remember, router]
  )

  const openProperty = useCallback(
    (slug: string) => {
      onClose()
      router.push(`/properties/${slug}`)
    },
    [onClose, router]
  )

  const showEmptyMessage =
    debouncedTerm.trim().length >= SEARCH_MIN_CHARS && !isSearching && matches.length === 0

  return (
    <div className="fixed inset-0 z-[60] flex flex-col md:items-center md:justify-start md:pt-24">
      <button
        type="button"
        aria-label="Close search"
        onClick={onClose}
        className="absolute inset-0 hidden bg-black/40 md:block"
      />

      <div className="animate-fade-in bg-canvas relative flex h-full w-full flex-col md:h-auto md:max-h-[70vh] md:max-w-2xl md:rounded-2xl md:shadow-2xl">
        <div className="border-hairline flex items-center gap-2 border-b px-4 py-3">
          <Search size={18} className="text-muted shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={term}
            onChange={event => setTerm(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') runSearch(term)
            }}
            placeholder="Search properties in Victoria Island, Lekki, Ikoyi, Ajah..."
            aria-label="Search properties"
            className="text-ink placeholder:text-muted h-11 min-w-0 flex-1 bg-transparent text-[16px] outline-none"
          />
          {isSearching ? (
            <LoaderCircle
              size={18}
              className="text-brand shrink-0 animate-spin"
              aria-hidden="true"
            />
          ) : null}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="text-muted hover:text-ink -mr-2 flex h-11 w-11 items-center justify-center"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="border-hairline flex gap-2 overflow-x-auto border-b px-4 py-3">
          {LOCATION_LANDING_PAGES.map(location => (
            <button
              key={location.slug}
              type="button"
              onClick={() => {
                onClose()
                router.push(`/properties/${location.slug}`)
              }}
              className="border-hairline text-ink hover:border-brand hover:text-brand rounded-pill shrink-0 border px-3.5 py-2 text-[13px] font-medium transition-colors"
            >
              {location.name}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          {matches.length > 0 ? (
            <ul>
              {matches.map(property => {
                const [cover] = property.images
                return (
                  <li key={property.id}>
                    <button
                      type="button"
                      onClick={() => openProperty(property.slug)}
                      className="hover:bg-surface flex w-full items-center gap-3 px-4 py-3 text-left transition-colors"
                    >
                      <span className="bg-surface relative h-14 w-20 shrink-0 overflow-hidden rounded-lg">
                        {cover ? (
                          <Image
                            src={propertyCardImage(cover)}
                            alt=""
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="text-ink block truncate text-[14px] font-semibold">
                          {property.title}
                        </span>
                        <span className="text-muted block text-[13px]">{property.location}</span>
                      </span>
                      <span className="text-brand shrink-0 text-[14px] font-bold">
                        {displayPriceCompact(property.price, property.price_label)}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : null}

          {showEmptyMessage ? (
            <div className="px-4 py-10 text-center">
              <p className="text-ink text-[15px] font-semibold">
                No properties match “{debouncedTerm}”
              </p>
              <p className="text-muted mt-1 text-[14px]">
                Try a location above, or browse everything currently listed.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose()
                  router.push('/properties')
                }}
                className="text-brand mt-4 text-[14px] font-semibold underline underline-offset-4"
              >
                Browse all properties
              </button>
            </div>
          ) : null}

          {term.trim().length < SEARCH_MIN_CHARS && recentSearches.length > 0 ? (
            <div className="px-4 py-4">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-ink text-[13px] font-semibold">Recent searches</h2>
                <button
                  type="button"
                  onClick={clear}
                  className="text-muted hover:text-brand text-[13px]"
                >
                  Clear
                </button>
              </div>
              <ul className="space-y-1">
                {recentSearches.map(entry => (
                  <li key={entry}>
                    <button
                      type="button"
                      onClick={() => runSearch(entry)}
                      className="text-ink hover:bg-surface flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-left text-[14px]"
                    >
                      <Search size={15} className="text-muted" aria-hidden="true" />
                      {entry}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
