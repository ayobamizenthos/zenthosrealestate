'use client'

import { ChevronDown, LoaderCircle, Search, X } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { propertyCardImage } from '@/lib/cloudinary'
import {
  BEDROOM_FILTER_OPTIONS,
  LOCATION_LANDING_PAGES,
  PROPERTY_LOCATIONS,
  PROPERTY_TYPES,
  SEARCH_DEBOUNCE_MS,
  SEARCH_MIN_CHARS,
  type PropertyLocation,
  type PropertyType,
} from '@/lib/constants'
import { displayPriceCompact } from '@/lib/format'
import { PRICE_PRESETS } from '@/lib/property-filters'
import { searchProperties } from '@/lib/queries/properties'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { PropertySummary } from '@/lib/types'

/** One column of the search card: uppercase label above a borderless select. */
function Field({
  label,
  value,
  onChange,
  children,
  className,
}: {
  label: string
  value: string
  onChange: (next: string) => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`relative flex-1 px-4 py-3 md:px-5 ${className ?? ''}`}>
      <label className="text-muted block text-[11px] font-bold tracking-wider uppercase">
        {label}
      </label>
      <div className="relative mt-1 flex items-center">
        <select
          value={value}
          onChange={event => onChange(event.target.value)}
          aria-label={label}
          className="text-ink w-full cursor-pointer appearance-none bg-transparent pr-6 text-[15px] font-semibold outline-none"
        >
          {children}
        </select>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className="text-muted pointer-events-none absolute right-0"
        />
      </div>
    </div>
  )
}

/**
 * The single place anyone searches from. Free text, the four structured
 * filters and the area shortcuts all live in one card, so a buyer never has to
 * hunt the header for a second search box that did the same job.
 */
export function HeroSearchForm() {
  const router = useRouter()
  const cardRef = useRef<HTMLDivElement>(null)

  const [term, setTerm] = useState('')
  const [location, setLocation] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [priceBand, setPriceBand] = useState('')
  const [bedrooms, setBedrooms] = useState('')

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
    searchProperties(createSupabaseBrowserClient(), query, 5)
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

  const matches = isQueryReady && resolved.query === query ? resolved.matches : []
  const isSearching = isQueryReady && resolved.query !== query

  const submit = () => {
    const params = new URLSearchParams()
    if (term.trim()) params.set('q', term.trim())
    if (location) params.set('location', location)
    if (propertyType) params.set('type', propertyType)
    if (bedrooms) params.set('beds', bedrooms)

    const preset = PRICE_PRESETS.find(entry => entry.label === priceBand)
    if (preset?.min !== null && preset?.min !== undefined) params.set('min', String(preset.min))
    if (preset?.max !== null && preset?.max !== undefined) params.set('max', String(preset.max))

    const search = params.toString()
    setIsOpen(false)
    router.push(search ? `/properties?${search}` : '/properties')
  }

  return (
    <div ref={cardRef} className="relative w-full max-w-4xl">
      <div className="rounded-xl bg-white p-2 shadow-2xl md:p-2.5">
        {/* Free text sits above the structured filters: most people describe
            what they want before they know which dropdown holds it. */}
        <div className="border-hairline flex items-center gap-2.5 border-b px-3 py-2.5 md:px-4">
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
            placeholder="Try “3 bedroom Lekki”, “detached duplex” or a ZEN reference"
            aria-label="Search properties"
            className="text-ink placeholder:text-muted h-9 min-w-0 flex-1 bg-transparent text-[15px] outline-none [&::-webkit-search-cancel-button]:appearance-none"
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
          <Field label="Location" value={location} onChange={setLocation}>
            <option value="">Any area</option>
            {PROPERTY_LOCATIONS.map((entry: PropertyLocation) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </Field>

          <span className="bg-hairline hidden w-px shrink-0 md:block" aria-hidden="true" />

          <Field label="Property type" value={propertyType} onChange={setPropertyType}>
            <option value="">Any type</option>
            {PROPERTY_TYPES.map((entry: PropertyType) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </Field>

          <span className="bg-hairline hidden w-px shrink-0 md:block" aria-hidden="true" />

          <Field label="Price range" value={priceBand} onChange={setPriceBand}>
            <option value="">Any price</option>
            {PRICE_PRESETS.map(preset => (
              <option key={preset.label} value={preset.label}>
                {preset.label}
              </option>
            ))}
          </Field>

          <span className="bg-hairline hidden w-px shrink-0 md:block" aria-hidden="true" />

          <Field label="Bedrooms" value={bedrooms} onChange={setBedrooms}>
            <option value="">Any beds</option>
            {BEDROOM_FILTER_OPTIONS.map(count => (
              <option key={count} value={String(count)}>
                {count}+ bedrooms
              </option>
            ))}
          </Field>

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

        <div className="border-hairline scrollbar-none flex gap-2 overflow-x-auto border-t px-3 py-2.5 md:px-4">
          {LOCATION_LANDING_PAGES.map(area => (
            <button
              key={area.slug}
              type="button"
              onClick={() => router.push(`/properties/${area.slug}`)}
              className="border-hairline text-ink hover:border-ink hover:bg-surface shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium whitespace-nowrap transition-colors"
            >
              {area.name}
            </button>
          ))}
        </div>
      </div>

      {isOpen && isQueryReady ? (
        <div className="border-hairline animate-fade-in absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-xl border bg-white text-left shadow-2xl">
          {matches.length > 0 ? (
            <ul className="max-h-[20rem] overflow-y-auto">
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
                      className="hover:bg-surface flex w-full items-center gap-3 px-4 py-3 text-left transition-colors"
                    >
                      <span className="bg-surface relative h-14 w-12 shrink-0 overflow-hidden rounded">
                        {cover ? (
                          <Image
                            src={propertyCardImage(cover)}
                            alt=""
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="text-ink block truncate text-[14px] font-semibold">
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
