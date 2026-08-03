import type { Metadata } from 'next'
import { HomeHero } from '@/components/home/HomeHero'
import { LocationShowcase } from '@/components/home/LocationShowcase'
import { PropertyTypeShowcase } from '@/components/home/PropertyTypeShowcase'
import { TrustBand } from '@/components/home/TrustBand'
import { PropertyFeed } from '@/components/property/PropertyFeed'
import { OrganizationJsonLd } from '@/components/seo/PropertyJsonLd'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { SITE } from '@/lib/constants'
import { isSupabaseConfigured } from '@/lib/env'
import {
  getLocationShowcase,
  getPropertyTypeShowcase,
  type LocationShowcaseEntry,
  type PropertyTypeShowcaseEntry,
} from '@/lib/queries/locations'
import { getFeaturedProperties } from '@/lib/queries/properties'
import { createSupabasePublicClient } from '@/lib/supabase/public'
import type { PropertySummary } from '@/lib/types'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: {
    title: `${SITE.name} | Luxury Properties in Lagos`,
    description:
      'Verified homes for sale, rent and shortlet in Victoria Island, Lekki, Ikoyi and Ajah.',
    url: SITE.url,
  },
}

export const revalidate = 300

interface HomepageData {
  featured: PropertySummary[]
  locations: LocationShowcaseEntry[]
  propertyTypes: PropertyTypeShowcaseEntry[]
}

async function loadHomepageData(): Promise<HomepageData> {
  const empty: HomepageData = { featured: [], locations: [], propertyTypes: [] }
  if (!isSupabaseConfigured) return empty

  const supabase = createSupabasePublicClient()
  const [featured, locations, propertyTypes] = await Promise.all([
    getFeaturedProperties(supabase, 7).catch(() => empty.featured),
    getLocationShowcase(supabase).catch(() => empty.locations),
    getPropertyTypeShowcase(supabase).catch(() => empty.propertyTypes),
  ])

  return { featured, locations, propertyTypes }
}

export default async function HomePage() {
  const { featured, locations, propertyTypes } = await loadHomepageData()

  const availableTypes = propertyTypes.filter(entry => entry.propertyCount > 0)

  return (
    <>
      <OrganizationJsonLd />

      <HomeHero />

      {availableTypes.length > 0 ? (
        <section className="app-shell py-16 md:py-20">
          <SectionHeading
            eyebrow="Browse"
            title="Every kind of home on the peninsula"
            linkHref="/properties"
            linkLabel="See all"
          />
          <PropertyTypeShowcase types={availableTypes} />
        </section>
      ) : null}

      {featured.length > 0 ? (
        <section className="app-shell py-16 md:py-20">
          <SectionHeading
            eyebrow="Selected"
            title="Currently drawing the most interest"
            linkHref="/properties"
            linkLabel="All properties"
          />
          <PropertyFeed properties={featured} />
        </section>
      ) : null}

      {locations.length > 0 ? (
        <section className="app-shell py-16 md:py-20">
          <SectionHeading
            eyebrow="Areas"
            title="Four corners of the peninsula"
            description="Each with its own character, pricing and pace of turnover."
          />
          <LocationShowcase locations={locations} />
        </section>
      ) : null}

      <TrustBand />
    </>
  )
}
