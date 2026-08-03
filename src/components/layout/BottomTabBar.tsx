'use client'

import clsx from 'clsx'
import { Heart, House, Search, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSearchOverlay } from '@/components/search/SearchProvider'

const TAB_ITEM_CLASSES =
  'flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors'

/**
 * Native-feeling bottom navigation — the four destinations are always one tap
 * away, which is why this replaces a hamburger menu entirely.
 */
export function BottomTabBar() {
  const pathname = usePathname()
  const { openSearch } = useSearchOverlay()

  const isHome = pathname === '/'
  const isSaved = pathname.startsWith('/saved')
  const isProfile = pathname.startsWith('/profile')

  return (
    <nav
      aria-label="Primary"
      className="border-hairline bg-canvas/95 safe-bottom fixed inset-x-0 bottom-0 z-50 border-t backdrop-blur-md md:hidden"
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

        <button type="button" onClick={openSearch} className={clsx(TAB_ITEM_CLASSES, 'text-muted')}>
          <Search size={21} aria-hidden="true" />
          Search
        </button>

        <Link
          href="/saved"
          className={clsx(TAB_ITEM_CLASSES, isSaved ? 'text-brand' : 'text-muted')}
          aria-current={isSaved ? 'page' : undefined}
        >
          <Heart size={21} aria-hidden="true" />
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
