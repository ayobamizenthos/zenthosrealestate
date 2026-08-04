import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { propertyBlurPlaceholder, propertyCardImage } from '@/lib/cloudinary'
import { LOCATIONS_BY_ZONE } from '@/lib/constants'
import type { LocationShowcaseEntry } from '@/lib/queries/locations'

const TILE_SIZES = '(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw'

const MAINLAND_AREAS: readonly string[] = LOCATIONS_BY_ZONE.Mainland

export function LocationShowcase({ locations }: { locations: LocationShowcaseEntry[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
      {locations.map(location => (
        <Link key={location.slug} href={`/properties/${location.slug}`} className="group block">
          <div className="bg-surface relative aspect-[4/5] overflow-hidden">
            {location.coverImage ? (
              <Image
                src={propertyCardImage(location.coverImage)}
                alt=""
                fill
                sizes={TILE_SIZES}
                placeholder="blur"
                blurDataURL={propertyBlurPlaceholder(location.coverImage)}
                className="ease-out-soft object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
            ) : null}
          </div>

          <div className="border-hairline mt-3 flex items-start justify-between gap-2 border-t pt-3">
            <div className="min-w-0">
              <p className="text-muted text-[11px] font-semibold tracking-wide uppercase">
                {MAINLAND_AREAS.includes(location.location) ? 'Mainland' : 'Island'}
              </p>
              <h3 className="text-ink mt-1 truncate text-[17px] leading-tight font-bold md:text-[19px]">
                {location.location}
              </h3>
              <p className="text-muted mt-0.5 text-[12px]">
                {location.propertyCount} {location.propertyCount === 1 ? 'listing' : 'listings'}
              </p>
            </div>

            <ArrowUpRight
              size={17}
              aria-hidden="true"
              className="text-muted group-hover:text-brand mt-1 shrink-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </div>
        </Link>
      ))}
    </div>
  )
}
