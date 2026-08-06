import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { propertyBlurPlaceholder, propertyCardImage } from '@/lib/cloudinary'
import type { PropertyTypeShowcaseEntry } from '@/lib/queries/locations'

const TILE_SIZES = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'

export function PropertyTypeShowcase({ types }: { types: PropertyTypeShowcaseEntry[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {types.map(entry => (
        <Link
          key={entry.propertyType}
          href={`/properties?type=${encodeURIComponent(entry.propertyType)}`}
          className="group shadow-card hover:shadow-card-hover rounded-card relative block overflow-hidden bg-white transition-shadow"
        >
          <div className="bg-surface relative aspect-[4/3] overflow-hidden">
            {entry.coverImage ? (
              <Image
                src={propertyCardImage(entry.coverImage)}
                alt=""
                fill
                sizes={TILE_SIZES}
                placeholder="blur"
                blurDataURL={propertyBlurPlaceholder(entry.coverImage)}
                className="ease-out-soft object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-3 p-5">
            <span className="min-w-0">
              <span className="text-ink block truncate text-[18px] font-bold">
                {entry.propertyType}
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
