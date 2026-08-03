import type { Metadata } from 'next'
import { AgentBand } from '@/components/home/AgentBand'
import { BuyingSteps } from '@/components/home/BuyingSteps'
import { HomeHero } from '@/components/home/HomeHero'
import { LocationShowcase } from '@/components/home/LocationShowcase'
import { buildMarketStats, MarketStats } from '@/components/home/MarketStats'
import { PriceBands } from '@/components/home/PriceBands'
import { PropertyTypeShowcase } from '@/components/home/PropertyTypeShowcase'
import { TrustBand } from '@/components/home/TrustBand'
import { PropertyFeed } from '@/components/property/PropertyFeed'
import { OrganizationJsonLd } from '@/components/seo/PropertyJsonLd'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { LOCATIONS_BY_STATE, SITE } from '@/lib/constants'
import { isSupabaseConfigured } from '@/lib/env'
import {
  getCatalogueStats,
  getLowestListedPrice,
  getPriceBands,
  getLocationShowcase,
  getPropertyTypeShowcase,
  type CatalogueStats,
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
    title: `${SITE.name} | Property for Sale in Lagos & Abuja`,
    description:
      'Inspected homes for sale across Lagos island, Lagos mainland and Abuja. Speak to a broker on WhatsApp.',
    url: SITE.url,
  },
}

export const revalidate = 300

interface HomepageData {
  featured: PropertySummary[]
  locations: LocationShowcaseEntry[]
  propertyTypes: PropertyTypeShowcaseEntry[]
  stats: CatalogueStats | null
  lowestPrice: number | null
  priceBands: PriceBand[]
}

async function loadHomepageData(): Promise<HomepageData> {
  const empty: HomepageData = {
    featured: [],
    locations: [],
    propertyTypes: [],
    stats: null,
    lowestPrice: null,
    priceBands: [],
  }
  if (!isSupabaseConfigured) return empty

  const supabase = createSupabasePublicClient()
  const [featured, locations, propertyTypes, stats, lowestPrice, priceBands] = await Promise.all([
    getFeaturedProperties(supabase, 3).catch(() => empty.featured),
    getLocationShowcase(supabase).catch(() => empty.locations),
    getPropertyTypeShowcase(supabase).catch(() => empty.propertyTypes),
    getCatalogueStats(supabase).catch(() => null),
    getLowestListedPrice(supabase).catch(() => null),
    getPriceBands(supabase).catch(() => empty.priceBands),
  ])

  return { featured, locations, propertyTypes, stats, lowestPrice, priceBands }
}

export default async function HomePage() {
  const { featured, locations, propertyTypes, stats, lowestPrice, priceBands } =
    await loadHomepageData()

  const availableTypes = propertyTypes.filter(entry => entry.propertyCount > 0)

  // Areas carrying stock lead. Showing all of them turned the homepage into a
  // twelve-thousand-pixel scroll on a phone, and half the tiles were empty.
  const homepageAreas = [...locations].sort((a, b) => b.propertyCount - a.propertyCount).slice(0, 6)

  // Read off the catalogue rather than written down, so the band cannot claim
  // coverage the site does not actually have.
  const statesCovered = new Set(
    locations
      .filter(area => area.propertyCount > 0)
      .map(area =>
        (LOCATIONS_BY_STATE.Abuja as readonly string[]).includes(area.location) ? 'Abuja' : 'Lagos'
      )
  ).size

  const stockedBands = priceBands.filter(band => band.propertyCount > 0)

  const marketStats = stats
    ? buildMarketStats({
        totalListings: stats.totalListings,
        areasCovered: stats.areasCovered,
        statesCovered,
        lowestPrice,
      })
    : []

  return (
    <>
      <OrganizationJsonLd />

      <HomeHero />

      <MarketStats stats={marketStats} />

      {availableTypes.length > 0 ? (
        <section className="app-shell py-16 md:py-20">
          <SectionHeading
            eyebrow="Browse"
            title="Every kind of home we broker"
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
            title="Where we sell"
            description="Lagos island, Lagos mainland and Abuja. Each market prices differently and moves at its own speed."
          />
          <LocationShowcase locations={homepageAreas} />
        </section>
      ) : null}

      {stockedBands.length > 0 ? (
        <section className="app-shell py-16 md:py-20">
          <SectionHeading
            eyebrow="Budget"
            title="Browse by what you can spend"
            description="Every bracket below has homes in it today."
          />
          <PriceBands bands={stockedBands} />
        </section>
      ) : null}

      <AgentBand />

      <section className="app-shell py-16 md:py-20">
        <SectionHeading
          eyebrow="How it works"
          title="From first message to keys"
          description="Where the documents get checked, and when money moves."
        />
        <BuyingSteps />
      </section>

      <TrustBand />
    </>
  )
}
