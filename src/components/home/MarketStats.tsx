import Link from 'next/link'
import { formatNairaCompact } from '@/lib/format'

export interface MarketStat {
  value: string
  label: string
  href?: string
}

export function MarketStats({ stats }: { stats: MarketStat[] }) {
  if (!stats.length) return null

  return (
    <section className="bg-brand text-white">
      <div className="app-shell grid grid-cols-2 gap-x-6 gap-y-10 py-14 md:py-16 lg:grid-cols-4">
        {stats.map(stat => {
          const body = (
            <>
              <p className="text-[34px] leading-none font-extrabold tracking-tight md:text-[44px]">
                {stat.value}
              </p>
              <p className="mt-2 text-[12px] font-semibold tracking-[0.14em] text-white/55 uppercase">
                {stat.label}
              </p>
            </>
          )

          return stat.href ? (
            <Link key={stat.label} href={stat.href} className="group block">
              <span className="block transition-opacity group-hover:opacity-80">{body}</span>
            </Link>
          ) : (
            <div key={stat.label}>{body}</div>
          )
        })}
      </div>
    </section>
  )
}

export function buildMarketStats(input: {
  totalListings: number
  areasCovered: number
  statesCovered: number
  lowestPrice: number | null
}): MarketStat[] {
  const stats: MarketStat[] = [
    {
      value: String(input.totalListings),
      label: input.totalListings === 1 ? 'Home for sale' : 'Homes for sale',
      href: '/properties',
    },
    { value: String(input.areasCovered), label: 'Areas covered' },
    { value: String(input.statesCovered), label: input.statesCovered === 1 ? 'State' : 'States' },
  ]

  if (input.lowestPrice !== null) {
    stats.push({
      value: `From ${formatNairaCompact(input.lowestPrice)}`,
      label: 'Entry price',
      href: '/properties?sort=price-asc',
    })
  }

  return stats
}
