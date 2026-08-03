'use client'

import { ChevronDown, Search, SlidersHorizontal } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useSearchOverlay } from '@/components/search/SearchProvider'
import {
  BEDROOM_FILTER_OPTIONS,
  PROPERTY_LOCATIONS,
  PROPERTY_TYPES,
  type PropertyLocation,
  type PropertyType,
} from '@/lib/constants'
import { PRICE_PRESETS } from '@/lib/property-filters'

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

export function HeroSearchForm() {
  const router = useRouter()
  const { openSearch } = useSearchOverlay()

  const [location, setLocation] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [priceBand, setPriceBand] = useState('')
  const [bedrooms, setBedrooms] = useState('')

  const submit = () => {
    const params = new URLSearchParams()
    if (location) params.set('location', location)
    if (propertyType) params.set('type', propertyType)
    if (bedrooms) params.set('beds', bedrooms)

    const preset = PRICE_PRESETS.find(entry => entry.label === priceBand)
    if (preset?.min !== null && preset?.min !== undefined) params.set('min', String(preset.min))
    if (preset?.max !== null && preset?.max !== undefined) params.set('max', String(preset.max))

    const query = params.toString()
    router.push(query ? `/properties?${query}` : '/properties')
  }

  return (
    <div className="w-full max-w-4xl">
      <div className="rounded-xl bg-white p-2 shadow-2xl md:p-2.5">
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

        <div className="border-hairline mt-1 border-t px-4 py-2.5 md:px-5">
          <button
            type="button"
            onClick={openSearch}
            className="text-ink hover:text-brand flex items-center gap-2 text-[13px] font-semibold transition-colors"
          >
            <SlidersHorizontal size={14} aria-hidden="true" />
            More search options
          </button>
        </div>
      </div>
    </div>
  )
}
