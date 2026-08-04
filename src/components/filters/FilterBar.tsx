'use client'

import clsx from 'clsx'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import {
  BEDROOM_FILTER_OPTIONS,
  SEARCH_DEBOUNCE_MS,
  FURNISHED_STATES,
  LOCATIONS_BY_ZONE,
  TITLE_DOCUMENTS,
  PROPERTY_TYPES,
  type FurnishedState,
  type PropertyLocation,
  type TitleDocument,
  type PropertyType,
} from '@/lib/constants'
import { formatNairaCompact } from '@/lib/format'
import {
  DATE_ADDED_PRESETS,
  EMPTY_FILTERS,
  PRICE_PRESETS,
  SORT_OPTIONS,
} from '@/lib/property-filters'
import type { PropertyFilters, PropertySort } from '@/lib/types'

type FilterKey = 'location' | 'price' | 'beds' | 'type' | 'title' | 'more'

interface FilterBarProps {
  filters: PropertyFilters
  total: number
  onChange: (next: PropertyFilters) => void
}

function toggleEntry<T>(values: T[], entry: T): T[] {
  return values.includes(entry) ? values.filter(value => value !== entry) : [...values, entry]
}

function Chip({
  label,
  summary,
  isOpen,
  onClick,
}: {
  label: string
  summary: string | null
  isOpen: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={isOpen}
      className={clsx(
        'flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-4 text-[14px] font-medium whitespace-nowrap transition-colors',
        summary || isOpen ? 'border-brand text-brand bg-surface' : 'text-ink hover:border-ink'
      )}
    >
      {summary ?? label}
      <ChevronDown
        size={14}
        aria-hidden="true"
        className={clsx('transition-transform', isOpen && 'rotate-180')}
      />
    </button>
  )
}

function OptionRow({
  label,
  checked,
  onToggle,
}: {
  label: string
  checked: boolean
  onToggle: () => void
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[14px]">
      <input type="checkbox" checked={checked} onChange={onToggle} className="sr-only" />
      <span
        aria-hidden="true"
        className={clsx(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border transition-colors',
          checked ? 'bg-brand border-brand text-white' : 'bg-white'
        )}
      >
        {checked ? <Check size={13} strokeWidth={3} /> : null}
      </span>
      <span className="text-ink">{label}</span>
    </label>
  )
}

function PanelLabel({ children }: { children: string }) {
  return <p className="text-muted text-eyebrow mb-3 font-semibold uppercase">{children}</p>
}

function BedroomScale({
  label,
  value,
  onSelect,
}: {
  label: string
  value: number | null
  onSelect: (next: number | null) => void
}) {
  return (
    <div>
      <PanelLabel>{label}</PanelLabel>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={clsx(
            'h-11 min-w-11 rounded-full border px-4 text-[14px] font-medium transition-colors',
            value === null ? 'bg-ink border-ink text-white' : 'text-ink hover:border-ink'
          )}
        >
          Any
        </button>
        {BEDROOM_FILTER_OPTIONS.map(count => (
          <button
            key={count}
            type="button"
            onClick={() => onSelect(value === count ? null : count)}
            className={clsx(
              'h-11 min-w-11 rounded-full border px-4 text-[14px] font-medium transition-colors',
              value === count ? 'bg-ink border-ink text-white' : 'text-ink hover:border-ink'
            )}
          >
            {count}
          </button>
        ))}
      </div>
    </div>
  )
}

