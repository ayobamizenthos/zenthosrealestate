'use client'

import clsx from 'clsx'
import { Bell, Bookmark } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { ZenthosLogo } from '@/components/brand/ZenthosLogo'
import { useSavedProperties } from '@/components/property/SavedProvider'
import { useUnreadNotificationCount } from '@/hooks/useUnreadNotificationCount'
import { listingAlerts } from '@/lib/listing-alerts'
import { useLocalStore } from '@/lib/local-store'
import { LOCATION_LANDING_PAGES } from '@/lib/constants'

export function SiteHeader() {
  const { user } = useAuth()
  const accountUnread = useUnreadNotificationCount()
  const alerts = useLocalStore(listingAlerts)
  const unreadCount = accountUnread + alerts.filter(alert => !alert.read).length
  const { savedCount } = useSavedProperties()
  const pathname = usePathname()

  return (
    <header className="bg-canvas sticky top-0 z-40">
      <div className="app-shell flex h-16 items-center gap-2">
        <Link href="/" aria-label="Zenthos Real Estate home" className="mr-2 shrink-0">
          <ZenthosLogo />
        </Link>

        <div className="flex-1" />

        <nav aria-label="Main" className="hidden items-center lg:flex">
          <Link
            href="/properties"
            className={clsx(
              'rounded-control px-3 py-2 text-[14px] font-semibold whitespace-nowrap transition-colors',
              pathname === '/properties' ? 'text-brand' : 'text-ink hover:text-brand'
            )}
          >
            All properties
          </Link>

          {LOCATION_LANDING_PAGES.slice(0, 3).map(location => {
            const href = `/properties/${location.slug}`
            return (
              <Link
                key={location.slug}
                href={href}
                className={clsx(
                  'rounded-control px-3 py-2 text-[14px] font-semibold whitespace-nowrap transition-colors',
                  pathname === href ? 'text-brand' : 'text-ink hover:text-brand'
                )}
              >
                {location.name}
              </Link>
            )
          })}

          <Link
            href="/blog"
            className={clsx(
              'rounded-control px-3 py-2 text-[14px] font-semibold whitespace-nowrap transition-colors',
              pathname.startsWith('/blog') ? 'text-brand' : 'text-ink hover:text-brand'
            )}
          >
            Journal
          </Link>
        </nav>

        <Link
          href="/saved"
          aria-label={savedCount > 0 ? `Saved, ${savedCount} properties` : 'Saved properties'}
          className="text-brand hover:text-brand-hover relative hidden h-11 w-11 items-center justify-center md:flex"
        >
          <Bookmark size={20} aria-hidden="true" fill="currentColor" />
          {savedCount > 0 ? (
            <span className="bg-brand ring-canvas absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white ring-2">
              {savedCount > 9 ? '9+' : savedCount}
            </span>
          ) : null}
        </Link>

        <Link
          href="/notifications"
          aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
          className="text-ink hover:text-brand relative flex h-11 w-11 items-center justify-center"
        >
          <Bell size={19} aria-hidden="true" />
          {unreadCount > 0 ? (
            <span className="bg-brand ring-canvas absolute top-2 right-2 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white ring-2">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : null}
        </Link>

        {user ? (
          <Link
            href="/profile"
            className="text-ink hover:border-ink rounded-control hidden h-10 shrink-0 items-center px-4 text-[14px] font-semibold whitespace-nowrap transition-colors sm:flex"
          >
            My account
          </Link>
        ) : (
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <Link
              href="/login"
              className="text-ink hover:text-brand rounded-control flex h-10 items-center px-3 text-[14px] font-semibold whitespace-nowrap transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="bg-brand hover:bg-brand-hover rounded-control flex h-10 items-center px-4 text-[14px] font-semibold whitespace-nowrap text-white transition-colors"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
