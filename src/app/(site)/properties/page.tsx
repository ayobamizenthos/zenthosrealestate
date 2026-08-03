import type { Metadata } from 'next'
import { PropertyBrowser } from '@/components/filters/PropertyBrowser'
import { Pagination } from '@/components/property/Pagination'
import { PropertyFeed } from '@/components/property/PropertyFeed'
import { ButtonLink } from '@/components/ui/Button'
import { EmptyState, NoResultsIllustration } from '@/components/ui/EmptyState'
import { isSupabaseConfigured } from '@/lib/env'
import { hasActiveFilters, parsePropertyFilters } from '@/lib/property-filters'
import { listProperties } from '@/lib/queries/properties'
import { createSupabasePublicClient } from '@/lib/supabase/public'
import type { PropertyFilters, PropertyPage } from '@/lib/types'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams
}): Promise<Metadata> {
  const filters = parsePropertyFilters(await searchParams)
  const isFiltered = hasActiveFilters(filters) || filters.page > 1

  return {
    title: 'Property for Sale in Lagos',
    description:
      'Browse verified properties across Victoria Island, Lekki, Ikoyi and Ajah. Filter by location, price, bedrooms and property type.',
    // Filter permutations are near-duplicates of each other; the location
    // landing pages are the canonical entry points for crawlers.
    robots: isFiltered ? { index: false, follow: true } : undefined,
    alternates: { canonical: '/properties' },
  }
}

async function loadProperties(filters: PropertyFilters): Promise<PropertyPage> {
  if (!isSupabaseConfigured) {
    return { properties: [], total: 0, page: filters.page, pageCount: 1 }
  }

  const supabase = createSupabasePublicClient()
  return listProperties(supabase, filters)
}

export default async function PropertiesPage({ searchParams }: { searchParams: SearchParams }) {
  const filters = parsePropertyFilters(await searchParams)
  const { properties, total, pageCount } = await loadProperties(filters)

  return (
    <PropertyBrowser
      filters={filters}
      total={total}
      heading="Property for Sale in Lagos"
      intro="Every listing here has been inspected by a Zenthos broker and its title document checked. Filter by area, price, bedrooms, property type or title to narrow the list."
    >
      {properties.length > 0 ? (
        <>
          <PropertyFeed properties={properties} />
          <Pagination filters={filters} pageCount={pageCount} basePath="/properties" />
        </>
      ) : (
        <EmptyState
          illustration={<NoResultsIllustration />}
          title="No properties match your filters"
          description="Try widening the price range or removing a location to see more of what is available."
          action={
            <ButtonLink href="/properties" variant="secondary">
              Clear filters
            </ButtonLink>
          }
        />
      )}
    </PropertyBrowser>
  )
}
