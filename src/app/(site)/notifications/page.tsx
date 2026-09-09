import type { Metadata } from 'next'
import { DeviceAlertList } from '@/components/notifications/DeviceAlertList'
import { NotificationList } from '@/components/notifications/NotificationList'
import { getCurrentUser } from '@/lib/auth'
import { isSupabaseConfigured } from '@/lib/env'
import { listNotifications } from '@/lib/queries/notifications'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { AppNotification } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Notifications',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function NotificationsPage() {
  const user = isSupabaseConfigured ? await getCurrentUser() : null

  let notifications: AppNotification[] = []
  if (user) {
    const supabase = await createSupabaseServerClient()
    notifications = await listNotifications(supabase, user.id).catch(() => [])
  }

  return (
    <div className="app-shell py-6 md:py-10">
      <header className="mb-6">
        <h1 className="text-ink text-[28px] font-extrabold md:text-[36px]">Notifications</h1>
        <p className="text-muted mt-1 text-[14px]">
          {user
            ? 'New listings, price drops and updates on the properties you follow.'
            : 'Every listing published while you have the site open. Sign in to keep them across devices.'}
        </p>
      </header>

      {/*
        Two sources: notifications stored against the account, and alerts this
        device picked up over realtime. Signed-out visitors only have the latter.
      */}
      {user ? (
        <div className="space-y-8">
          <NotificationList notifications={notifications} userId={user.id} />

          <DeviceAlertList hideWhenEmpty />
        </div>
      ) : (
        <DeviceAlertList />
      )}
    </div>
  )
}
