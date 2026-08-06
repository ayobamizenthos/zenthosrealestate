export const SITE = {
  name: 'Zenthos Real Estate',
  shortName: 'Zenthos RE',
  tagline: 'Property brokerage in Lagos',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zenthosrealestate.com.ng',
  email: 'info@zenthosrealestate.com.ng',

  phoneDisplay: '0811 538 3780',
  whatsappNumber: '2348115383780',
} as const

export const STATES = ['Lagos'] as const
export type PropertyState = (typeof STATES)[number]

export const LOCATIONS_BY_ZONE = {
  Island: ['Victoria Island', 'Ikoyi', 'Banana Island', 'Eko Atlantic', 'Oniru', 'Lekki', 'Ajah'],
  Mainland: ['Ikeja', 'Magodo', 'Omole', 'Maryland', 'Gbagada'],
} as const

export type LocationZone = keyof typeof LOCATIONS_BY_ZONE

export const PROPERTY_LOCATIONS = [
  ...LOCATIONS_BY_ZONE.Island,
  ...LOCATIONS_BY_ZONE.Mainland,
] as const
export type PropertyLocation = (typeof PROPERTY_LOCATIONS)[number]

export const PROPERTY_TYPES = [
  'Apartment',
  'Studio Apartment',
  'Penthouse',
  'Maisonette',
  'Detached Duplex',
  'Semi-detached Duplex',
  'Terraced Duplex',
  'Detached Bungalow',
  'Semi-detached Bungalow',
  'Terraced Bungalow',
] as const
export type PropertyType = (typeof PROPERTY_TYPES)[number]

export const TITLE_DOCUMENTS = [
  "Governor's Consent",
  'Certificate of Occupancy',
  'Deed of Assignment',
  'Registered Survey',
  'Excision',
  'Gazette',
  'Family Receipt',
] as const
export type TitleDocument = (typeof TITLE_DOCUMENTS)[number]

export const LISTING_TYPES = ['Sale'] as const
export type ListingType = (typeof LISTING_TYPES)[number]

export const INQUIRY_STATUSES = ['New', 'Contacted', 'Closed'] as const
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number]

export const AMENITIES = [
  'Swimming Pool',
  'Gym',
  '24hr Power',
  'Security House',
  'Parking',
  'Garden',
  'Elevator',
  'BQ',
  'CCTV',
  'Air Conditioning',
  'Fitted Kitchen',
  'Balcony',
  'Study Room',
  'Cinema Room',
] as const
export type Amenity = (typeof AMENITIES)[number]

export const BEDROOM_FILTER_OPTIONS = [1, 2, 3, 4, 5] as const

export const PROPERTIES_PER_PAGE = 20
export const MAX_IMAGES_PER_PROPERTY = 15
export const MAX_COMPARE_PROPERTIES = 3
export const SEARCH_DEBOUNCE_MS = 160
export const SEARCH_MIN_CHARS = 1

export interface LocationLandingContent {
  name: PropertyLocation
  state: PropertyState
  slug: string
  heading: string
  metaTitle: string
  metaDescription: string
  intro: string
}

