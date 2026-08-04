import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { PropertyFeed } from '@/components/property/PropertyFeed'
import { ButtonLink } from '@/components/ui/Button'
import { EmptyState, NoResultsIllustration } from '@/components/ui/EmptyState'
import type { LocationLandingContent } from '@/lib/constants'
import { isSupabaseConfigured } from '@/lib/env'
import { EMPTY_FILTERS } from '@/lib/property-filters'
import { listProperties } from '@/lib/queries/properties'
import { createSupabasePublicClient } from '@/lib/supabase/public'
import type { PropertyFilters, PropertyPage } from '@/lib/types'

async function loadLocationProperties(filters: PropertyFilters): Promise<PropertyPage> {
  if (!isSupabaseConfigured) {
    return { properties: [], total: 0, page: 1, pageCount: 1 }
  }

  const supabase = createSupabasePublicClient()
  return listProperties(supabase, filters)
}

export async function LocationLandingPage({ content }: { content: LocationLandingContent }) {
  const filters: PropertyFilters = { ...EMPTY_FILTERS, locations: [content.name] }
  const { properties, total } = await loadLocationProperties(filters)

  const browseAllHref = `/properties?location=${encodeURIComponent(content.name)}`

  return (
    <>
      <div className="bg-canvas">
        <div className="app-shell pt-8 pb-8 md:pt-12">
          <p className="text-muted text-eyebrow font-semibold uppercase">
            {content.state} · {content.name}
          </p>
          <h1 className="text-ink mt-4 max-w-3xl text-[30px] leading-tight font-extrabold md:text-[42px]">
            {content.heading}
          </h1>
          <p className="text-muted mt-5 max-w-2xl text-[15px] leading-relaxed md:text-[17px]">
            {content.intro}
          </p>
        </div>
      </div>

      <div className="bg-page min-h-screen">
        <div className="app-shell py-8">
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
            <p className="text-muted text-[14px]">
              <span className="text-ink font-bold">{total}</span>{' '}
              {total === 1 ? 'property' : 'properties'} for sale in {content.name}
            </p>

            {total > properties.length ? (
              <Link
                href={browseAllHref}
                className="text-ink hover:text-brand group flex items-center gap-1.5 border-b border-current pb-0.5 text-[14px] font-semibold transition-colors"
              >
                View all {total}
                <ArrowRight
                  size={15}
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            ) : null}
          </div>

          {properties.length > 0 ? (
            <PropertyFeed properties={properties} />
          ) : (
            <EmptyState
              illustration={<NoResultsIllustration />}
              title={`No listings in ${content.name} right now`}
              description="Stock moves quickly. Message us on WhatsApp and we will tell you the moment something lands here."
              action={<ButtonLink href="/properties">Browse all properties</ButtonLink>}
            />
          )}
        </div>
      </div>
    </>
  )
}
