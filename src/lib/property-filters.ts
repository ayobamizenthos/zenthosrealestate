import {
  LISTING_TYPES,
  PROPERTY_LOCATIONS,
  STATES,
  TITLE_DOCUMENTS,
  PROPERTY_TYPES,
  type ListingType,
  type PropertyLocation,
  type PropertyState,
  type TitleDocument,
  type PropertyType,
} from './constants'
import type { PropertyFilters, PropertySort } from './types'

export const EMPTY_FILTERS: PropertyFilters = {
  states: [],
  locations: [],
  titleDocuments: [],
  propertyTypes: [],
  listingType: 'All',
  minPrice: null,
  maxPrice: null,
  minBedrooms: null,
  maxBedrooms: null,
  addedWithinDays: null,
  query: '',
  sort: 'newest',
  page: 1,
}

export const PRICE_PRESETS: { label: string; min: number | null; max: number | null }[] = [
  { label: 'Under ₦25M', min: null, max: 25_000_000 },
  { label: '₦25M – ₦50M', min: 25_000_000, max: 50_000_000 },
  { label: '₦50M – ₦100M', min: 50_000_000, max: 100_000_000 },
  { label: '₦100M – ₦250M', min: 100_000_000, max: 250_000_000 },
  { label: '₦250M – ₦500M', min: 250_000_000, max: 500_000_000 },
  { label: '₦500M+', min: 500_000_000, max: null },
]

export const DATE_ADDED_PRESETS: { label: string; days: number | null }[] = [
  { label: 'Anytime', days: null },
  { label: 'Last 24 hours', days: 1 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 14 days', days: 14 },
  { label: 'Last 30 days', days: 30 },
]

export const SORT_OPTIONS: { value: PropertySort; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'bedrooms-desc', label: 'Most bedrooms' },
]

type SearchParamsInput = Record<string, string | string[] | undefined> | URLSearchParams

function readParam(params: SearchParamsInput, key: string): string | undefined {
  if (params instanceof URLSearchParams) return params.get(key) ?? undefined
  const value = params[key]
  return Array.isArray(value) ? value[0] : value
}

function readEnumList<T extends string>(
  params: SearchParamsInput,
  key: string,
  allowed: readonly T[]
): T[] {
  const raw = readParam(params, key)
  if (!raw) return []
  return raw
    .split(',')
    .map(entry => entry.trim())
    .filter((entry): entry is T => (allowed as readonly string[]).includes(entry))
}

function readPositiveInt(params: SearchParamsInput, key: string): number | null {
  const raw = readParam(params, key)
  if (!raw) return null
  const parsed = Number.parseInt(raw, 10)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

export function parsePropertyFilters(params: SearchParamsInput): PropertyFilters {
  const listingTypeRaw = readParam(params, 'listing')
  const listingType = (LISTING_TYPES as readonly string[]).includes(listingTypeRaw ?? '')
    ? (listingTypeRaw as ListingType)
    : 'All'

  const sortRaw = readParam(params, 'sort')
  const sort = SORT_OPTIONS.some(option => option.value === sortRaw)
    ? (sortRaw as PropertySort)
    : 'newest'

  const addedRaw = readPositiveInt(params, 'added')
  const addedWithinDays = DATE_ADDED_PRESETS.some(preset => preset.days === addedRaw)
    ? addedRaw
    : null

  return {
    states: readEnumList<PropertyState>(params, 'state', STATES),
    locations: readEnumList<PropertyLocation>(params, 'location', PROPERTY_LOCATIONS),
    titleDocuments: readEnumList<TitleDocument>(params, 'title', TITLE_DOCUMENTS),
    propertyTypes: readEnumList<PropertyType>(params, 'type', PROPERTY_TYPES),
    listingType,
    minPrice: readPositiveInt(params, 'min'),
    maxPrice: readPositiveInt(params, 'max'),
    minBedrooms: readPositiveInt(params, 'beds'),
    maxBedrooms: readPositiveInt(params, 'bedsmax'),
    addedWithinDays,
    query: (readParam(params, 'q') ?? '').trim().slice(0, 120),
    sort,
    page: Math.max(1, readPositiveInt(params, 'page') ?? 1),
  }
}

export function filtersToSearchParams(filters: PropertyFilters): URLSearchParams {
  const params = new URLSearchParams()

  if (filters.states.length) params.set('state', filters.states.join(','))
  if (filters.locations.length) params.set('location', filters.locations.join(','))
  if (filters.titleDocuments.length) params.set('title', filters.titleDocuments.join(','))
  if (filters.propertyTypes.length) params.set('type', filters.propertyTypes.join(','))
  if (filters.listingType !== 'All') params.set('listing', filters.listingType)
  if (filters.minPrice !== null) params.set('min', String(filters.minPrice))
  if (filters.maxPrice !== null) params.set('max', String(filters.maxPrice))
  if (filters.minBedrooms !== null) params.set('beds', String(filters.minBedrooms))
  if (filters.maxBedrooms !== null) params.set('bedsmax', String(filters.maxBedrooms))
  if (filters.addedWithinDays !== null) params.set('added', String(filters.addedWithinDays))
  if (filters.query) params.set('q', filters.query)
  if (filters.sort !== 'newest') params.set('sort', filters.sort)
  if (filters.page > 1) params.set('page', String(filters.page))

  return params
}

export function filtersToQueryString(filters: PropertyFilters): string {
  const params = filtersToSearchParams(filters)
  const serialised = params.toString()
  return serialised ? `?${serialised}` : ''
}

export function countActiveFilters(filters: PropertyFilters): number {
  return (
    filters.states.length +
    filters.locations.length +
    filters.titleDocuments.length +
    filters.propertyTypes.length +
    (filters.listingType !== 'All' ? 1 : 0) +
    (filters.minPrice !== null || filters.maxPrice !== null ? 1 : 0) +
    (filters.minBedrooms !== null || filters.maxBedrooms !== null ? 1 : 0) +
    (filters.addedWithinDays !== null ? 1 : 0)
  )
}

export function hasActiveFilters(filters: PropertyFilters): boolean {
  return countActiveFilters(filters) > 0 || filters.query.length > 0
}

export function toPrefixTsQuery(input: string): string {
  const terms = input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)

  if (!terms.length) return ''
  return terms.map((term, index) => (index === terms.length - 1 ? `${term}:*` : term)).join(' & ')
}
