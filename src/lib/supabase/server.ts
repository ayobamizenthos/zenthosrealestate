import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'
import { assertSupabaseConfigured, publicEnv } from '@/lib/env'

export async function createSupabaseServerClient() {
  assertSupabaseConfigured()
  const cookieStore = await cookies()

  return createServerClient<Database>(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // Server Components cannot mutate cookies. The middleware refreshes
          // the session on every request, so dropping the write is safe here.
        }
      },
    },
  })
}
