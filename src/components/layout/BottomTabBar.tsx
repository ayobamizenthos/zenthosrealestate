'use client'

import clsx from 'clsx'
import { Bookmark, House, Newspaper, Search, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSavedProperties } from '@/components/property/SavedProvider'

const TAB_ITEM_CLASSES =
  'flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors'

// Distance from the page bottom at which the bar retracts, chosen to clear the
// oversized footer wordmark rather than sit on top of it.
const FOOTER_REVEAL_PX = 180

export function BottomTabBar() {
  const pathname = usePathname()
  const { savedCount } = useSavedProperties()
  const [isAtFooter, setIsAtFooter] = useState(false)

  const isHome = pathname === '/'
  const isBrowsing = pathname.startsWith('/properties')
  const isBlog = pathname.startsWith('/blog')
  const isSaved = pathname.startsWith('/saved')
  const isProfile = pathname.startsWith('/profile')

  useEffect(() => {
    const sync = () => {
      const remaining = document.documentElement.scrollHeight - window.scrollY - window.innerHeight
      setIsAtFooter(remaining < FOOTER_REVEAL_PX)
    }

    sync()
    window.addEventListener('scroll', sync, { passive: true })
    window.addEventListener('resize', sync)
    return () => {
      window.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
    }
  }, [])

  return (
    <nav
      aria-label="Primary"
      aria-hidden={isAtFooter ? true : undefined}
      className={clsx(
        'bg-canvas/95 safe-bottom fixed inset-x-0 bottom-0 z-50 backdrop-blur-md transition-transform duration-300 ease-out md:hidden',
        isAtFooter ? 'pointer-events-none translate-y-full' : 'translate-y-0'
      )}
    >
      <div className="flex h-16">
        <Link
          href="/"
          className={clsx(TAB_ITEM_CLASSES, isHome ? 'text-brand' : 'text-muted')}
          aria-current={isHome ? 'page' : undefined}
        >
          <House size={21} aria-hidden="true" />
          Home
        </Link>

        <Link
          href="/properties"
          className={clsx(TAB_ITEM_CLASSES, isBrowsing ? 'text-brand' : 'text-muted')}
          aria-current={isBrowsing ? 'page' : undefined}
        >
          <Search size={21} aria-hidden="true" />
          Search
        </Link>

        <Link
          href="/blog"
          className={clsx(TAB_ITEM_CLASSES, isBlog ? 'text-brand' : 'text-muted')}
          aria-current={isBlog ? 'page' : undefined}
        >
          <Newspaper size={21} aria-hidden="true" />
          Blog
        </Link>

        <Link
          href="/saved"
          className={clsx(TAB_ITEM_CLASSES, isSaved ? 'text-brand' : 'text-muted')}
          aria-current={isSaved ? 'page' : undefined}
        >
          <span className="relative">
            <Bookmark size={21} aria-hidden="true" fill={isSaved ? 'currentColor' : 'none'} />
            {savedCount > 0 ? (
              <span className="bg-brand ring-canvas absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white ring-2">
                {savedCount > 9 ? '9+' : savedCount}
              </span>
            ) : null}
          </span>
          Saved
        </Link>

        <Link
          href="/profile"
          className={clsx(TAB_ITEM_CLASSES, isProfile ? 'text-brand' : 'text-muted')}
          aria-current={isProfile ? 'page' : undefined}
        >
          <User size={21} aria-hidden="true" />
          Profile
        </Link>
      </div>
    </nav>
  )
}
