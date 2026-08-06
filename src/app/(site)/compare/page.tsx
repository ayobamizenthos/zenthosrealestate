import type { Metadata } from 'next'
import { MoreListingsCta } from '@/components/property/MoreListingsCta'
import { CompareTable } from '@/components/property/CompareTable'
import { MAX_COMPARE_PROPERTIES } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Compare properties',
  robots: { index: false, follow: false },
}

export default function ComparePage() {
  return (
    <div className="app-shell py-6 md:py-10">
      <header className="mb-6">
        <h1 className="text-title md:text-display text-brand font-extrabold">Compare</h1>
        <p className="text-muted mt-1 text-[14px]">
          Up to {MAX_COMPARE_PROPERTIES} properties, side by side.
        </p>
      </header>

      <CompareTable />
      <MoreListingsCta />
    </div>
  )
}
