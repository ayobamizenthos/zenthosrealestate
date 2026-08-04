import 'server-only'

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import { assertServiceRoleConfigured, publicEnv, serverEnv } from '@/lib/env'

export function createSupabaseServiceClient() {
  assertServiceRoleConfigured()

  return createClient<Database>(publicEnv.supabaseUrl, serverEnv.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
