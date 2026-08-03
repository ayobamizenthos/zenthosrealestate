import type { Metadata } from 'next'
import { NotificationList } from '@/components/notifications/NotificationList'
import { requireUser } from '@/lib/auth'
import { listNotifications } from '@/lib/queries/notifications'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Notifications',
  robots: { index: false, follow: false },
}

// Session-scoped: never prerender, and never cache one user's list for another.
export const dynamic = 'force-dynamic'

export default async function NotificationsPage() {
  const user = await requireUser('/notifications')
  const supabase = await createSupabaseServerClient()
  const notifications = await listNotifications(supabase, user.id).catch(() => [])

  return (
    <div className="app-shell py-6 md:py-10">
      <header className="mb-6">
        <h1 className="text-title md:text-display text-brand font-extrabold">Notifications</h1>
      </header>

      <NotificationList notifications={notifications} userId={user.id} />
    </div>
  )
}
