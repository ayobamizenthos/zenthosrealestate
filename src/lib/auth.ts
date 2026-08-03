import 'server-only'

import type { User } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { ZenthosSupabaseClient } from '@/lib/supabase/types'

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function isUserAdmin(
  supabase: ZenthosSupabaseClient,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_admin', { uid: userId })
  if (error) return false
  return data === true
}

export async function requireUser(returnTo: string): Promise<User> {
  const user = await getCurrentUser()
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`)
  return user
}

/**
 * Gate for every /admin route. Non-admins are sent home rather than to the
 * login screen — telling them an admin area exists is a needless disclosure.
 */
export async function requireAdmin(): Promise<{
  user: User
  supabase: ZenthosSupabaseClient
}> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/admin')
  if (!(await isUserAdmin(supabase, user.id))) redirect('/')

  return { user, supabase }
}
