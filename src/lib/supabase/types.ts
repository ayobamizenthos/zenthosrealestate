import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

/** The only Supabase client type the query layer accepts, browser or server. */
export type ZenthosSupabaseClient = SupabaseClient<Database>
