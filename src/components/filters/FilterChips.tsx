'use client'

import clsx from 'clsx'
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useIsDesktop } from '@/hooks/useIsDesktop'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import {
  BEDROOM_FILTER_OPTIONS,
  LOCATIONS_BY_ZONE,
  TITLE_DOCUMENTS,
  PROPERTY_TYPES,
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

type FilterKey = 'location' | 'price' | 'beds' | 'type' | 'title' | 'added' | 'sort'

const PANEL_TITLES: Record<FilterKey, string> = {
  location: 'Area',
  price: 'Price',
  beds: 'Bedrooms',
  type: 'Property type',
  title: 'Title document',
  added: 'Date added',
  sort: 'Sort',
}

function toggleEntry<T>(values: T[], entry: T): T[] {
  return values.includes(entry) ? values.filter(value => value !== entry) : [...values, entry]
}

/*
  Every control here is the same object: a pill. Chips open a panel, pills inside
  the panel set values. Nothing else, no checkbox lists and no native selects.
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
        'rounded-pill h-11 border px-4 text-[14px] font-medium whitespace-nowrap transition-colors',
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
  onDark,
  onClick,
}: {
  label: string
  summary: string | null
  isOpen: boolean
  onDark: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={isOpen}
      className={clsx(
        'rounded-pill flex h-10 shrink-0 items-center gap-1.5 border px-3.5 text-[13.5px] font-medium whitespace-nowrap transition-colors',
        onDark
          ? summary
            ? 'text-brand border-white bg-white'
            : isOpen
              ? 'border-white text-white'
              : 'border-white/35 text-white hover:border-white'
          : summary
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

interface FilterChipsProps {
  filters: PropertyFilters
  onChange: (next: PropertyFilters) => void
  /** The hero carries its own submit button, so it hides the rail's clear-all. */
  showClearAll?: boolean
  /** The browse rail runs to the page edge; the hero rail sits inside a card. */
  bleedToEdge?: boolean
  /** The hero sits on burgundy, where ink-on-hairline chips disappear. */
  onDark?: boolean
}

