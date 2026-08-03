import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { propertyBlurPlaceholder, propertyCardImage } from '@/lib/cloudinary'
import type { LocationShowcaseEntry } from '@/lib/queries/locations'

const TILE_SIZES = '(min-width: 768px) 50vw, 100vw'

/**
 * Two-up editorial rows rather than four equal tiles — the alternating offset
 * keeps the eye moving down the page instead of scanning a flat grid.
 */
export function LocationShowcase({ locations }: { locations: LocationShowcaseEntry[] }) {
  return (
    <div className="grid gap-x-6 gap-y-12 md:grid-cols-2">
      {locations.map(location => (
        <Link
          key={location.slug}
          href={`/properties/${location.slug}`}
          className="group block md:even:mt-16"
        >
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

          <div className="border-hairline mt-4 flex items-end justify-between gap-4 border-t pt-4">
            <div>
              <p className="text-muted text-eyebrow font-semibold uppercase">Lagos</p>
              <h3 className="text-ink mt-2 text-[26px] leading-none md:text-[32px]">
                {location.location}
              </h3>
            </div>

            <ArrowUpRight
              size={22}
              aria-hidden="true"
              className="text-muted group-hover:text-brand mb-1 shrink-0 transition-all group-hover:-translate-y-1 group-hover:translate-x-1"
            />
          </div>
        </Link>
      ))}
    </div>
  )
}
