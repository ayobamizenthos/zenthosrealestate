'use client'

import clsx from 'clsx'
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

export function HeroSearchForm() {
  const router = useRouter()
  const cardRef = useRef<HTMLDivElement>(null)
  const [resultsAbove, setResultsAbove] = useState(false)

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

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!cardRef.current?.contains(event.target as Node)) setIsOpen(false)
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

  useEffect(() => {
    if (!isOpen) return

    const measure = () => {
      const rect = cardRef.current?.getBoundingClientRect()
      if (!rect) return
      const below = window.innerHeight - rect.bottom
      setResultsAbove(below < 320 && rect.top > below)
    }

    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [isOpen])

  const matches = isQueryReady && resolved.query === query ? resolved.matches : []
  const isSearching = isQueryReady && resolved.query !== query

  // The hero asks one question. Everything else is chosen on the results page,
  // where the filter rail already lives.
  const submit = () => {
    const params = new URLSearchParams()
    if (term.trim()) params.set('q', term.trim())

    const search = params.toString()
    setIsOpen(false)
    router.push(search ? `/properties?${search}` : '/properties')
  }

  return (
    <div ref={cardRef} className="relative w-full max-w-3xl">
      <div className="flex items-center gap-1.5 rounded-full bg-white p-1.5 shadow-2xl md:gap-2 md:p-2">
        <Search size={17} aria-hidden="true" className="text-muted ml-2.5 shrink-0 md:ml-3" />
        <input
          type="search"
          value={term}
          onChange={event => {
            setTerm(event.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={event => {
            if (event.key === 'Enter') submit()
          }}
          placeholder="Search area, street or type"
          aria-label="Search properties"
          className="text-ink placeholder:text-muted h-11 min-w-0 flex-1 bg-transparent text-[16px] outline-none [&::-webkit-search-cancel-button]:appearance-none md:h-12"
        />

        {isSearching ? (
          <LoaderCircle size={16} aria-hidden="true" className="text-brand shrink-0 animate-spin" />
        ) : term ? (
          <button
            type="button"
            onClick={() => {
              setTerm('')
              setIsOpen(false)
            }}
            aria-label="Clear search"
            className="text-muted hover:text-ink flex h-9 w-9 shrink-0 items-center justify-center"
          >
            <X size={16} aria-hidden="true" />
          </button>
        ) : null}

        <button
          type="button"
          onClick={submit}
          aria-label="Search properties"
          className="bg-brand hover:bg-brand-hover flex h-11 shrink-0 items-center justify-center gap-2 rounded-full px-4 text-[15px] font-bold text-white transition-colors md:h-12 md:px-6"
        >
          <Search size={17} aria-hidden="true" className="md:hidden" />
          <span className="hidden md:inline">Search</span>
        </button>
      </div>

      {isOpen && isQueryReady ? (
        <div
          className={clsx(
            'animate-fade-in absolute inset-x-0 z-50 overflow-hidden rounded-xl bg-white text-left shadow-2xl',
            resultsAbove ? 'bottom-full mb-2' : 'top-full mt-2'
          )}
        >
          {matches.length > 0 ? (
            <ul>
              {matches.map(property => {
                const [cover] = property.images
                return (
                  <li key={property.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false)
                        router.push(`/properties/${property.slug}`)
                      }}
                      className="hover:bg-surface flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors"
                    >
                      <span className="bg-surface relative h-16 w-14 shrink-0 overflow-hidden rounded">
                        {cover ? (
                          <Image
                            src={propertyCardImage(cover)}
                            alt=""
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="text-ink block truncate text-[15px] font-semibold">
                          {property.title}
                        </span>
                        <span className="text-muted block text-[13px]">
                          {property.location}, {property.state}
                        </span>
                      </span>
                      <span className="text-ink shrink-0 text-[14px] font-bold">
                        {displayPriceCompact(property.price, property.price_label)}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : !isSearching ? (
            <p className="text-muted px-4 py-6 text-center text-[14px]">
              Nothing matches “{query}”. Try an area or a property type.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
