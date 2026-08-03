'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/database.types'
import { assertSupabaseConfigured, publicEnv } from '@/lib/env'

/**
 * `createBrowserClient` memoises internally, so calling this per component is
 * cheap and avoids threading a client through props.
 */
export function createSupabaseBrowserClient() {
  assertSupabaseConfigured()
  return createBrowserClient<Database>(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey)
}