/*
  The chip rail and the panel behind it. The browse page and the home hero drive
  the same control from different state, so it lives on its own.
*/
export function FilterChips({
  filters,
  onChange,
  showClearAll = true,
  bleedToEdge = true,
  onDark = false,
}: FilterChipsProps) {
  const [openPanel, setOpenPanel] = useState<FilterKey | null>(null)
  const [panelTop, setPanelTop] = useState(0)
  const isDesktop = useIsDesktop()
  const railRef = useRef<HTMLDivElement>(null)

  const [minDraft, setMinDraft] = useState(filters.minPrice?.toString() ?? '')
  const [maxDraft, setMaxDraft] = useState(filters.maxPrice?.toString() ?? '')

  const latest = useRef({ filters, onChange })

  useEffect(() => {
    latest.current = { filters, onChange }
  })

  useLockBodyScroll(openPanel !== null && !isDesktop)

  useEffect(() => {
    if (!openPanel) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenPanel(null)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [openPanel])

  // The panel is portalled, so it cannot inherit the rail's position. Track the
  // rail's bottom edge instead; it moves until the bar sticks under the header.
  useEffect(() => {
    if (!openPanel || !isDesktop) return

    const trackRailEdge = () => {
      const rail = railRef.current
      if (rail) setPanelTop(rail.getBoundingClientRect().bottom)
    }

    trackRailEdge()
    window.addEventListener('scroll', trackRailEdge, { passive: true })
    window.addEventListener('resize', trackRailEdge)
    return () => {
      window.removeEventListener('scroll', trackRailEdge)
      window.removeEventListener('resize', trackRailEdge)
    }
  }, [openPanel, isDesktop])

  useEffect(() => {
    const parse = (value: string) => {
      if (value === '') return null
      const parsed = Number.parseInt(value, 10)
      return Number.isFinite(parsed) ? parsed : null
    }

    const nextMin = parse(minDraft)
    const nextMax = parse(maxDraft)
    const current = latest.current
    if (nextMin === current.filters.minPrice && nextMax === current.filters.maxPrice) return

    const timer = window.setTimeout(() => {
      const now = latest.current
      now.onChange({ ...now.filters, minPrice: nextMin, maxPrice: nextMax })
    }, 450)

    return () => window.clearTimeout(timer)
  }, [minDraft, maxDraft])

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
    added:
      filters.addedWithinDays === null
        ? null
        : (DATE_ADDED_PRESETS.find(preset => preset.days === filters.addedWithinDays)?.label ??
          null),
    sort:
      filters.sort === 'newest'
        ? null
        : (SORT_OPTIONS.find(option => option.value === filters.sort)?.label ?? null),
  }

  const hasAnyFilter = Object.values(summaries).some(Boolean)

  const clearAll = () => {
    setMinDraft('')
    setMaxDraft('')
    setOpenPanel(null)
    onChange({ ...EMPTY_FILTERS, query: filters.query })
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
      added: { addedWithinDays: null },
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
              className="border-hairline focus:border-ink text-ink placeholder:text-muted rounded-pill h-11 w-32 border px-4 text-[16px] outline-none transition-colors"
            />
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={maxDraft}
              onChange={event => setMaxDraft(event.target.value)}
              placeholder="Max ₦"
              aria-label="Maximum price in Naira"
              className="border-hairline focus:border-ink text-ink placeholder:text-muted rounded-pill h-11 w-32 border px-4 text-[16px] outline-none transition-colors"
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
      <PillGroup>
        {DATE_ADDED_PRESETS.map(preset => (
          <Pill
            key={preset.label}
            label={preset.label}
            selected={filters.addedWithinDays === preset.days}
            onClick={() => onChange({ ...filters, addedWithinDays: preset.days })}
          />
        ))}
      </PillGroup>
    )
  }

  return (
    <>
      {/* On the browse page the rail bleeds to the page edge so a chip past the
          fold reads as scrollable rather than clipped. */}
      <div
        ref={railRef}
        className={clsx(
          'scrollbar-none flex gap-2 overflow-x-auto',
          bleedToEdge && '-mx-4 px-4 pb-2.5 md:-mx-6 md:px-6 lg:-mx-12 lg:px-12'
        )}
      >
        {showClearAll ? (
          <span className="text-muted hidden shrink-0 items-center gap-1.5 pr-1 text-[13px] font-semibold md:flex">
            <SlidersHorizontal size={14} aria-hidden="true" />
            Filter
          </span>
        ) : null}

        {(Object.keys(PANEL_TITLES) as FilterKey[]).map(key => (
          <Chip
            key={key}
            label={PANEL_TITLES[key]}
            summary={summaries[key]}
            isOpen={openPanel === key}
            onDark={onDark}
            onClick={() => togglePanel(key)}
          />
        ))}

        {showClearAll && hasAnyFilter ? (
          <button
            type="button"
            onClick={clearAll}
            className="text-muted hover:text-ink rounded-pill flex h-10 shrink-0 items-center gap-1 px-3 text-[13.5px] font-medium whitespace-nowrap transition-colors"
          >
            <X size={14} aria-hidden="true" />
            Clear all
          </button>
        ) : null}
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
                  // Portalled out of the bar's stacking context so it clears the
                  // bottom tab bar; on desktop it hangs off the measured edge.
                  'fixed inset-x-0 bottom-0 z-[60] flex max-h-[80vh] flex-col bg-white',
                  'rounded-t-sheet shadow-sheet animate-sheet-up',
                  'md:animate-fade-in md:border-hairline md:rounded-b-card md:bottom-auto md:max-h-[70vh] md:rounded-none md:border-b md:shadow-card-hover'
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
                      disabled={!summaries[openPanel]}
                      className="border-hairline text-ink hover:border-ink rounded-pill h-11 border px-5 text-[14px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpenPanel(null)}
                      className="bg-brand hover:bg-brand-hover rounded-pill h-11 px-6 text-[14px] font-bold text-white transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            </>,
            document.body
          )
        : null}
    </>
  )
}
