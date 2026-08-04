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

export const FURNISHED_STATES = ['Furnished', 'Unfurnished', 'Semi-furnished'] as const
export type FurnishedState = (typeof FURNISHED_STATES)[number]

export const LISTING_TYPES = ['Sale'] as const
export type ListingType = (typeof LISTING_TYPES)[number]

export const PROPERTY_STATUSES = ['Available', 'Sold', 'Reserved'] as const
export type PropertyStatus = (typeof PROPERTY_STATUSES)[number]

export const INQUIRY_STATUSES = ['New', 'Contacted', 'Closed'] as const
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number]

export const AMENITIES = [
  'Swimming Pool',
  'Gym',
  '24hr Power',
  'Security',
  'Parking',
  'Garden',
  'Elevator',
  "Boys' Quarters",
  'CCTV',
  'Borehole',
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
