import type { PropertyLocation, PropertyStatus } from '@/lib/constants'
import type { ZenthosSupabaseClient } from '@/lib/supabase/types'
import type { PropertySummary } from '@/lib/types'

export interface AdminPropertyRow extends PropertySummary {
  published: boolean
  featured: boolean
  reference_code: string
}

const ADMIN_COLUMNS =
  'id, slug, title, description, location, state, address, price, price_label, property_type, bedrooms, bathrooms, toilets, area_sqm, serviced, furnished, images, status, listing_type, published, featured, created_at, reference_code'

export interface AdminPropertyFilters {
  search: string
  status: PropertyStatus | 'All'
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

  if (filters.status !== 'All') query = query.eq('status', filters.status)
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
    serviced: row.serviced,
    furnished: row.furnished as PropertySummary['furnished'],
    images: row.images,
    status: row.status as PropertyStatus,
    listing_type: row.listing_type as PropertySummary['listing_type'],
    published: row.published,
    featured: row.featured,
    created_at: row.created_at,
    reference_code: row.reference_code,
  }))
}

export async function countPropertiesByStatus(
  supabase: ZenthosSupabaseClient
): Promise<{ byStatus: Record<PropertyStatus, number>; drafts: number; total: number }> {
  const { data, error } = await supabase.from('properties').select('status, published')

  if (error) throw new Error(`Failed to count properties: ${error.message}`)

  const byStatus: Record<PropertyStatus, number> = { Available: 0, Sold: 0, Reserved: 0 }
  let drafts = 0

  for (const row of data ?? []) {
    const status = row.status as PropertyStatus
    if (status in byStatus) byStatus[status] += 1
    if (!row.published) drafts += 1
  }

  return { byStatus, drafts, total: data?.length ?? 0 }
}
