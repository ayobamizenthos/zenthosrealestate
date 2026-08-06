import type { Metadata } from 'next'
import { AdvertiseBand } from '@/components/home/AdvertiseBand'
import { AgentBand } from '@/components/home/AgentBand'
import { BuyingSteps } from '@/components/home/BuyingSteps'
import { HomeHero } from '@/components/home/HomeHero'
import { LocationShowcase } from '@/components/home/LocationShowcase'
import { PriceBands } from '@/components/home/PriceBands'
import { PropertyTypeShowcase } from '@/components/home/PropertyTypeShowcase'
import { PropertyFeed } from '@/components/property/PropertyFeed'
import { OrganizationJsonLd } from '@/components/seo/PropertyJsonLd'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { SITE } from '@/lib/constants'
import { isSupabaseConfigured } from '@/lib/env'
import {
  getPriceBands,
  getLocationShowcase,
  getPropertyTypeShowcase,
  type PriceBand,
  type LocationShowcaseEntry,
  type PropertyTypeShowcaseEntry,
} from '@/lib/queries/locations'
import { getFeaturedProperties } from '@/lib/queries/properties'
import { createSupabasePublicClient } from '@/lib/supabase/public'
import type { PropertySummary } from '@/lib/types'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: {
    title: `${SITE.name} | Property for Sale in Lagos`,
    description:
      'Inspected homes for sale across Lagos island and mainland. Talk to us on WhatsApp.',
    url: SITE.url,
  },
}

export const revalidate = 300

interface HomepageData {
  featured: PropertySummary[]
  locations: LocationShowcaseEntry[]
  propertyTypes: PropertyTypeShowcaseEntry[]
  priceBands: PriceBand[]
}

async function loadHomepageData(): Promise<HomepageData> {
  const empty: HomepageData = {
    featured: [],
    locations: [],
    propertyTypes: [],
    priceBands: [],
  }
  if (!isSupabaseConfigured) return empty

  const supabase = createSupabasePublicClient()
  const [featured, locations, propertyTypes, priceBands] = await Promise.all([
    getFeaturedProperties(supabase, 3).catch(() => empty.featured),
    getLocationShowcase(supabase).catch(() => empty.locations),
    getPropertyTypeShowcase(supabase).catch(() => empty.propertyTypes),
    getPriceBands(supabase).catch(() => empty.priceBands),
  ])

  return { featured, locations, propertyTypes, priceBands }
}

export default async function HomePage() {
  const { featured, locations, propertyTypes, priceBands } = await loadHomepageData()

  const availableTypes = propertyTypes.filter(entry => entry.propertyCount > 0)
  const homepageAreas = [...locations].sort((a, b) => b.propertyCount - a.propertyCount)

  const bandsWithHomes = priceBands.filter(band => band.propertyCount > 0)

  return (
    <>
      <OrganizationJsonLd />

      <HomeHero />

      {availableTypes.length > 0 ? (
        <section className="app-shell py-16 md:py-20">
          <SectionHeading
            title="Every home type in Lagos"
            linkHref="/properties"
            linkLabel="See all"
          />
          <PropertyTypeShowcase types={availableTypes} />
        </section>
      ) : null}

      {featured.length > 0 ? (
        <section className="app-shell py-16 md:py-20">
          <SectionHeading
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
            title="Where we sell"
            description="Island and mainland. Each market prices differently and moves at its own speed."
          />
          <LocationShowcase locations={homepageAreas} />
        </section>
      ) : null}

      {bandsWithHomes.length > 0 ? (
        <section className="app-shell py-16 md:py-20">
          <SectionHeading
            title="Browse by your budget"
            description="Every bracket below has homes in it today."
          />
          <PriceBands bands={bandsWithHomes} />
        </section>
      ) : null}

      <AdvertiseBand />

      <AgentBand />

      <section className="app-shell py-16 md:py-20">
        <SectionHeading
          title="From first message to acquisition"
          description="Where the documents get checked, and when money moves."
        />
        <BuyingSteps />
      </section>
    </>
  )
}
