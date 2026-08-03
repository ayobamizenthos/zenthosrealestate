import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { PriceBand } from '@/lib/queries/locations'

function bandHref(band: PriceBand): string {
  const params = new URLSearchParams()
  if (band.min !== null) params.set('min', String(band.min))
  if (band.max !== null) params.set('max', String(band.max))
  params.set('sort', 'price-asc')
  return `/properties?${params.toString()}`
}

/**
 * Budget is the first cut most buyers make. Counts come from the catalogue, and
 * bands holding nothing are filtered out upstream so this never sends anyone to
 * an empty result set.
 */
export function PriceBands({ bands }: { bands: PriceBand[] }) {
  if (!bands.length) return null

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {bands.map(band => (
        <Link
          key={band.label}
          href={bandHref(band)}
          className="group border-hairline hover:border-ink flex items-center justify-between gap-3 border bg-white px-5 py-5 transition-colors"
        >
          <span className="min-w-0">
            <span className="text-ink block text-[17px] leading-tight font-bold">{band.label}</span>
            <span className="text-muted mt-1 block text-[13px]">
              {band.propertyCount} {band.propertyCount === 1 ? 'home' : 'homes'}
            </span>
          </span>

          <ArrowRight
            size={18}
            aria-hidden="true"
            className="text-muted group-hover:text-brand shrink-0 transition-transform group-hover:translate-x-1"
          />
        </Link>
      ))}
    </div>
  )
}