export function FilterBar({ filters, total, onChange }: FilterBarProps) {
  const [openPanel, setOpenPanel] = useState<FilterKey | null>(null)

  const [queryDraft, setQueryDraft] = useState(filters.query)
  const debouncedQuery = useDebouncedValue(queryDraft, SEARCH_DEBOUNCE_MS)

  const [minDraft, setMinDraft] = useState(filters.minPrice?.toString() ?? '')
  const [maxDraft, setMaxDraft] = useState(filters.maxPrice?.toString() ?? '')
  const debouncedMin = useDebouncedValue(minDraft, 450)
  const debouncedMax = useDebouncedValue(maxDraft, 450)

  const latest = useRef({ filters, onChange })

  useEffect(() => {
    latest.current = { filters, onChange }
  })

  useEffect(() => {
    const parse = (value: string) => {
      if (value === '') return null
      const parsed = Number.parseInt(value, 10)
      return Number.isFinite(parsed) ? parsed : null
    }

    const nextMin = parse(debouncedMin)
    const nextMax = parse(debouncedMax)
    const current = latest.current
    if (nextMin === current.filters.minPrice && nextMax === current.filters.maxPrice) return

    current.onChange({ ...current.filters, minPrice: nextMin, maxPrice: nextMax })
  }, [debouncedMin, debouncedMax])

  useEffect(() => {
    const current = latest.current
    const trimmed = debouncedQuery.trim()
    if (trimmed === current.filters.query) return

    current.onChange({ ...current.filters, query: trimmed })
  }, [debouncedQuery])

  const applyPricePreset = (min: number | null, max: number | null) => {
    setMinDraft(min?.toString() ?? '')
    setMaxDraft(max?.toString() ?? '')
    onChange({ ...filters, minPrice: min, maxPrice: max })
  }

  const bedroomSummary = () => {
    const { minBedrooms: low, maxBedrooms: high } = filters
    if (low === null && high === null) return null
    if (low !== null && high !== null) return low === high ? `${low} bed` : `${low}–${high} beds`
    if (low !== null) return `${low}+ beds`
    return `Up to ${high} beds`
  }

  const extraCount =
    (filters.servicedOnly ? 1 : 0) +
    (filters.addedWithinDays !== null ? 1 : 0) +
    filters.furnished.length

  const summaries: Record<FilterKey, string | null> = {
    location: filters.locations.length
      ? filters.locations.length === 1
        ? filters.locations[0]
        : `${filters.locations.length} areas`
      : null,
    price:
      filters.minPrice !== null || filters.maxPrice !== null
        ? `${filters.minPrice !== null ? formatNairaCompact(filters.minPrice) : 'Any'} – ${filters.maxPrice !== null ? formatNairaCompact(filters.maxPrice) : 'Any'}`
        : null,
    beds: bedroomSummary(),
    type: filters.propertyTypes.length
      ? filters.propertyTypes.length === 1
        ? filters.propertyTypes[0]
        : `${filters.propertyTypes.length} types`
      : null,
    title: filters.titleDocuments.length
      ? filters.titleDocuments.length === 1
        ? filters.titleDocuments[0]
        : `${filters.titleDocuments.length} titles`
      : null,
    more: extraCount > 0 ? `More · ${extraCount}` : null,
  }

  const hasAnyFilter = Object.values(summaries).some(Boolean)

  const clearAll = () => {
    setQueryDraft('')
    setMinDraft('')
    setMaxDraft('')
    setOpenPanel(null)
    onChange({ ...EMPTY_FILTERS, sort: filters.sort })
  }

  const togglePanel = (key: FilterKey) => setOpenPanel(current => (current === key ? null : key))

  return (
    <div className="bg-canvas/95 sticky top-16 z-30 backdrop-blur-md">
      <div className="app-shell">
        <div className="flex items-center gap-3 py-3">
          <div className="focus-within:border-ink relative flex h-11 flex-1 items-center gap-2.5 rounded-full border px-4 transition-colors">
            <Search size={16} className="text-ink shrink-0" aria-hidden="true" />
            <input
              type="search"
              value={queryDraft}
              onChange={event => setQueryDraft(event.target.value)}
              placeholder="Search by area, street or property type"
              aria-label="Search properties"
              className="text-ink placeholder:text-muted h-full min-w-0 flex-1 bg-transparent text-[14px] outline-none [&::-webkit-search-cancel-button]:appearance-none"
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

          <p
            className="text-muted hidden shrink-0 text-[13px] tabular-nums md:block"
            aria-live="polite"
          >
            {total} {total === 1 ? 'result' : 'results'}
          </p>

          <label className="hidden shrink-0 items-center gap-2 md:flex">
            <span className="text-muted text-[13px]">Sort</span>
            <select
              value={filters.sort}
              onChange={event => onChange({ ...filters, sort: event.target.value as PropertySort })}
              aria-label="Sort results"
              className="text-ink h-11 rounded-full border bg-white px-3 text-[14px] outline-none"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-3 md:mx-0 md:px-0">
          <Chip
            label="Location"
            summary={summaries.location}
            isOpen={openPanel === 'location'}
            onClick={() => togglePanel('location')}
          />
          <Chip
            label="Price"
            summary={summaries.price}
            isOpen={openPanel === 'price'}
            onClick={() => togglePanel('price')}
          />
          <Chip
            label="Bedrooms"
            summary={summaries.beds}
            isOpen={openPanel === 'beds'}
            onClick={() => togglePanel('beds')}
          />
          <Chip
            label="Property type"
            summary={summaries.type}
            isOpen={openPanel === 'type'}
            onClick={() => togglePanel('type')}
          />
          <Chip
            label="Title document"
            summary={summaries.title}
            isOpen={openPanel === 'title'}
            onClick={() => togglePanel('title')}
          />
          <Chip
            label="More filters"
            summary={summaries.more}
            isOpen={openPanel === 'more'}
            onClick={() => togglePanel('more')}
          />

          {hasAnyFilter ? (
            <button
              type="button"
              onClick={clearAll}
              className="text-muted hover:text-brand flex h-11 shrink-0 items-center gap-1.5 px-3 text-[14px] font-medium whitespace-nowrap transition-colors"
            >
              <X size={14} aria-hidden="true" />
              Clear
            </button>
          ) : null}
        </div>

        {openPanel ? (
          <div className="py-5">
            {openPanel === 'location' ? (
              <div className="space-y-5">
                {(Object.keys(LOCATIONS_BY_ZONE) as (keyof typeof LOCATIONS_BY_ZONE)[]).map(
                  zone => (
                    <div key={zone}>
                      <PanelLabel>{zone}</PanelLabel>
                      <div className="grid grid-cols-2 gap-x-6 md:grid-cols-4 lg:grid-cols-5">
                        {LOCATIONS_BY_ZONE[zone].map(location => (
                          <OptionRow
                            key={location}
                            label={location}
                            checked={filters.locations.includes(location)}
                            onToggle={() =>
                              onChange({
                                ...filters,
                                locations: toggleEntry<PropertyLocation>(
                                  filters.locations,
                                  location
                                ),
                              })
                            }
                          />
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : null}

            {openPanel === 'title' ? (
              <div className="grid grid-cols-2 gap-x-6 md:grid-cols-4">
                {TITLE_DOCUMENTS.map(document => (
                  <OptionRow
                    key={document}
                    label={document}
                    checked={filters.titleDocuments.includes(document)}
                    onToggle={() =>
                      onChange({
                        ...filters,
                        titleDocuments: toggleEntry<TitleDocument>(
                          filters.titleDocuments,
                          document
                        ),
                      })
                    }
                  />
                ))}
              </div>
            ) : null}

            {openPanel === 'price' ? (
              <div className="space-y-5">
                <div>
                  <PanelLabel>Popular ranges</PanelLabel>
                  <div className="flex flex-wrap gap-2">
                    {PRICE_PRESETS.map(preset => {
                      const isActive =
                        filters.minPrice === preset.min && filters.maxPrice === preset.max
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() =>
                            isActive
                              ? applyPricePreset(null, null)
                              : applyPricePreset(preset.min, preset.max)
                          }
                          className={clsx(
                            'h-11 rounded-full border px-4 text-[14px] font-medium transition-colors',
                            isActive ? 'bg-ink border-ink text-white' : 'text-ink hover:border-ink'
                          )}
                        >
                          {preset.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <PanelLabel>Or set your own</PanelLabel>
                  <div className="flex max-w-sm items-center gap-3">
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={minDraft}
                      onChange={event => setMinDraft(event.target.value)}
                      placeholder="Min ₦"
                      aria-label="Minimum price in Naira"
                      className="focus:border-brand h-11 w-full min-w-0 rounded-full border px-4 text-[14px] outline-none"
                    />
                    <span className="text-muted" aria-hidden="true">
                      –
                    </span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={maxDraft}
                      onChange={event => setMaxDraft(event.target.value)}
                      placeholder="Max ₦"
                      aria-label="Maximum price in Naira"
                      className="focus:border-brand h-11 w-full min-w-0 rounded-full border px-4 text-[14px] outline-none"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {openPanel === 'beds' ? (
              <div className="grid gap-6 md:grid-cols-2">
                <BedroomScale
                  label="Minimum"
                  value={filters.minBedrooms}
                  onSelect={next =>
                    onChange({
                      ...filters,
                      minBedrooms: next,

                      maxBedrooms:
                        next !== null && filters.maxBedrooms !== null && filters.maxBedrooms < next
                          ? next
                          : filters.maxBedrooms,
                    })
                  }
                />
                <BedroomScale
                  label="Maximum"
                  value={filters.maxBedrooms}
                  onSelect={next =>
                    onChange({
                      ...filters,
                      maxBedrooms: next,
                      minBedrooms:
                        next !== null && filters.minBedrooms !== null && filters.minBedrooms > next
                          ? next
                          : filters.minBedrooms,
                    })
                  }
                />
              </div>
            ) : null}

            {openPanel === 'type' ? (
              <div className="grid grid-cols-2 gap-x-6 md:grid-cols-5">
                {PROPERTY_TYPES.map(propertyType => (
                  <OptionRow
                    key={propertyType}
                    label={propertyType}
                    checked={filters.propertyTypes.includes(propertyType)}
                    onToggle={() =>
                      onChange({
                        ...filters,
                        propertyTypes: toggleEntry<PropertyType>(
                          filters.propertyTypes,
                          propertyType
                        ),
                      })
                    }
                  />
                ))}
              </div>
            ) : null}

            {openPanel === 'more' ? (
              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <PanelLabel>Furnishing</PanelLabel>
                  {FURNISHED_STATES.map(state => (
                    <OptionRow
                      key={state}
                      label={state}
                      checked={filters.furnished.includes(state)}
                      onToggle={() =>
                        onChange({
                          ...filters,
                          furnished: toggleEntry<FurnishedState>(filters.furnished, state),
                        })
                      }
                    />
                  ))}
                </div>

                <div>
                  <PanelLabel>Serviced</PanelLabel>
                  <OptionRow
                    label="Serviced only"
                    checked={filters.servicedOnly}
                    onToggle={() => onChange({ ...filters, servicedOnly: !filters.servicedOnly })}
                  />
                </div>

                <div>
                  <PanelLabel>Date added</PanelLabel>
                  <div className="flex flex-wrap gap-2">
                    {DATE_ADDED_PRESETS.map(preset => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => onChange({ ...filters, addedWithinDays: preset.days })}
                        className={clsx(
                          'h-10 rounded-full border px-3.5 text-[13px] font-medium transition-colors',
                          filters.addedWithinDays === preset.days
                            ? 'bg-ink border-ink text-white'
                            : 'text-ink hover:border-ink'
                        )}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
