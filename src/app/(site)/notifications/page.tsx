import type { Metadata } from 'next'
import { DeviceAlertList } from '@/components/notifications/DeviceAlertList'

export const metadata: Metadata = {
  title: 'Notifications',
  robots: { index: false, follow: false },
}

export default function NotificationsPage() {
  return (
    <div className="app-shell py-6 md:py-10">
      <header className="mb-6">
        <h1 className="text-ink text-[28px] font-extrabold md:text-[36px]">Notifications</h1>
        <p className="text-muted mt-1 text-[14px]">
          Every listing published while you have the site open.
        </p>
      </header>

      <DeviceAlertList />
    </div>
  )
}
