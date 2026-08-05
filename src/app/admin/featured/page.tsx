import type { Metadata } from 'next'
import { FeaturedOrderList } from '@/components/admin/FeaturedOrderList'
import { requireAdmin } from '@/lib/auth'
import type { PropertySummary } from '@/lib/types'

export const metadata: Metadata = { title: 'Homepage order' }

const COLUMNS =
  'id, slug, title, description, location, state, address, price, price_label, property_type, bedrooms, bathrooms, toilets, serviced, furnished, images, status, listing_type, created_at'

export default async function AdminFeaturedPage() {
  const { supabase } = await requireAdmin()

  const [featuredResult, candidateResult] = await Promise.all([
    supabase
      .from('properties')
      .select(COLUMNS)
      .eq('featured', true)
      .order('featured_rank', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false }),
    supabase
      .from('properties')
      .select(COLUMNS)
      .eq('featured', false)
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  const featured = (featuredResult.data ?? []) as unknown as PropertySummary[]
  const candidates = (candidateResult.data ?? []) as unknown as PropertySummary[]

  return (
    <div className="app-shell py-8">
      <h1 className="text-ink text-[24px] font-extrabold">Homepage order</h1>
      <p className="text-muted mt-1.5 max-w-2xl text-[14px]">
        Control which listings appear on the homepage and the order buyers see them in.
      </p>

      <div className="mt-8">
        <FeaturedOrderList featured={featured} candidates={candidates} />
      </div>
    </div>
  )
}
