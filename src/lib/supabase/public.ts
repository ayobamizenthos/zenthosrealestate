import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import { assertSupabaseConfigured, publicEnv } from '@/lib/env'

/**
 * Anon client with no cookie access, for data every visitor sees identically:
 * listings, area pages, the sitemap.
 *
 * This matters beyond tidiness. `createSupabaseServerClient` calls `cookies()`,
 * and any page that touches it is forced to render dynamically on every
 * request. Reading public data through this client instead lets those routes
 * stay statically generated and revalidated on a timer.
 *
 * RLS still applies — the anon role only ever sees published rows.
 */
export function createSupabasePublicClient() {
  assertSupabaseConfigured()

  return createClient<Database>(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
