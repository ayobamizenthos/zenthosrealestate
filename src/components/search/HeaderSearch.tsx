'use client'

import { LoaderCircle, Search, X } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { propertyCardImage } from '@/lib/cloudinary'
import { SEARCH_DEBOUNCE_MS, SEARCH_MIN_CHARS } from '@/lib/constants'
import { displayPriceCompact } from '@/lib/format'
import { searchProperties } from '@/lib/queries/properties'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { PropertySummary } from '@/lib/types'

/**
 * Desktop search lives in the bar itself and drops its results underneath.
 * A modal was overkill on a wide screen: it hid the listings the user was
 * already looking at to show them a list of listings.
 */
export function HeaderSearch() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [term, setTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [resolved, setResolved] = useState<{ query: string; matches: PropertySummary[] }>({
    query: '',
    matches: [],
  })

  const debouncedTerm = useDebouncedValue(term, SEARCH_DEBOUNCE_MS)
  const query = debouncedTerm.trim()
  const isQueryReady = query.length >= SEARCH_MIN_CHARS

  useEffect(() => {
    if (!isQueryReady) return

    let cancelled = false
    searchProperties(createSupabaseBrowserClient(), query, 6)
      .then(matches => {
        if (!cancelled) setResolved({ query, matches })
      })
      .catch(() => {
        if (!cancelled) setResolved({ query, matches: [] })
      })

    return () => {
      cancelled = true
    }
  }, [query, isQueryReady])

  // Close on outside click and on Escape, the two ways people dismiss a dropdown.
  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeydown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeydown)
    }
  }, [])

  const matches = isQueryReady && resolved.query === query ? resolved.matches : []
  const isSearching = isQueryReady && resolved.query !== query

  const submit = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return
    setIsOpen(false)
    router.push(`/properties?q=${encodeURIComponent(trimmed)}`)
  }

  const openProperty = (slug: string) => {
    setIsOpen(false)
    setTerm('')
    router.push(`/properties/${slug}`)
  }

  return (
    <div ref={containerRef} className="relative hidden md:block">
      <div className="border-hairline focus-within:border-ink flex h-10 w-60 items-center gap-2 rounded-full border px-3.5 transition-colors xl:w-72">
        <Search size={15} aria-hidden="true" className="text-muted shrink-0" />
        <input
          type="search"
          value={term}
          onChange={event => {
            setTerm(event.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={event => {
            if (event.key === 'Enter') submit(term)
          }}
          placeholder="Search area, type or ZEN code"
          aria-label="Search properties"
          className="text-ink placeholder:text-muted h-full min-w-0 flex-1 bg-transparent text-[13px] outline-none [&::-webkit-search-cancel-button]:appearance-none"
        />
        {isSearching ? (
          <LoaderCircle size={14} className="text-brand shrink-0 animate-spin" aria-hidden="true" />
        ) : term ? (
          <button
            type="button"
            onClick={() => {
              setTerm('')
              setIsOpen(false)
            }}
            aria-label="Clear search"
            className="text-muted hover:text-ink shrink-0"
          >
            <X size={14} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {isOpen && isQueryReady ? (
        <div className="border-hairline shadow-card-hover animate-fade-in absolute top-12 right-0 z-50 w-[26rem] overflow-hidden rounded-card border bg-white">
          {matches.length > 0 ? (
            <>
              <ul className="max-h-[22rem] overflow-y-auto">
                {matches.map(property => {
                  const [cover] = property.images
                  return (
                    <li key={property.id}>
                      <button
                        type="button"
                        onClick={() => openProperty(property.slug)}
                        className="hover:bg-surface flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors"
                      >
                        <span className="bg-surface relative h-12 w-10 shrink-0 overflow-hidden rounded">
                          {cover ? (
                            <Image
                              src={propertyCardImage(cover)}
                              alt=""
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : null}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="text-ink block truncate text-[13px] font-semibold">
                            {property.title}
                          </span>
                          <span className="text-muted block text-[12px]">{property.location}</span>
                        </span>
                        <span className="text-ink shrink-0 text-[13px] font-bold">
                          {displayPriceCompact(property.price, property.price_label)}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>

              <button
                type="button"
                onClick={() => submit(term)}
                className="border-hairline text-brand hover:bg-surface w-full border-t px-3.5 py-2.5 text-[13px] font-semibold transition-colors"
              >
                See all results for “{query}”
              </button>
            </>
          ) : !isSearching ? (
            <p className="text-muted px-3.5 py-6 text-center text-[13px]">
              Nothing matches “{query}”.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
