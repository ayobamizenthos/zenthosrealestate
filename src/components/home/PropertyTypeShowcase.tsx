import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { propertyBlurPlaceholder, propertyCardImage } from '@/lib/cloudinary'
import type { PropertyTypeShowcaseEntry } from '@/lib/queries/locations'

const TILE_SIZES = '(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw'

export function PropertyTypeShowcase({ types }: { types: PropertyTypeShowcaseEntry[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {types.map(entry => (
        <Link
          key={entry.propertyType}
          href={`/properties?type=${encodeURIComponent(entry.propertyType)}`}
          className="group border-hairline hover:border-ink block border bg-white transition-colors"
        >
          <div className="bg-surface relative aspect-[4/5] overflow-hidden">
            {entry.coverImage ? (
              <Image
                src={propertyCardImage(entry.coverImage)}
                alt=""
                fill
                sizes={TILE_SIZES}
                placeholder="blur"
                blurDataURL={propertyBlurPlaceholder(entry.coverImage)}
                className="ease-out-soft object-cover transition-transform duration-700 group-hover:scale-[1.05]"
              />
            ) : null}
          </div>

          <div className="flex items-start justify-between gap-2 p-3.5">
            <p className="text-ink min-w-0 truncate text-[14px] font-semibold">
              {entry.propertyType}
            </p>
            <ArrowUpRight
              size={16}
              aria-hidden="true"
              className="text-muted group-hover:text-brand mt-0.5 shrink-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </div>
        </Link>
      ))}
    </div>
  )
}
