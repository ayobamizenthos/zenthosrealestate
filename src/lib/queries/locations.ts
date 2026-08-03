import {
  LOCATION_LANDING_PAGES,
  PROPERTY_TYPES,
  type PropertyLocation,
  type PropertyType,
} from '@/lib/constants'
import type { ZenthosSupabaseClient } from '@/lib/supabase/types'

export interface LocationShowcaseEntry {
  location: PropertyLocation
  slug: string
  heading: string
  propertyCount: number
  coverImage: string | null
}

/**
 * Returns one entry per configured location, including areas with no live
 * listings — an empty tile still earns its place as an SEO landing link.
 */
export async function getLocationShowcase(
  supabase: ZenthosSupabaseClient
): Promise<LocationShowcaseEntry[]> {
  const { data, error } = await supabase
    .from('location_showcase')
    .select('location, property_count, cover_images')

  if (error) throw new Error(`Failed to load location showcase: ${error.message}`)

  const byLocation = new Map((data ?? []).map(row => [row.location, row]))

  return LOCATION_LANDING_PAGES.map(page => {
    const stats = byLocation.get(page.name)
    return {
      location: page.name,
      slug: page.slug,
      heading: page.heading,
      propertyCount: stats?.property_count ?? 0,
      coverImage: stats?.cover_images?.[0] ?? null,
    }
  })
}

export interface PropertyTypeShowcaseEntry {
  propertyType: PropertyType
  propertyCount: number
  coverImage: string | null
}

export async function getPropertyTypeShowcase(
  supabase: ZenthosSupabaseClient
): Promise<PropertyTypeShowcaseEntry[]> {
  const { data, error } = await supabase
    .from('property_type_showcase')
    .select('property_type, property_count, cover_images')

  if (error) throw new Error(`Failed to load property types: ${error.message}`)

  const byType = new Map((data ?? []).map(row => [row.property_type, row]))

  return PROPERTY_TYPES.map(propertyType => {
    const stats = byType.get(propertyType)
    return {
      propertyType,
      propertyCount: stats?.property_count ?? 0,
      coverImage: stats?.cover_images?.[0] ?? null,
    }
  })
}

export interface CatalogueStats {
  totalListings: number
  forSale: number
  forRent: number
  shortlets: number
  verifiedListings: number
  areasCovered: number
}

/**
 * Cheapest published listing, for the "from" figure on the homepage. Derived
 * from the whole catalogue rather than whatever happens to be featured, so the
 * price quoted is one a buyer can actually find.
 */
export async function getLowestListedPrice(
  supabase: ZenthosSupabaseClient
): Promise<number | null> {
  const { data, error } = await supabase
    .from('properties')
    .select('price')
    .eq('published', true)
    .not('price', 'is', null)
    .order('price', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error || !data) return null
  return data.price
}

export interface PriceBand {
  label: string
  min: number | null
  max: number | null
  propertyCount: number
}

/**
 * Budget is the first cut most buyers make, so the homepage offers it as a
 * shortcut. Counts are tallied from the live catalogue and empty bands are
 * dropped by the caller, which keeps the row honest as stock moves rather than
 * advertising a bracket with nothing in it.
 */
const PRICE_BANDS: { label: string; min: number | null; max: number | null }[] = [
  { label: 'Under ₦100M', min: null, max: 100_000_000 },
  { label: '₦100M to ₦250M', min: 100_000_000, max: 250_000_000 },
  { label: '₦250M to ₦500M', min: 250_000_000, max: 500_000_000 },
  { label: 'Above ₦500M', min: 500_000_000, max: null },
]

export async function getPriceBands(supabase: ZenthosSupabaseClient): Promise<PriceBand[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('price')
    .eq('published', true)
    .not('price', 'is', null)

  if (error || !data) return []

  return PRICE_BANDS.map(band => ({
    ...band,
    propertyCount: data.filter(row => {
      const price = row.price as number
      if (band.min !== null && price < band.min) return false
      if (band.max !== null && price >= band.max) return false
      return true
    }).length,
  }))
}

export async function getCatalogueStats(
  supabase: ZenthosSupabaseClient
): Promise<CatalogueStats | null> {
  const { data, error } = await supabase
    .from('catalogue_stats')
    .select('total_listings, for_sale, for_rent, shortlets, verified_listings, areas_covered')
    .maybeSingle()

  if (error || !data) return null

  return {
    totalListings: data.total_listings,
    forSale: data.for_sale,
    forRent: data.for_rent,
    shortlets: data.shortlets,
    verifiedListings: data.verified_listings,
    areasCovered: data.areas_covered,
  }
}
