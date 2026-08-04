import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import { assertSupabaseConfigured, publicEnv } from '@/lib/env'

export function createSupabasePublicClient() {
  assertSupabaseConfigured()

  return createClient<Database>(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
