import 'server-only'

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import { assertServiceRoleConfigured, publicEnv, serverEnv } from '@/lib/env'

/**
 * Bypasses RLS. Only for work no user is allowed to do directly: writing
 * notification rows for other people and reading push subscriptions during
 * fan-out. Never import this from a Client Component.
 */
export function createSupabaseServiceClient() {
  assertServiceRoleConfigured()

  return createClient<Database>(publicEnv.supabaseUrl, serverEnv.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
