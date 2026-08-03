'use client'

import { Scale, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MAX_COMPARE_PROPERTIES } from '@/lib/constants'
import { useCompare } from './CompareProvider'

/**
 * Floating summary of the current comparison. Hidden on /compare itself, where
 * the selection is already the entire page.
 */
export function CompareBar() {
  const { compareIds, clearCompare } = useCompare()
  const pathname = usePathname()

  if (compareIds.length === 0 || pathname === '/compare') return null

  return (
    <div className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-40 px-4 md:bottom-6 md:left-1/2 md:w-auto md:-translate-x-1/2 md:px-0">
      <div className="bg-ink shadow-card-hover mx-auto flex max-w-md items-center gap-3 rounded-control px-3 py-2.5 text-white md:max-w-none">
        <Scale size={18} aria-hidden="true" className="shrink-0" />
        <p className="flex-1 text-[14px] font-medium">
          {compareIds.length} of {MAX_COMPARE_PROPERTIES} selected
        </p>

        <Link
          href="/compare"
          className="bg-brand rounded-control flex h-10 items-center px-4 text-[14px] font-semibold"
        >
          Compare
        </Link>

        <button
          type="button"
          onClick={clearCompare}
          aria-label="Clear comparison"
          className="flex h-10 w-10 items-center justify-center text-white/70 transition-colors hover:text-white"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
