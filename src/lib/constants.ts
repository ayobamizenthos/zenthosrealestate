export const SITE = {
  name: 'Zenthos Real Estate',
  shortName: 'Zenthos RE',
  tagline: 'Property brokerage in Lagos and Abuja',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zenthosrealestate.com.ng',
  email: 'hello@zenthosrealestate.com.ng',
  /** Displayed to humans; `whatsappNumber` is the wa.me wire format. */
  phoneDisplay: '0811 538 3780',
  whatsappNumber: '2348115383780',
} as const

export const STATES = ['Lagos', 'Abuja'] as const
export type PropertyState = (typeof STATES)[number]

/** Areas grouped by the market a buyer actually shops in. */
export const LOCATIONS_BY_STATE = {
  Lagos: [
    'Victoria Island',
    'Ikoyi',
    'Banana Island',
    'Eko Atlantic',
    'Oniru',
    'Lekki',
    'Ajah',
    'Ikeja',
    'Yaba',
    'Surulere',
    'Magodo',
    'Gbagada',
    'Maryland',
    'Ogudu',
    'Omole',
  ],
  Abuja: ['Maitama', 'Asokoro', 'Wuse', 'Gwarinpa', 'Jabi', 'Katampe', 'Guzape', 'Lokogoma'],
} as const

export const PROPERTY_LOCATIONS = [
  ...LOCATIONS_BY_STATE.Lagos,
  ...LOCATIONS_BY_STATE.Abuja,
] as const
export type PropertyLocation = (typeof PROPERTY_LOCATIONS)[number]

/** The vocabulary Nigerian buyers actually search in. */
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

/** The first question every serious Nigerian buyer asks. */
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

/**
 * Zenthos brokers sales only. The database CHECK still permits Rent and
 * Shortlet so the column never needs a migration if that changes, but nothing
 * in the product offers them.
 */
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

/** Matches the paginate-by-20 requirement in the performance spec. */
export const PROPERTIES_PER_PAGE = 20
export const MAX_IMAGES_PER_PROPERTY = 15
export const MAX_COMPARE_PROPERTIES = 3
export const SEARCH_DEBOUNCE_MS = 160
export const SEARCH_MIN_CHARS = 1

/**
 * Location landing pages exist to rank for "properties for sale in {area}".
 * Each needs genuinely distinct copy — duplicated intros get treated as
 * doorway pages and suppressed.
 */
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
      'Explore premium homes in Ikoyi, Lagos — Banana Island, Parkview and Old Ikoyi. Detached houses and duplexes from Zenthos Real Estate.',
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
      'Lekki carries the widest range of stock on the peninsula. Lekki Phase 1 and Ikate suit buyers who want established infrastructure, while Chevron and Osapa London offer newer terraces and semi-detached homes at a lower entry point. It is the corridor most families search first, and inventory turns over fast.',
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
    name: 'Yaba',
    state: 'Lagos',
    slug: 'yaba',
    heading: 'Property for Sale in Yaba, Lagos',
    metaTitle: 'Property for Sale in Yaba, Lagos | Zenthos Real Estate',
    metaDescription:
      'Apartments and duplexes for sale in Yaba, Sabo and Akoka. Lagos mainland property close to the tech corridor and the university.',
    intro:
      "Yaba carries Lagos's tech corridor and the university, which keeps demand steady and rental yields firm. Stock ranges from converted family houses in Sabo to new apartment blocks aimed at young professionals. Buyers here are usually weighing yield rather than square metres.",
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
    name: 'Maitama',
    state: 'Abuja',
    slug: 'maitama',
    heading: 'Property for Sale in Maitama, Abuja',
    metaTitle: 'Luxury Property for Sale in Maitama, Abuja | Zenthos Real Estate',
    metaDescription:
      'Luxury houses and duplexes for sale in Maitama, Abuja. The capital’s most established address, with verified title and Zenthos inspection.',
    intro:
      "Maitama is Abuja's most established address — embassies, ministers and the quietest streets in the capital. Plots are large, densities low, and the housing stock is overwhelmingly detached. Values hold through cycles here better than anywhere else in the Federal Capital Territory.",
  },
  {
    name: 'Asokoro',
    state: 'Abuja',
    slug: 'asokoro',
    heading: 'Property for Sale in Asokoro, Abuja',
    metaTitle: 'Property for Sale in Asokoro, Abuja | Zenthos Real Estate',
    metaDescription:
      'Detached duplexes and luxury homes for sale in Asokoro, Abuja. Diplomatic-zone security with verified documentation.',
    intro:
      'Asokoro sits beside the Presidential Villa, which gives it a level of ambient security no private estate can match. The district is almost entirely residential and almost entirely detached, favoured by buyers who want space in the city rather than on its edge.',
  },
  {
    name: 'Wuse',
    state: 'Abuja',
    slug: 'wuse',
    heading: 'Property for Sale in Wuse, Abuja',
    metaTitle: 'Property for Sale in Wuse & Wuse 2, Abuja | Zenthos Real Estate',
    metaDescription:
      'Apartments and duplexes for sale in Wuse and Wuse 2, Abuja. Central capital living within walking distance of business districts.',
    intro:
      'Wuse and Wuse 2 are where Abuja actually works — offices, markets and apartments in the same grid. Stock skews towards apartments and serviced blocks rather than standalone houses, which suits buyers who want to be central and are not looking for a compound.',
  },
  {
    name: 'Gwarinpa',
    state: 'Abuja',
    slug: 'gwarinpa',
    heading: 'Property for Sale in Gwarinpa, Abuja',
    metaTitle: 'Property for Sale in Gwarinpa Estate, Abuja | Zenthos Real Estate',
    metaDescription:
      'Duplexes and family homes for sale in Gwarinpa Estate, Abuja. West Africa’s largest housing estate, with room to grow into.',
    intro:
      'Gwarinpa is the largest single housing estate in West Africa, and the Abuja address most families settle on. Layouts are consistent, schools and markets are inside the estate, and prices sit well below the central districts for materially more space.',
  },
] as const

export const LOCATION_SLUGS = LOCATION_LANDING_PAGES.map(page => page.slug)

export function findLocationLanding(slug: string): LocationLandingContent | undefined {
  return LOCATION_LANDING_PAGES.find(page => page.slug === slug)
}

/** Used by the four static landing routes, whose slugs are known at build time. */
export function requireLocationLanding(slug: string): LocationLandingContent {
  const landing = findLocationLanding(slug)
  if (!landing) throw new Error(`Unknown location landing slug: ${slug}`)
  return landing
}

export function locationToSlug(location: PropertyLocation): string {
  return LOCATION_LANDING_PAGES.find(page => page.name === location)?.slug ?? ''
}
