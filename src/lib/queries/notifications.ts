import type { ZenthosSupabaseClient } from '@/lib/supabase/types'
import type { AppNotification, NotificationKind } from '@/lib/types'

const NOTIFICATION_COLUMNS = 'id, user_id, kind, title, body, url, read, created_at'

function toNotification(row: {
  id: string
  user_id: string
  kind: string
  title: string
  body: string
  url: string
  read: boolean
  created_at: string
}): AppNotification {
  return { ...row, kind: row.kind as NotificationKind }
}

export async function listNotifications(
  supabase: ZenthosSupabaseClient,
  userId: string,
  limit = 50
): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select(NOTIFICATION_COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(`Failed to load notifications: ${error.message}`)
  return (data ?? []).map(toNotification)
}

export async function countUnreadNotifications(
  supabase: ZenthosSupabaseClient,
  userId: string
): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false)

  if (error) return 0
  return count ?? 0
}

export async function markNotificationsRead(
  supabase: ZenthosSupabaseClient,
  userId: string,
  notificationIds?: string[]
): Promise<void> {
  let query = supabase.from('notifications').update({ read: true }).eq('user_id', userId)
  if (notificationIds?.length) query = query.in('id', notificationIds)

  const { error } = await query.eq('read', false)
  if (error) throw new Error(`Failed to mark notifications read: ${error.message}`)
}
