'use client'

import { ArrowRight, Search } from 'lucide-react'
import Link from 'next/link'
import { useSearchOverlay } from '@/components/search/SearchProvider'
import { LOCATION_LANDING_PAGES } from '@/lib/constants'

export function HeroSearch() {
  const { openSearch } = useSearchOverlay()

  return (
    <div className="w-full max-w-lg">
      <button
        type="button"
        onClick={openSearch}
        className="group border-ink hover:border-brand flex h-14 w-full items-center gap-3 border-b-2 text-left transition-colors"
      >
        <Search size={18} className="text-ink shrink-0" aria-hidden="true" />
        <span className="text-muted flex-1 truncate text-[15px]">
          Search by area, price or property type
        </span>
        <ArrowRight
          size={17}
          aria-hidden="true"
          className="text-ink shrink-0 transition-transform group-hover:translate-x-1"
        />
      </button>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="text-muted text-eyebrow font-semibold uppercase">Popular</span>
        {LOCATION_LANDING_PAGES.map(location => (
          <Link
            key={location.slug}
            href={`/properties/${location.slug}`}
            className="text-ink hover:text-brand border-b border-transparent pb-0.5 text-[14px] font-medium transition-colors hover:border-current"
          >
            {location.name}
          </Link>
        ))}
      </div>
    </div>
  )
}
