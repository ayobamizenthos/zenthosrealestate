import { Pencil, Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { DeletePropertyButton } from '@/components/admin/DeletePropertyButton'
import { StatusBadge } from '@/components/ui/Badge'
import { ButtonLink } from '@/components/ui/Button'
import { propertyCardImage } from '@/lib/cloudinary'
import { PROPERTY_LOCATIONS, PROPERTY_STATUSES } from '@/lib/constants'
import type { PropertyLocation, PropertyStatus } from '@/lib/constants'
import { requireAdmin } from '@/lib/auth'
import { displayPriceCompact, formatDate } from '@/lib/format'
import { listPropertiesForAdmin } from '@/lib/queries/admin'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function readParam(params: Record<string, string | string[] | undefined>, key: string): string {
  const value = params[key]
  return (Array.isArray(value) ? value[0] : value) ?? ''
}

export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { supabase } = await requireAdmin()
  const params = await searchParams

  const statusParam = readParam(params, 'status')
  const locationParam = readParam(params, 'location')

  const filters = {
    search: readParam(params, 'q').slice(0, 100),
    status: (PROPERTY_STATUSES as readonly string[]).includes(statusParam)
      ? (statusParam as PropertyStatus)
      : ('All' as const),
    location: (PROPERTY_LOCATIONS as readonly string[]).includes(locationParam)
      ? (locationParam as PropertyLocation)
      : ('All' as const),
  }

  const properties = await listPropertiesForAdmin(supabase, filters).catch(() => [])

  return (
    <div className="app-shell py-6 md:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-title md:text-display text-brand font-extrabold">Properties</h1>
        <ButtonLink href="/admin/properties/new">
          <Plus size={17} aria-hidden="true" />
          Add property
        </ButtonLink>
      </div>

      <form method="get" className="mt-5 flex flex-wrap gap-2">
        <input
          type="search"
          name="q"
          defaultValue={filters.search}
          placeholder="Search by title…"
          aria-label="Search properties by title"
          className="border-hairline focus:border-brand rounded-control h-11 min-w-0 flex-1 border px-3.5 text-[15px] outline-none md:max-w-xs"
        />

        <select
          name="status"
          defaultValue={filters.status}
          aria-label="Filter by status"
          className="border-hairline rounded-control h-11 border bg-white px-3 text-[15px]"
        >
          <option value="All">All statuses</option>
          {PROPERTY_STATUSES.map(status => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          name="location"
          defaultValue={filters.location}
          aria-label="Filter by location"
          className="border-hairline rounded-control h-11 border bg-white px-3 text-[15px]"
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
          className="bg-brand text-brand-ink rounded-control h-11 px-4 text-[15px] font-semibold"
        >
          Apply
        </button>
      </form>

      {properties.length === 0 ? (
        <p className="border-hairline text-muted mt-6 rounded-card border bg-white p-8 text-center text-[14px]">
          No properties match. Adjust the filters or add a new listing.
        </p>
      ) : (
        <div className="border-hairline mt-6 overflow-x-auto rounded-card border">
          <table className="w-full min-w-[720px] border-collapse bg-white text-left">
            <thead className="bg-surface">
              <tr className="text-muted text-[12px] font-semibold tracking-wide uppercase">
                <th scope="col" className="px-4 py-3">
                  Property
                </th>
                <th scope="col" className="px-4 py-3">
                  Location
                </th>
                <th scope="col" className="px-4 py-3">
                  Price
                </th>
                <th scope="col" className="px-4 py-3">
                  Status
                </th>
                <th scope="col" className="px-4 py-3">
                  Added
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-hairline divide-y">
              {properties.map(property => (
                <tr key={property.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="bg-surface relative h-11 w-16 shrink-0 overflow-hidden rounded-md">
                        {property.images[0] ? (
                          <Image
                            src={propertyCardImage(property.images[0])}
                            alt=""
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : null}
                      </span>
                      <div className="min-w-0">
                        <p className="text-ink truncate text-[14px] font-semibold">
                          {property.title}
                        </p>
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
                  </td>

                  <td className="text-ink px-4 py-3 text-[14px]">{property.location}</td>
                  <td className="text-ink px-4 py-3 text-[14px] font-semibold">
                    {displayPriceCompact(property.price, property.price_label)}
                  </td>
                  <td className="px-4 py-3">
                    {property.status === 'Available' ? (
                      <span className="text-success text-[13px] font-semibold">Available</span>
                    ) : (
                      <StatusBadge status={property.status} />
                    )}
                  </td>
                  <td className="text-muted px-4 py-3 text-[13px]">
                    {formatDate(property.created_at)}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/properties/edit/${property.id}`}
                        aria-label={`Edit ${property.title}`}
                        className="text-muted hover:text-brand flex h-10 w-10 items-center justify-center transition-colors"
                      >
                        <Pencil size={16} aria-hidden="true" />
                      </Link>
                      <DeletePropertyButton id={property.id} title={property.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
