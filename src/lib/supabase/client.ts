'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/database.types'
import { assertSupabaseConfigured, publicEnv } from '@/lib/env'

export function createSupabaseBrowserClient() {
  assertSupabaseConfigured()
  return createBrowserClient<Database>(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey)
}
