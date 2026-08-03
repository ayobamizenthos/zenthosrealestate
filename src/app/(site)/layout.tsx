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

/**
 * Deliberately reads no cookies. Resolving the session here made every public
 * page dynamic and cost three serial Supabase round trips before the first byte
 * — measured at ~2.1s TTFB. The viewer is resolved in the browser instead, so
 * listings stay statically cacheable and personalised chrome fills in on mount.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SavedProvider>
        <CompareProvider>
          <SearchProvider>
            <SiteHeader />
            {/* Bottom padding clears the fixed tab bar on mobile only. */}
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
