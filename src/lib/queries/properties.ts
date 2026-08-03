import { PROPERTIES_PER_PAGE } from '@/lib/constants'
import type {
  Amenity,
  FurnishedState,
  ListingType,
  PropertyLocation,
  PropertyStatus,
  PropertyType,
} from '@/lib/constants'
import type { PropertiesRow } from '@/lib/database.types'
import type { ZenthosSupabaseClient } from '@/lib/supabase/types'
import type { Property, PropertyFilters, PropertyPage, PropertySummary } from '@/lib/types'

const SUMMARY_COLUMNS =
  'id, slug, title, description, location, state, address, price, price_label, property_type, bedrooms, bathrooms, toilets, area_sqm, serviced, verified, furnished, images, status, listing_type, created_at'

const DETAIL_COLUMNS = `${SUMMARY_COLUMNS}, amenities, featured, published, reference_code, title_document, updated_at`

/**
 * The `location`, `property_type` and friends columns are plain text guarded by
 * CHECK constraints, so widening them back to their unions here is a restatement
 * of a database invariant rather than an unchecked assumption.
 */
function toSummary(row: Pick<PropertiesRow, keyof PropertySummary>): PropertySummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    location: row.location as PropertyLocation,
    state: row.state as Property['state'],
    address: row.address,
    price: row.price,
    price_label: row.price_label,
    property_type: row.property_type as PropertyType,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    toilets: row.toilets,
    area_sqm: row.area_sqm,
    serviced: row.serviced,
    verified: row.verified,
    furnished: row.furnished as FurnishedState,
    images: row.images,
    status: row.status as PropertyStatus,
    listing_type: row.listing_type as ListingType,
    created_at: row.created_at,
  }
}

function toProperty(row: Omit<PropertiesRow, 'search_vector'>): Property {
  return {
    ...toSummary(row),
    amenities: row.amenities as Amenity[],
    featured: row.featured,
    published: row.published,
    reference_code: row.reference_code,
    title_document: row.title_document as Property['title_document'],
    updated_at: row.updated_at,
  }
}

export async function listProperties(
  supabase: ZenthosSupabaseClient,
  filters: PropertyFilters
): Promise<PropertyPage> {
  // A text query resolves through the search function first — it understands
  // "2bedroom", misspellings and reference codes in ways a column filter
  // cannot. The matching ids then flow into the normal filtered query so
  // structural filters and pagination behave identically either way.
  let matchedIds: string[] | null = null

  if (filters.query.trim()) {
    const { data: matches, error: searchError } = await supabase.rpc('search_properties', {
      q: filters.query.trim(),
      max_results: 200,
    })

    if (searchError) throw new Error(`Search failed: ${searchError.message}`)

    matchedIds = (matches ?? []).map(row => row.id)
    if (!matchedIds.length) {
      return { properties: [], total: 0, page: filters.page, pageCount: 1 }
    }
  }

  let query = supabase
    .from('properties')
    .select(SUMMARY_COLUMNS, { count: 'exact' })
    .eq('published', true)

  if (matchedIds) query = query.in('id', matchedIds)

  if (filters.states.length) query = query.in('state', filters.states)
  if (filters.locations.length) query = query.in('location', filters.locations)
  if (filters.titleDocuments.length) query = query.in('title_document', filters.titleDocuments)
  if (filters.propertyTypes.length) query = query.in('property_type', filters.propertyTypes)
  if (filters.furnished.length) query = query.in('furnished', filters.furnished)
  if (filters.listingType !== 'All') query = query.eq('listing_type', filters.listingType)
  if (filters.minPrice !== null) query = query.gte('price', filters.minPrice)
  if (filters.maxPrice !== null) query = query.lte('price', filters.maxPrice)
  if (filters.minBedrooms !== null) query = query.gte('bedrooms', filters.minBedrooms)
  if (filters.maxBedrooms !== null) query = query.lte('bedrooms', filters.maxBedrooms)
  if (filters.servicedOnly) query = query.eq('serviced', true)

  if (filters.addedWithinDays !== null) {
    const since = new Date(Date.now() - filters.addedWithinDays * 86_400_000).toISOString()
    query = query.gte('created_at', since)
  }

  // Featured listings lead every ordering except an explicit price sort, where
  // jumping a featured listing to the top would make the sort look broken.
  if (filters.sort === 'price-asc') {
    query = query.order('price', { ascending: true, nullsFirst: false })
  } else if (filters.sort === 'price-desc') {
    query = query.order('price', { ascending: false, nullsFirst: false })
  } else if (filters.sort === 'bedrooms-desc') {
    query = query.order('bedrooms', { ascending: false })
  } else {
    query = query.order('featured', { ascending: false })
  }

  const from = (filters.page - 1) * PROPERTIES_PER_PAGE

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, from + PROPERTIES_PER_PAGE - 1)

  if (error) throw new Error(`Failed to load properties: ${error.message}`)

  const total = count ?? 0

  return {
    properties: (data ?? []).map(toSummary),
    total,
    page: filters.page,
    pageCount: Math.max(1, Math.ceil(total / PROPERTIES_PER_PAGE)),
  }
}

