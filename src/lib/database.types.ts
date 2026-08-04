type Timestamptz = string

type EmptyRecord = { [_ in never]: never }

export type PropertiesRow = {
  id: string
  slug: string
  title: string
  description: string
  location: string
  state: string
  address: string
  price: number | null
  price_label: string | null
  property_type: string
  bedrooms: number
  bathrooms: number
  toilets: number
  area_sqm: number | null
  serviced: boolean
  reference_code: string
  furnished: string
  amenities: string[]
  images: string[]
  featured: boolean
  status: string
  listing_type: string
  published: boolean
  search_vector: string | null
  title_document: string | null
  created_at: Timestamptz
  updated_at: Timestamptz
}

type PropertiesInsert = Omit<
  PropertiesRow,
  'id' | 'slug' | 'search_vector' | 'reference_code' | 'created_at' | 'updated_at'
> &
  Partial<Pick<PropertiesRow, 'id' | 'slug' | 'reference_code' | 'created_at' | 'updated_at'>>

export type InquiriesRow = {
  id: string
  property_id: string | null
  user_id: string | null
  name: string
  email: string
  phone: string
  message: string
  source: string
  status: string
  created_at: Timestamptz
}

export type ProfilesRow = {
  id: string
  full_name: string
  role: string
  phone: string | null
  created_at: Timestamptz
}

export type AdminUsersRow = {
  id: string
  user_id: string
  role: string
  created_at: Timestamptz
}

export type SavedPropertiesRow = {
  id: string
  user_id: string
  property_id: string
  created_at: Timestamptz
}

export type PushSubscriptionsRow = {
  id: string
  user_id: string | null
  endpoint: string
  p256dh: string
  auth: string
  created_at: Timestamptz
}

export type NotificationsRow = {
  id: string
  user_id: string
  kind: string
  title: string
  body: string
  url: string
  read: boolean
  created_at: Timestamptz
}

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '12'
  }
  public: {
    Tables: {
      properties: {
        Row: PropertiesRow
        Insert: PropertiesInsert
        Update: Partial<PropertiesInsert>
        Relationships: []
      }
      inquiries: {
        Row: InquiriesRow
        Insert: Omit<InquiriesRow, 'id' | 'created_at' | 'status'> &
          Partial<Pick<InquiriesRow, 'id' | 'created_at' | 'status'>>
        Update: Partial<InquiriesRow>
        Relationships: [
          {
            foreignKeyName: 'inquiries_property_id_fkey'
            columns: ['property_id']
            isOneToOne: false
            referencedRelation: 'properties'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: ProfilesRow
        Insert: Omit<ProfilesRow, 'created_at'> & Partial<Pick<ProfilesRow, 'created_at'>>
        Update: Partial<ProfilesRow>
        Relationships: []
      }
      admin_users: {
        Row: AdminUsersRow
        Insert: Omit<AdminUsersRow, 'id' | 'created_at'> &
          Partial<Pick<AdminUsersRow, 'id' | 'created_at'>>
        Update: Partial<AdminUsersRow>
        Relationships: []
      }
      saved_properties: {
        Row: SavedPropertiesRow
        Insert: Omit<SavedPropertiesRow, 'id' | 'created_at'> &
          Partial<Pick<SavedPropertiesRow, 'id' | 'created_at'>>
        Update: Partial<SavedPropertiesRow>
        Relationships: [
          {
            foreignKeyName: 'saved_properties_property_id_fkey'
            columns: ['property_id']
            isOneToOne: false
            referencedRelation: 'properties'
            referencedColumns: ['id']
          },
        ]
      }
      push_subscriptions: {
        Row: PushSubscriptionsRow
        Insert: Omit<PushSubscriptionsRow, 'id' | 'created_at'> &
          Partial<Pick<PushSubscriptionsRow, 'id' | 'created_at'>>
        Update: Partial<PushSubscriptionsRow>
        Relationships: []
      }
      notifications: {
        Row: NotificationsRow
        Insert: Omit<NotificationsRow, 'id' | 'created_at' | 'read'> &
          Partial<Pick<NotificationsRow, 'id' | 'created_at' | 'read'>>
        Update: Partial<NotificationsRow>
        Relationships: []
      }
    }
    Views: {
      location_showcase: {
        Row: {
          location: string
          property_count: number
          cover_images: string[] | null
        }
        Relationships: []
      }
      property_type_showcase: {
        Row: {
          property_type: string
          property_count: number
          cover_images: string[] | null
        }
        Relationships: []
      }
      catalogue_stats: {
        Row: {
          total_listings: number
          for_sale: number
          for_rent: number
          shortlets: number
          verified_listings: number
          areas_covered: number
        }
        Relationships: []
      }
    }
    Functions: {
      is_admin: {
        Args: { uid: string }
        Returns: boolean
      }
      notification_audience: {
        Args: { target_location: string }
        Returns: { user_id: string }[]
      }
      search_properties: {
        Args: { q: string; max_results?: number }
        Returns: PropertiesRow[]
      }
    }
    Enums: EmptyRecord
    CompositeTypes: EmptyRecord
  }
}
