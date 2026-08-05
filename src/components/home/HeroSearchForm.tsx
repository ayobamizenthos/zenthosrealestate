'use client'

import clsx from 'clsx'
import { LoaderCircle, Search, X } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { propertyCardImage } from '@/lib/cloudinary'
import {
  BEDROOM_FILTER_OPTIONS,
  LOCATION_LANDING_PAGES,
  LOCATIONS_BY_ZONE,
  PROPERTY_TYPES,
  SEARCH_DEBOUNCE_MS,
  SEARCH_MIN_CHARS,
} from '@/lib/constants'
import { MultiSelect } from '@/components/ui/MultiSelect'
import { displayPriceCompact } from '@/lib/format'
import { PRICE_PRESETS } from '@/lib/property-filters'
import { searchProperties } from '@/lib/queries/properties'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { PropertySummary } from '@/lib/types'

export function HeroSearchForm() {
  const router = useRouter()
  const cardRef = useRef<HTMLDivElement>(null)
  const [resultsAbove, setResultsAbove] = useState(false)

  const [term, setTerm] = useState('')
  const [locations, setLocations] = useState<string[]>([])
  const [propertyTypes, setPropertyTypes] = useState<string[]>([])
  const [priceBands, setPriceBands] = useState<string[]>([])
  const [bedroomChoices, setBedroomChoices] = useState<string[]>([])

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

  const submit = () => {
    const params = new URLSearchParams()
    if (term.trim()) params.set('q', term.trim())
    if (locations.length) params.set('location', locations.join(','))
    if (propertyTypes.length) params.set('type', propertyTypes.join(','))

    const bedCounts = bedroomChoices
      .map(choice => Number.parseInt(choice, 10))
      .filter(Number.isFinite)
    if (bedCounts.length) params.set('beds', String(Math.min(...bedCounts)))

    const chosen = PRICE_PRESETS.filter(preset => priceBands.includes(preset.label))
    if (chosen.length) {
      const mins = chosen
        .map(preset => preset.min)
        .filter((value): value is number => value !== null)
      const maxes = chosen.map(preset => preset.max)
      if (mins.length === chosen.length) params.set('min', String(Math.min(...mins)))
      if (!maxes.includes(null)) params.set('max', String(Math.max(...(maxes as number[]))))
    }

    const search = params.toString()
    setIsOpen(false)
    router.push(search ? `/properties?${search}` : '/properties')
  }

  return (
    <div ref={cardRef} className="relative w-full max-w-4xl">
      <div className="rounded-xl bg-white p-2 shadow-2xl md:p-2.5">
        <div className="flex items-center gap-2.5 px-3 py-2.5 md:px-4">
          <Search size={18} aria-hidden="true" className="text-muted shrink-0" />
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
            placeholder="Search by area, street or property type"
            aria-label="Search properties"
            className="text-ink placeholder:text-muted h-11 min-w-0 flex-1 bg-transparent text-[15px] outline-none [&::-webkit-search-cancel-button]:appearance-none"
          />
          {isSearching ? (
            <LoaderCircle
              size={16}
              aria-hidden="true"
              className="text-brand shrink-0 animate-spin"
            />
          ) : term ? (
            <button
              type="button"
              onClick={() => {
                setTerm('')
                setIsOpen(false)
              }}
              aria-label="Clear search"
              className="text-muted hover:text-ink flex h-8 w-8 shrink-0 items-center justify-center"
            >
              <X size={16} aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <div className="flex flex-col md:flex-row md:items-stretch">
          <MultiSelect
            label="Location"
            placeholder="Anywhere in Lagos"
            searchable
            searchPlaceholder="Type an area"
            groups={[
              { label: 'Island', options: LOCATIONS_BY_ZONE.Island },
              { label: 'Mainland', options: LOCATIONS_BY_ZONE.Mainland },
            ]}
            selected={locations}
            onChange={setLocations}
          />

          <MultiSelect
            label="Property type"
            placeholder="All types"
            groups={[{ label: 'Types', options: PROPERTY_TYPES }]}
            selected={propertyTypes}
            onChange={setPropertyTypes}
          />

          <MultiSelect
            label="Price range"
            placeholder="All prices"
            groups={[{ label: 'Bands', options: PRICE_PRESETS.map(preset => preset.label) }]}
            selected={priceBands}
            onChange={setPriceBands}
          />

          <MultiSelect
            label="Bedrooms"
            placeholder="All sizes"
            groups={[
              {
                label: 'Bedrooms',
                options: BEDROOM_FILTER_OPTIONS.map(count => `${count}+ bedrooms`),
              },
            ]}
            selected={bedroomChoices}
            onChange={setBedroomChoices}
          />

          <div className="p-2 md:flex md:items-center">
            <button
              type="button"
              onClick={submit}
              className="bg-brand hover:bg-brand-hover flex h-12 w-full items-center justify-center gap-2 rounded-lg px-7 text-[15px] font-bold text-white transition-colors md:h-14"
            >
              <Search size={17} aria-hidden="true" />
              Search
            </button>
          </div>
        </div>

        <div className="scrollbar-none flex gap-2 overflow-x-auto px-3 py-2.5 md:px-4">
          {LOCATION_LANDING_PAGES.map(area => (
            <button
              key={area.slug}
              type="button"
              onClick={() => router.push(`/properties/${area.slug}`)}
              className="text-ink hover:border-ink hover:bg-surface shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium whitespace-nowrap transition-colors"
            >
              {area.name}
            </button>
          ))}
        </div>
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