export async function getFeaturedProperties(
  supabase: ZenthosSupabaseClient,
  limit = 6
): Promise<PropertySummary[]> {
  const { data, error } = await supabase
    .from('properties')
    .select(SUMMARY_COLUMNS)
    .eq('published', true)
    .eq('featured', true)
    .neq('status', 'Sold')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(`Failed to load featured properties: ${error.message}`)
  return (data ?? []).map(toSummary)
}

export async function getPropertyBySlug(
  supabase: ZenthosSupabaseClient,
  slug: string
): Promise<Property | null> {
  const { data, error } = await supabase
    .from('properties')
    .select(DETAIL_COLUMNS)
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  if (error) throw new Error(`Failed to load property "${slug}": ${error.message}`)
  return data ? toProperty(data) : null
}

/** Admin editing reads drafts too, so it deliberately skips the published filter. */
export async function getPropertyByIdForAdmin(
  supabase: ZenthosSupabaseClient,
  id: string
): Promise<Property | null> {
  const { data, error } = await supabase
    .from('properties')
    .select(DETAIL_COLUMNS)
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(`Failed to load property ${id}: ${error.message}`)
  return data ? toProperty(data) : null
}

export async function getRelatedProperties(
  supabase: ZenthosSupabaseClient,
  property: Pick<Property, 'id' | 'location' | 'property_type'>,
  limit = 4
): Promise<PropertySummary[]> {
  const { data, error } = await supabase
    .from('properties')
    .select(SUMMARY_COLUMNS)
    .eq('published', true)
    .neq('id', property.id)
    .or(`location.eq.${property.location},property_type.eq.${property.property_type}`)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(`Failed to load related properties: ${error.message}`)
  return (data ?? []).map(toSummary)
}

/**
 * The single search entry point. Delegates to the `search_properties` function
 * so the browser, the listing page and the overlay all resolve a query the same
 * way — bedroom counts parsed out of any spelling, full-text over every field,
 * substring matching while the user is still typing, and trigram fuzzy matching
 * for typos.
 */
export async function searchProperties(
  supabase: ZenthosSupabaseClient,
  term: string,
  limit = 60
): Promise<PropertySummary[]> {
  const query = term.trim()
  if (!query) return []

  const { data, error } = await supabase.rpc('search_properties', { q: query, max_results: limit })

  if (error) throw new Error(`Search failed: ${error.message}`)
  return (data ?? []).map(toSummary)
}

export async function getPropertiesByIds(
  supabase: ZenthosSupabaseClient,
  ids: string[]
): Promise<PropertySummary[]> {
  if (!ids.length) return []

  const { data, error } = await supabase
    .from('properties')
    .select(SUMMARY_COLUMNS)
    .eq('published', true)
    .in('id', ids)

  if (error) throw new Error(`Failed to load properties: ${error.message}`)

  const bySlugOrder = new Map((data ?? []).map(row => [row.id, toSummary(row)]))
  // Preserve the order the caller asked for — compare columns must not reshuffle.
  return ids.map(id => bySlugOrder.get(id)).filter((row): row is PropertySummary => Boolean(row))
}

export async function getPropertiesForCompare(
  supabase: ZenthosSupabaseClient,
  ids: string[]
): Promise<Property[]> {
  if (!ids.length) return []

  const { data, error } = await supabase
    .from('properties')
    .select(DETAIL_COLUMNS)
    .eq('published', true)
    .in('id', ids)

  if (error) throw new Error(`Failed to load comparison: ${error.message}`)

  const byId = new Map((data ?? []).map(row => [row.id, toProperty(row)]))
  return ids.map(id => byId.get(id)).filter((row): row is Property => Boolean(row))
}

export async function getAllPropertySlugs(
  supabase: ZenthosSupabaseClient
): Promise<{ slug: string; updated_at: string }[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('slug, updated_at')
    .eq('published', true)
    .order('updated_at', { ascending: false })

  if (error) throw new Error(`Failed to load property slugs: ${error.message}`)
  return data ?? []
}