export const LOCATION_LANDING_PAGES: readonly LocationLandingContent[] = [
  {
    name: 'Victoria Island',
    state: 'Lagos',
    slug: 'victoria-island',
    heading: 'Luxury Properties in Victoria Island, Lagos',
    metaTitle: 'Property for Sale in Victoria Island, Lagos | Zenthos Real Estate',
    metaDescription:
      'Browse luxury apartments, duplexes and serviced residences for sale in Victoria Island, Lagos. Verified listings from Zenthos Real Estate.',
    intro:
      "Victoria Island is Lagos's commercial centre, home to the banks, embassies and multinationals that anchor the city's economy. Residences here trade proximity to Falomo and Ozumba Mbadiwe for space, so expect serviced apartments and compact duplexes built for professionals who want a short commute and a secure building.",
  },
  {
    name: 'Ikoyi',
    state: 'Lagos',
    slug: 'ikoyi',
    heading: 'Premium Properties in Ikoyi, Lagos',
    metaTitle: 'Premium Property for Sale in Ikoyi, Lagos | Zenthos Real Estate',
    metaDescription:
      'Explore premium homes across Banana Island, Parkview and Old Ikoyi. Detached houses and duplexes from Zenthos Real Estate.',
    intro:
      'Ikoyi holds the highest values in Lagos and the tightest supply. Banana Island, Parkview Estate and Old Ikoyi offer generous plots, mature tree cover and estate-managed security, which is why listings here move on relationships rather than open advertising. Availability changes quickly, so speak to us early.',
  },
  {
    name: 'Banana Island',
    state: 'Lagos',
    slug: 'banana-island',
    heading: 'Property for Sale on Banana Island, Lagos',
    metaTitle: 'Property for Sale on Banana Island, Ikoyi | Zenthos Real Estate',
    metaDescription:
      'Mansions, penthouses and waterfront duplexes for sale on Banana Island, Ikoyi. Verified title, discreet listings from Zenthos Real Estate.',
    intro:
      'Banana Island is reclaimed land off Ikoyi laid out on a single planned grid, with underground services, its own treatment plant and one controlled entry point. Roughly five hundred plots exist and almost none come to open market, so pricing is set privately and title is usually clean. Buyers here are trading up, not starting out.',
  },
  {
    name: 'Eko Atlantic',
    state: 'Lagos',
    slug: 'eko-atlantic',
    heading: 'Property for Sale in Eko Atlantic City, Lagos',
    metaTitle: 'Property for Sale in Eko Atlantic, Lagos | Zenthos Real Estate',
    metaDescription:
      'Apartments, penthouses and towers for sale in Eko Atlantic City. New-build waterfront property on Lagos island, verified by Zenthos.',
    intro:
      'Eko Atlantic is built on land reclaimed from the Atlantic behind the Great Wall of Lagos, with power, water and fibre laid before the first tower went up. Stock is almost entirely new-build apartments and penthouses sold off plan or on completion, which means clean documentation and service charges that reflect a fully managed city.',
  },
  {
    name: 'Oniru',
    state: 'Lagos',
    slug: 'oniru',
    heading: 'Property for Sale in Oniru, Lagos',
    metaTitle: 'Property for Sale in Oniru, Victoria Island | Zenthos Real Estate',
    metaDescription:
      'Serviced apartments and duplexes for sale in Oniru, Victoria Island. Beachside Lagos living with verified title from Zenthos Real Estate.',
    intro:
      'Oniru sits between Victoria Island and Lekki Phase 1, close enough to walk to the beach and to Landmark. Supply leans towards serviced apartments and compact duplexes aimed at buyers who want island postcodes without Ikoyi pricing. Family land history means title work matters here, and we check it before a listing goes up.',
  },
  {
    name: 'Lekki',
    state: 'Lagos',
    slug: 'lekki',
    heading: 'Property for Sale in Lekki, Lagos',
    metaTitle: 'Property for Sale in Lekki, Lagos | Zenthos Real Estate',
    metaDescription:
      'Find houses, duplexes and terraces for sale in Lekki Phase 1, Ikate, Chevron and Osapa London. Zenthos Real Estate listings.',
    intro:
      'Lekki carries the widest range of listings on the peninsula. Lekki Phase 1 and Ikate suit buyers who want established infrastructure, while Chevron and Osapa London offer newer terraces and semi-detached homes at a lower entry point. It is the corridor most families search first, and inventory turns over fast.',
  },
  {
    name: 'Ajah',
    state: 'Lagos',
    slug: 'ajah',
    heading: 'Affordable Luxury Properties in Ajah, Lagos',
    metaTitle: 'Property for Sale in Ajah, Lagos | Zenthos Real Estate',
    metaDescription:
      'Discover well-priced duplexes and terraces for sale in Ajah, Sangotedo and Abraham Adesanya. Quality Lagos homes without peninsula pricing.',
    intro:
      'Ajah gives buyers the most floor area per naira on the Lekki-Epe corridor. Sangotedo, Abraham Adesanya and Badore have absorbed steady estate development, so newer builds with modern finishes are common at prices that would not clear a deposit further west. Best suited to buyers who value space over commute time.',
  },
  {
    name: 'Ikeja',
    state: 'Lagos',
    slug: 'ikeja',
    heading: 'Property for Sale in Ikeja, Lagos',
    metaTitle: 'Property for Sale in Ikeja, Lagos | Zenthos Real Estate',
    metaDescription:
      'Houses and duplexes for sale in Ikeja GRA, Opebi, Allen and Oregun. Mainland Lagos property with island-grade finishes, verified by Zenthos.',
    intro:
      'Ikeja is the state capital and the mainland address that holds its value. Ikeja GRA keeps the low-density, tree-lined character that predates the rest of the city, while Opebi, Allen and Oregun mix residential with commercial frontage. Proximity to the airport makes it the practical choice for buyers who fly weekly.',
  },
  {
    name: 'Magodo',
    state: 'Lagos',
    slug: 'magodo',
    heading: 'Property for Sale in Magodo, Lagos',
    metaTitle: 'Property for Sale in Magodo GRA, Lagos | Zenthos Real Estate',
    metaDescription:
      'Detached and semi-detached duplexes for sale in Magodo GRA Phase 1 and Phase 2. Gated mainland living with estate-managed security.',
    intro:
      'Magodo GRA is the mainland answer to a gated estate: planned layouts, wide roads and managed security across Phase 1 and Phase 2. Plot sizes run generous by Lagos standards, so detached duplexes with real compounds are the norm rather than the exception.',
  },
  {
    name: 'Omole',
    state: 'Lagos',
    slug: 'omole',
    heading: 'Property for Sale in Omole, Lagos',
    metaTitle: 'Property for Sale in Omole, Ikeja Lagos | Zenthos Real Estate',
    metaDescription:
      'Detached and semi-detached duplexes for sale in Omole Phase 1 and Phase 2, Ikeja. Quiet gated mainland estates verified by Zenthos.',
    intro:
      'Omole Phase 1 and Phase 2 were laid out as residential estates and have stayed that way, which is rare this close to Ikeja. Roads are gated and largely commercial-free, so the streets stay quiet on weekdays. Most stock is owner-occupied detached and semi-detached duplexes, and turnover is slow because people who move here tend to stay.',
  },
  {
    name: 'Maryland',
    state: 'Lagos',
    slug: 'maryland',
    heading: 'Property for Sale in Maryland, Lagos',
    metaTitle: 'Property for Sale in Maryland, Lagos | Zenthos Real Estate',
    metaDescription:
      'Apartments and duplexes for sale in Maryland, Lagos. Central mainland location with fast access to Ikeja, Yaba and the island.',
    intro:
      'Maryland is one of the best-connected addresses on the mainland, sitting where Ikorodu Road meets Mobolaji Bank Anthony Way. That puts Ikeja, Yaba and the Third Mainland Bridge all within a short run. Stock is a mix of older low-rise blocks and newer infill apartments, so condition varies widely and inspection matters more than usual.',
  },
  {
    name: 'Gbagada',
    state: 'Lagos',
    slug: 'gbagada',
    heading: 'Property for Sale in Gbagada, Lagos',
    metaTitle: 'Property for Sale in Gbagada, Lagos | Zenthos Real Estate',
    metaDescription:
      'Duplexes, terraces and apartments for sale in Gbagada Phase 1, Phase 2 and Medina. Mainland homes minutes from the Third Mainland Bridge.',
    intro:
      'Gbagada is the mainland address islanders take seriously, mostly because the Third Mainland Bridge is minutes away. Phase 1, Phase 2, Medina and Soluyi each price differently, with newer terraces and duplexes appearing on redeveloped plots. It suits buyers who work on the island but will not pay peninsula prices to live there.',
  },
] as const

export const LOCATION_SLUGS = LOCATION_LANDING_PAGES.map(page => page.slug)

export function findLocationLanding(slug: string): LocationLandingContent | undefined {
  return LOCATION_LANDING_PAGES.find(page => page.slug === slug)
}

export function requireLocationLanding(slug: string): LocationLandingContent {
  const landing = findLocationLanding(slug)
  if (!landing) throw new Error(`Unknown location landing slug: ${slug}`)
  return landing
}

export function locationToSlug(location: PropertyLocation): string {
  return LOCATION_LANDING_PAGES.find(page => page.name === location)?.slug ?? ''
}
