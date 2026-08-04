import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { propertyBlurPlaceholder, propertyCardImage } from '@/lib/cloudinary'
import { LOCATIONS_BY_ZONE } from '@/lib/constants'
import type { LocationShowcaseEntry } from '@/lib/queries/locations'

const TILE_SIZES = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'

const MAINLAND_AREAS: readonly string[] = LOCATIONS_BY_ZONE.Mainland

export function LocationShowcase({ locations }: { locations: LocationShowcaseEntry[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {locations.map(location => (
        <Link
          key={location.slug}
          href={`/properties/${location.slug}`}
          className="group shadow-card hover:shadow-card-hover rounded-card relative block overflow-hidden bg-white transition-shadow"
        >
          <div className="bg-surface relative aspect-[4/3] overflow-hidden">
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

          <div className="flex items-center justify-between gap-3 p-5">
            <span className="min-w-0">
              <span className="text-muted block text-[11px] font-semibold tracking-wide uppercase">
                {MAINLAND_AREAS.includes(location.location) ? 'Mainland' : 'Island'}
              </span>
              <span className="text-ink mt-1 block truncate text-[18px] font-bold">
                {location.location}
              </span>
              <span className="text-muted mt-1 block text-[13px]">
                {location.propertyCount} {location.propertyCount === 1 ? 'listing' : 'listings'}
              </span>
            </span>

            <ArrowUpRight
              size={20}
              aria-hidden="true"
              className="text-muted group-hover:text-brand shrink-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </div>
        </Link>
      ))}
    </div>
  )
}
