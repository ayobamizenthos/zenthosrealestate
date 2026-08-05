import type {
  Amenity,
  FurnishedState,
  InquiryStatus,
  ListingType,
  PropertyLocation,
  PropertyState,
  PropertyStatus,
  PropertyType,
  TitleDocument,
} from './constants'

export interface Property {
  id: string
  slug: string
  title: string
  description: string
  location: PropertyLocation
  state: PropertyState
  address: string

  price: number | null
  price_label: string | null
  property_type: PropertyType
  bedrooms: number
  bathrooms: number
  toilets: number

  reference_code: string
  title_document: TitleDocument | null
  furnished: FurnishedState
  amenities: Amenity[]
  images: string[]
  featured: boolean
  status: PropertyStatus
  listing_type: ListingType
  published: boolean
  created_at: string
  updated_at: string
}

export type PropertySummary = Pick<
  Property,
  | 'id'
  | 'slug'
  | 'title'
  | 'description'
  | 'location'
  | 'state'
  | 'address'
  | 'price'
  | 'price_label'
  | 'property_type'
  | 'bedrooms'
  | 'bathrooms'
  | 'toilets'
  | 'furnished'
  | 'images'
  | 'status'
  | 'listing_type'
  | 'created_at'
>

export interface Inquiry {
  id: string
  property_id: string | null
  name: string
  email: string
  phone: string
  message: string
  source: 'website' | 'pwa'
  status: InquiryStatus
  created_at: string
}

export interface InquiryWithProperty extends Inquiry {
  property: Pick<Property, 'id' | 'slug' | 'title'> | null
}

export interface Profile {
  id: string
  full_name: string
  phone: string | null
  created_at: string
}

export interface SavedProperty {
  id: string
  user_id: string
  property_id: string
  created_at: string
}

export type AdminRole = 'super_admin' | 'admin'

export interface AdminUser {
  id: string
  user_id: string
  role: AdminRole
}

export interface PushSubscriptionRecord {
  id: string
  user_id: string | null
  endpoint: string
  p256dh: string
  auth: string
  created_at: string
}

export type NotificationKind =
  | 'new_property'
  | 'price_drop'
  | 'status_change'
  | 'new_inquiry'
  | 'inquiry_updated'

export interface AppNotification {
  id: string
  user_id: string
  kind: NotificationKind
  title: string
  body: string
  url: string
  read: boolean
  created_at: string
}

export interface PropertyFilters {
  states: PropertyState[]
  locations: PropertyLocation[]
  titleDocuments: TitleDocument[]
  propertyTypes: PropertyType[]
  furnished: FurnishedState[]
  listingType: ListingType | 'All'
  minPrice: number | null
  maxPrice: number | null
  minBedrooms: number | null
  maxBedrooms: number | null

  addedWithinDays: number | null
  query: string
  sort: PropertySort
  page: number
}

export type PropertySort = 'newest' | 'price-asc' | 'price-desc' | 'bedrooms-desc'

export interface PropertyPage {
  properties: PropertySummary[]
  total: number
  page: number
  pageCount: number
}
