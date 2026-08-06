'use client'

import clsx from 'clsx'
import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useIsDesktop } from '@/hooks/useIsDesktop'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
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

type FilterKey = 'location' | 'price' | 'beds' | 'type' | 'title' | 'more' | 'sort'

const PANEL_TITLES: Record<FilterKey, string> = {
  location: 'Area',
  price: 'Price',
  beds: 'Bedrooms',
  type: 'Property type',
  title: 'Title document',
  more: 'More filters',
  sort: 'Sort',
}

interface FilterBarProps {
  filters: PropertyFilters
  onChange: (next: PropertyFilters) => void
}

function toggleEntry<T>(values: T[], entry: T): T[] {
  return values.includes(entry) ? values.filter(value => value !== entry) : [...values, entry]
}

/*
  Every control in this bar is the same object: a pill. Chips open a panel, pills
  inside the panel set values. Nothing else — no checkbox lists, no native selects.
*/
function Pill({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={clsx(
        'h-11 rounded-pill border px-4 text-[14px] font-medium whitespace-nowrap transition-colors',
        selected
          ? 'bg-brand border-brand text-brand-ink'
          : 'border-hairline text-ink hover:border-ink'
      )}
    >
      {label}
    </button>
  )
}

function PillGroup({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div>
      {label ? <p className="text-muted mb-2.5 text-[12px] font-semibold">{label}</p> : null}
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
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
        'flex h-10 shrink-0 items-center gap-1.5 rounded-pill border px-3.5 text-[13.5px] font-medium whitespace-nowrap transition-colors',
        summary
          ? 'bg-brand border-brand text-brand-ink'
          : isOpen
            ? 'border-ink text-ink'
            : 'border-hairline text-ink hover:border-ink'
      )}
    >
      {summary ?? label}
      <ChevronDown
        size={14}
        aria-hidden="true"
        className={clsx('shrink-0 transition-transform', isOpen && 'rotate-180')}
      />
    </button>
  )
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const [openPanel, setOpenPanel] = useState<FilterKey | null>(null)
  const [panelTop, setPanelTop] = useState(0)
  const isDesktop = useIsDesktop()
  const barRef = useRef<HTMLDivElement>(null)

  useLockBodyScroll(openPanel !== null && !isDesktop)

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

  useEffect(() => {
    if (!openPanel) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenPanel(null)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [openPanel])

  // The dropdown is portalled, so it cannot inherit the bar's position. Track the
  // bar's bottom edge instead — it moves until the bar sticks under the header.
  useEffect(() => {
    if (!openPanel || !isDesktop) return

    const trackBarEdge = () => {
      const bar = barRef.current
      if (bar) setPanelTop(bar.getBoundingClientRect().bottom)
    }

    trackBarEdge()
    window.addEventListener('scroll', trackBarEdge, { passive: true })
    window.addEventListener('resize', trackBarEdge)
    return () => {
      window.removeEventListener('scroll', trackBarEdge)
      window.removeEventListener('resize', trackBarEdge)
    }
  }, [openPanel, isDesktop])

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

  const extraCount = (filters.addedWithinDays !== null ? 1 : 0) + filters.furnished.length

  const summaries: Record<FilterKey, string | null> = {
    location: filters.locations.length
      ? filters.locations.length === 1
        ? filters.locations[0]
        : `${filters.locations.length} areas`
      : null,
    price:
      filters.minPrice !== null || filters.maxPrice !== null
        ? `${filters.minPrice !== null ? formatNairaCompact(filters.minPrice) : 'Any'}–${filters.maxPrice !== null ? formatNairaCompact(filters.maxPrice) : 'Any'}`
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
    sort:
      filters.sort === 'newest'
        ? null
        : (SORT_OPTIONS.find(option => option.value === filters.sort)?.label ?? null),
  }

  const hasAnyFilter = Object.values(summaries).some(Boolean) || filters.query.length > 0

  const clearAll = () => {
    setQueryDraft('')
    setMinDraft('')
    setMaxDraft('')
    setOpenPanel(null)
    onChange({ ...EMPTY_FILTERS })
  }

  const clearPanel = (key: FilterKey) => {
    if (key === 'price') {
      setMinDraft('')
      setMaxDraft('')
      onChange({ ...filters, minPrice: null, maxPrice: null })
      return
    }

    const resets: Record<Exclude<FilterKey, 'price'>, Partial<PropertyFilters>> = {
      location: { locations: [] },
      beds: { minBedrooms: null, maxBedrooms: null },
      type: { propertyTypes: [] },
      title: { titleDocuments: [] },
      more: { furnished: [], addedWithinDays: null },
      sort: { sort: 'newest' },
    }

    onChange({ ...filters, ...resets[key] })
  }

  const togglePanel = (key: FilterKey) => setOpenPanel(current => (current === key ? null : key))

  const panelBody = (key: FilterKey) => {
    if (key === 'location') {
      return (
        <div className="space-y-5">
          {(Object.keys(LOCATIONS_BY_ZONE) as (keyof typeof LOCATIONS_BY_ZONE)[]).map(zone => (
            <PillGroup key={zone} label={zone}>
              {LOCATIONS_BY_ZONE[zone].map(location => (
                <Pill
                  key={location}
                  label={location}
                  selected={filters.locations.includes(location)}
                  onClick={() =>
                    onChange({
                      ...filters,
                      locations: toggleEntry<PropertyLocation>(filters.locations, location),
                    })
                  }
                />
              ))}
            </PillGroup>
          ))}
        </div>
      )
    }

    if (key === 'price') {
      return (
        <div className="space-y-5">
          <PillGroup label="Popular ranges">
            {PRICE_PRESETS.map(preset => {
              const isActive = filters.minPrice === preset.min && filters.maxPrice === preset.max
              return (
                <Pill
                  key={preset.label}
                  label={preset.label}
                  selected={isActive}
                  onClick={() =>
                    isActive
                      ? applyPricePreset(null, null)
                      : applyPricePreset(preset.min, preset.max)
                  }
                />
              )
            })}
          </PillGroup>

          <PillGroup label="Or set your own">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={minDraft}
              onChange={event => setMinDraft(event.target.value)}
              placeholder="Min ₦"
              aria-label="Minimum price in Naira"
              className="border-hairline focus:border-ink text-ink placeholder:text-muted h-11 w-32 rounded-pill border px-4 text-[16px] outline-none transition-colors"
            />
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={maxDraft}
              onChange={event => setMaxDraft(event.target.value)}
              placeholder="Max ₦"
              aria-label="Maximum price in Naira"
              className="border-hairline focus:border-ink text-ink placeholder:text-muted h-11 w-32 rounded-pill border px-4 text-[16px] outline-none transition-colors"
            />
          </PillGroup>
        </div>
      )
    }

    if (key === 'beds') {
      return (
        <div className="space-y-5">
          <PillGroup label="Minimum">
            <Pill
              label="Any"
              selected={filters.minBedrooms === null}
              onClick={() => onChange({ ...filters, minBedrooms: null })}
            />
            {BEDROOM_FILTER_OPTIONS.map(count => (
              <Pill
                key={count}
                label={String(count)}
                selected={filters.minBedrooms === count}
                onClick={() =>
                  onChange({
                    ...filters,
                    minBedrooms: filters.minBedrooms === count ? null : count,
                    maxBedrooms:
                      filters.maxBedrooms !== null && filters.maxBedrooms < count
                        ? count
                        : filters.maxBedrooms,
                  })
                }
              />
            ))}
          </PillGroup>

          <PillGroup label="Maximum">
            <Pill
              label="Any"
              selected={filters.maxBedrooms === null}
              onClick={() => onChange({ ...filters, maxBedrooms: null })}
            />
            {BEDROOM_FILTER_OPTIONS.map(count => (
              <Pill
                key={count}
                label={String(count)}
                selected={filters.maxBedrooms === count}
                onClick={() =>
                  onChange({
                    ...filters,
                    maxBedrooms: filters.maxBedrooms === count ? null : count,
                    minBedrooms:
                      filters.minBedrooms !== null && filters.minBedrooms > count
                        ? count
                        : filters.minBedrooms,
                  })
                }
              />
            ))}
          </PillGroup>
        </div>
      )
    }

    if (key === 'type') {
      return (
        <PillGroup>
          {PROPERTY_TYPES.map(propertyType => (
            <Pill
              key={propertyType}
              label={propertyType}
              selected={filters.propertyTypes.includes(propertyType)}
              onClick={() =>
                onChange({
                  ...filters,
                  propertyTypes: toggleEntry<PropertyType>(filters.propertyTypes, propertyType),
                })
              }
            />
          ))}
        </PillGroup>
      )
    }

    if (key === 'title') {
      return (
        <PillGroup>
          {TITLE_DOCUMENTS.map(document => (
            <Pill
              key={document}
              label={document}
              selected={filters.titleDocuments.includes(document)}
              onClick={() =>
                onChange({
                  ...filters,
                  titleDocuments: toggleEntry<TitleDocument>(filters.titleDocuments, document),
                })
              }
            />
          ))}
        </PillGroup>
      )
    }

    if (key === 'sort') {
      return (
        <PillGroup>
          {SORT_OPTIONS.map(option => (
            <Pill
              key={option.value}
              label={option.label}
              selected={filters.sort === option.value}
              onClick={() => {
                onChange({ ...filters, sort: option.value as PropertySort })
                setOpenPanel(null)
              }}
            />
          ))}
        </PillGroup>
      )
    }

    return (
      <div className="space-y-5">
        <PillGroup label="Furnishing">
          {FURNISHED_STATES.map(state => (
            <Pill
              key={state}
              label={state}
              selected={filters.furnished.includes(state)}
              onClick={() =>
                onChange({
                  ...filters,
                  furnished: toggleEntry<FurnishedState>(filters.furnished, state),
                })
              }
            />
          ))}
        </PillGroup>

        <PillGroup label="Date added">
          {DATE_ADDED_PRESETS.map(preset => (
            <Pill
              key={preset.label}
              label={preset.label}
              selected={filters.addedWithinDays === preset.days}
              onClick={() => onChange({ ...filters, addedWithinDays: preset.days })}
            />
          ))}
        </PillGroup>
      </div>
    )
  }

  return (
    <div ref={barRef} className="sticky top-16 z-30">
      <div className="bg-canvas/95 border-hairline border-b backdrop-blur-md">
        <div className="app-shell">
          <div className="flex items-center gap-2 py-2.5 md:gap-3">
            <div className="border-hairline focus-within:border-ink relative flex h-10 flex-1 items-center gap-2 rounded-pill border px-3.5 transition-colors md:h-11">
              <Search size={15} className="text-muted shrink-0" aria-hidden="true" />
              <input
                type="search"
                value={queryDraft}
                onChange={event => setQueryDraft(event.target.value)}
                placeholder="Search area, street or type"
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

            {hasAnyFilter ? (
              <button
                type="button"
                onClick={clearAll}
                className="text-muted hover:text-brand flex h-10 shrink-0 items-center gap-1 text-[13.5px] font-medium whitespace-nowrap transition-colors md:h-11"
              >
                <X size={14} aria-hidden="true" />
                Clear
              </button>
            ) : null}
          </div>

          {/* The rail bleeds to the page edge at every width so a chip that runs
              past the fold reads as scrollable rather than clipped. */}
          <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-2.5 md:-mx-6 md:px-6 lg:-mx-12 lg:px-12">
            <span className="text-muted hidden shrink-0 items-center gap-1.5 pr-1 text-[13px] font-semibold md:flex">
              <SlidersHorizontal size={14} aria-hidden="true" />
              Filter
            </span>

            {(Object.keys(PANEL_TITLES) as FilterKey[]).map(key => (
              <Chip
                key={key}
                label={PANEL_TITLES[key]}
                summary={summaries[key]}
                isOpen={openPanel === key}
                onClick={() => togglePanel(key)}
              />
            ))}
          </div>
        </div>
      </div>

      {openPanel
        ? createPortal(
            <>
              <button
                type="button"
                aria-label="Close filters"
                onClick={() => setOpenPanel(null)}
                className="fixed inset-0 z-[55] bg-black/35 md:bg-transparent"
              />

              <div
                role="dialog"
                aria-modal={!isDesktop}
                aria-label={PANEL_TITLES[openPanel]}
                style={isDesktop ? { top: panelTop } : undefined}
                className={clsx(
                  // Portalled out of the sticky bar's stacking context so it clears
                  // the bottom tab bar; on desktop it hangs off the measured bar edge.
                  'fixed inset-x-0 bottom-0 z-[60] flex max-h-[80vh] flex-col bg-white',
                  'rounded-t-sheet shadow-sheet animate-sheet-up',
                  'md:animate-fade-in md:border-hairline md:bottom-auto md:max-h-[70vh] md:rounded-none md:rounded-b-card md:border-b md:shadow-card-hover'
                )}
              >
                <div className="border-hairline shrink-0 border-b md:hidden">
                  <div className="app-shell flex items-center justify-between py-3">
                    <p className="text-ink text-[15px] font-bold">{PANEL_TITLES[openPanel]}</p>
                    <button
                      type="button"
                      onClick={() => setOpenPanel(null)}
                      aria-label="Close filters"
                      className="text-muted hover:text-ink -mr-2 flex h-10 w-10 items-center justify-center"
                    >
                      <X size={18} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto py-4 md:py-5">
                  <div className="app-shell">{panelBody(openPanel)}</div>
                </div>

                <div className="border-hairline safe-bottom shrink-0 border-t">
                  <div className="app-shell flex items-center justify-between gap-3 py-3">
                    <button
                      type="button"
                      onClick={() => clearPanel(openPanel)}
                      className="text-muted hover:text-ink h-11 text-[14px] font-semibold transition-colors"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpenPanel(null)}
                      className="bg-brand hover:bg-brand-hover rounded-pill h-11 px-6 text-[14px] font-bold text-white transition-colors"
                    >
                      Show results
                    </button>
                  </div>
                </div>
              </div>
            </>,
            document.body
          )
        : null}
    </div>
  )
}
