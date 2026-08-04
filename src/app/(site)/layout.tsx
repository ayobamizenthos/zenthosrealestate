import { AuthProvider } from '@/components/auth/AuthProvider'
import { BottomTabBar } from '@/components/layout/BottomTabBar'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { WhatsAppFab } from '@/components/layout/WhatsAppFab'
import { NotificationPermissionBanner } from '@/components/notifications/NotificationPermissionBanner'
import { NotificationToaster } from '@/components/notifications/NotificationToaster'
import { CompareBar } from '@/components/property/CompareBar'
import { CompareProvider } from '@/components/property/CompareProvider'
import { SavedProvider } from '@/components/property/SavedProvider'
import { InstallBanner } from '@/components/pwa/InstallBanner'
import { SearchProvider } from '@/components/search/SearchProvider'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SavedProvider>
        <CompareProvider>
          <SearchProvider>
            <SiteHeader />

            <main className="pb-tabbar flex-1 md:pb-0">{children}</main>
            <SiteFooter />
            <WhatsAppFab />
            <CompareBar />
            <NotificationToaster />
            <InstallBanner />
            <NotificationPermissionBanner />
            <BottomTabBar />
          </SearchProvider>
        </CompareProvider>
      </SavedProvider>
    </AuthProvider>
  )
}
