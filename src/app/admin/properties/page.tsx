import { Pencil, Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { DeletePropertyButton } from '@/components/admin/DeletePropertyButton'
import { ButtonLink } from '@/components/ui/Button'
import { propertyCardImage } from '@/lib/cloudinary'
import { PROPERTY_LOCATIONS } from '@/lib/constants'
import type { PropertyLocation } from '@/lib/constants'
import { requireAdmin } from '@/lib/auth'
import { displayPriceCompact, formatDate } from '@/lib/format'
import { listPropertiesForAdmin } from '@/lib/queries/admin'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function readParam(params: Record<string, string | string[] | undefined>, key: string): string {
  const value = params[key]
  return (Array.isArray(value) ? value[0] : value) ?? ''
}

function PropertyThumb({ image }: { image: string | undefined }) {
  return (
    <span className="bg-surface relative h-11 w-16 shrink-0 overflow-hidden rounded-md">
      {image ? (
        <Image src={propertyCardImage(image)} alt="" fill sizes="64px" className="object-cover" />
      ) : null}
    </span>
  )
}

export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { supabase } = await requireAdmin()
  const params = await searchParams

  const locationParam = readParam(params, 'location')

  const filters = {
    search: readParam(params, 'q').slice(0, 100),
    location: (PROPERTY_LOCATIONS as readonly string[]).includes(locationParam)
      ? (locationParam as PropertyLocation)
      : ('All' as const),
  }

  const properties = await listPropertiesForAdmin(supabase, filters).catch(() => [])

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-title md:text-display text-brand font-extrabold">Properties</h1>
        <ButtonLink href="/admin/properties/new">
          <Plus size={17} aria-hidden="true" />
          Add property
        </ButtonLink>
      </div>

      <form method="get" className="mt-5 grid gap-2 sm:grid-cols-2 lg:flex lg:flex-wrap">
        <input
          type="search"
          name="q"
          defaultValue={filters.search}
          placeholder="Search by title…"
          aria-label="Search properties by title"
          className="border-hairline focus:border-brand rounded-control h-11 min-w-0 border px-3.5 text-[16px] outline-none sm:col-span-2 lg:w-64 lg:flex-1 lg:col-span-1"
        />

        <select
          name="location"
          defaultValue={filters.location}
          aria-label="Filter by location"
          className="border-hairline rounded-control h-11 min-w-0 border bg-white px-3 text-[16px] lg:w-44"
        >
          <option value="All">All locations</option>
          {PROPERTY_LOCATIONS.map(location => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="bg-brand text-brand-ink rounded-control h-11 px-4 text-[15px] font-semibold sm:col-span-2 lg:col-span-1 lg:w-24"
        >
          Apply
        </button>
      </form>

      {properties.length === 0 ? (
        <p className="border-hairline text-muted mt-6 rounded-card border bg-white p-8 text-center text-[14px]">
          No properties match. Adjust the filters or add a new listing.
        </p>
      ) : (
        /*
          A five-column table only fits from `lg` up. Below that the same listing
          renders as a card, so nothing is ever pushed off the side of a phone.
        */
        <ul className="border-hairline divide-hairline mt-6 divide-y overflow-hidden rounded-card border bg-white">
          <li className="text-muted bg-surface hidden px-4 py-3 text-[12px] font-semibold tracking-wide uppercase lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,1.2fr)_minmax(0,1.4fr)_88px] lg:gap-4">
            <span>Property</span>
            <span>Location</span>
            <span>Price</span>
            <span className="text-right">Actions</span>
          </li>

          {properties.map(property => (
            <li
              key={property.id}
              className="px-4 py-3 lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,1.2fr)_minmax(0,1.4fr)_88px] lg:items-center lg:gap-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <PropertyThumb image={property.images[0]} />
                <div className="min-w-0 flex-1">
                  <p className="text-ink truncate text-[14px] font-semibold">{property.title}</p>
                  <p className="text-muted text-[12px]">
                    {property.published ? (
                      property.featured ? (
                        'Published · Featured'
                      ) : (
                        'Published'
                      )
                    ) : (
                      <span className="text-danger font-semibold">Draft</span>
                    )}
                  </p>
                </div>
              </div>

              <p className="text-muted mt-2 flex flex-wrap items-center gap-x-1.5 text-[13px] lg:hidden">
                <span className="text-ink">{property.location}</span>
                <span aria-hidden="true">·</span>
                <span className="text-ink font-semibold">
                  {displayPriceCompact(property.price, property.price_label)}
                </span>
                <span aria-hidden="true">·</span>
                <span>{formatDate(property.created_at)}</span>
              </p>

              <span className="text-ink hidden text-[14px] lg:block">{property.location}</span>

              <span className="hidden lg:block">
                <span className="text-ink block text-[14px] font-semibold">
                  {displayPriceCompact(property.price, property.price_label)}
                </span>
                <span className="text-muted block text-[12px]">
                  {formatDate(property.created_at)}
                </span>
              </span>

              <div className="mt-1 flex items-center gap-1 lg:mt-0 lg:justify-end">
                <Link
                  href={`/admin/properties/edit/${property.id}`}
                  aria-label={`Edit ${property.title}`}
                  className="text-muted hover:text-brand flex h-10 w-10 items-center justify-center transition-colors"
                >
                  <Pencil size={16} aria-hidden="true" />
                </Link>
                <DeletePropertyButton id={property.id} title={property.title} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
