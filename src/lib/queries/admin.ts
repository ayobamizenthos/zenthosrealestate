import type { PropertyLocation, TitleDocument } from '@/lib/constants'
import type { ZenthosSupabaseClient } from '@/lib/supabase/types'
import type { PropertySummary } from '@/lib/types'

export interface AdminPropertyRow extends PropertySummary {
  published: boolean
  featured: boolean
  reference_code: string
  title_document: TitleDocument | null
}

const ADMIN_COLUMNS =
  'id, slug, title, description, location, state, address, price, price_label, property_type, bedrooms, bathrooms, toilets, area_sqm, images, listing_type, published, featured, created_at, reference_code, title_document'

export interface AdminPropertyFilters {
  search: string
  location: PropertyLocation | 'All'
}

export async function listPropertiesForAdmin(
  supabase: ZenthosSupabaseClient,
  filters: AdminPropertyFilters
): Promise<AdminPropertyRow[]> {
  let query = supabase
    .from('properties')
    .select(ADMIN_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(200)

  if (filters.location !== 'All') query = query.eq('location', filters.location)

  if (filters.search) {
    const safeSearch = filters.search.replace(/[%,()]/g, ' ').trim()
    if (safeSearch) query = query.ilike('title', `%${safeSearch}%`)
  }

  const { data, error } = await query
  if (error) throw new Error(`Failed to load properties: ${error.message}`)

  return (data ?? []).map(row => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    location: row.location as PropertyLocation,
    state: row.state as AdminPropertyRow['state'],
    address: row.address,
    price: row.price,
    price_label: row.price_label,
    property_type: row.property_type as PropertySummary['property_type'],
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    toilets: row.toilets,
    area_sqm: row.area_sqm,
    images: row.images,
    listing_type: row.listing_type as PropertySummary['listing_type'],
    published: row.published,
    featured: row.featured,
    created_at: row.created_at,
    reference_code: row.reference_code,
    title_document: row.title_document as AdminPropertyRow['title_document'],
  }))
}

export async function countProperties(
  supabase: ZenthosSupabaseClient
): Promise<{ live: number; drafts: number; total: number }> {
  const { data, error } = await supabase.from('properties').select('published')

  if (error) throw new Error(`Failed to count properties: ${error.message}`)

  const rows = data ?? []
  const drafts = rows.filter(row => !row.published).length

  return { live: rows.length - drafts, drafts, total: rows.length }
}
