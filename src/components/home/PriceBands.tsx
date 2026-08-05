import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import type { PriceBand } from '@/lib/queries/locations'

function bandHref(band: PriceBand): string {
  const params = new URLSearchParams()
  if (band.min !== null) params.set('min', String(band.min))
  if (band.max !== null) params.set('max', String(band.max))
  params.set('sort', 'price-asc')
  return `/properties?${params.toString()}`
}

export function PriceBands({ bands }: { bands: PriceBand[] }) {
  if (!bands.length) return null

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
      {bands.map(band => (
        <Link
          key={band.label}
          href={bandHref(band)}
          className="group rounded-card shadow-card hover:shadow-card-hover relative isolate flex flex-col justify-between gap-6 overflow-hidden bg-white p-5 transition-shadow md:p-6"
        >
          <span
            aria-hidden="true"
            className="from-brand/8 pointer-events-none absolute inset-x-0 -top-16 -z-10 h-32 bg-gradient-to-b to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />

          <span className="text-ink text-[19px] leading-tight font-extrabold md:text-[21px]">
            {band.label}
          </span>

          <span className="flex items-end justify-between gap-3">
            <span className="text-muted text-[13px]">
              {band.propertyCount} {band.propertyCount === 1 ? 'home' : 'homes'}
            </span>

            <span className="bg-surface text-ink group-hover:bg-brand flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors group-hover:text-white">
              <ArrowUpRight size={17} aria-hidden="true" />
            </span>
          </span>
        </Link>
      ))}
    </div>
  )
}
