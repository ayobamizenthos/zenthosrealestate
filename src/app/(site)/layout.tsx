import { AuthProvider } from '@/components/auth/AuthProvider'
import { BottomTabBar } from '@/components/layout/BottomTabBar'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { ContactFab } from '@/components/layout/ContactFab'
import { NotificationPermissionBanner } from '@/components/notifications/NotificationPermissionBanner'
import { NotificationToaster } from '@/components/notifications/NotificationToaster'
import { CompareBar } from '@/components/property/CompareBar'
import { CompareProvider } from '@/components/property/CompareProvider'
import { SavedProvider } from '@/components/property/SavedProvider'
import { InstallBanner } from '@/components/pwa/InstallBanner'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SavedProvider>
        <CompareProvider>
          <SiteHeader />

          <main className="pb-tabbar flex-1 md:pb-0">{children}</main>
          <SiteFooter />
          <ContactFab />
          <CompareBar />
          <NotificationToaster />
          <InstallBanner />
          <NotificationPermissionBanner />
          <BottomTabBar />
        </CompareProvider>
      </SavedProvider>
    </AuthProvider>
  )
}
