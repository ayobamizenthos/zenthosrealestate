'use client'

import { Check, LoaderCircle, Minus, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ButtonLink } from '@/components/ui/Button'
import { EmptyState, NoResultsIllustration } from '@/components/ui/EmptyState'
import { propertyCardImage } from '@/lib/cloudinary'
import { AMENITIES } from '@/lib/constants'
import { displayPrice } from '@/lib/format'
import { getPropertiesForCompare } from '@/lib/queries/properties'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { Property } from '@/lib/types'
import { useCompare } from './CompareProvider'

/**
 * The selection lives in localStorage, so the comparison is assembled in the
 * browser rather than on the server.
 */
export function CompareTable() {
  const { compareIds, toggleCompare } = useCompare()
  // Tagging the result with the selection it came from lets both "loading" and
  // "stale" fall out of a render-time comparison instead of extra state.
  const [resolved, setResolved] = useState<{ key: string; properties: Property[] }>({
    key: '',
    properties: [],
  })

  const selectionKey = compareIds.join(',')

  useEffect(() => {
    if (!compareIds.length) return

    let cancelled = false

    getPropertiesForCompare(createSupabaseBrowserClient(), compareIds)
      .then(result => {
        if (!cancelled) setResolved({ key: selectionKey, properties: result })
      })
      .catch(() => {
        if (!cancelled) setResolved({ key: selectionKey, properties: [] })
      })

    return () => {
      cancelled = true
    }
  }, [compareIds, selectionKey])

  const isLoading = compareIds.length > 0 && resolved.key !== selectionKey
  const properties = resolved.key === selectionKey ? resolved.properties : []

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoaderCircle size={24} className="text-brand animate-spin" aria-hidden="true" />
      </div>
    )
  }

  if (!properties.length) {
    return (
      <EmptyState
        illustration={<NoResultsIllustration />}
        title="Nothing to compare yet"
        description="Add up to three properties from any listing and see them side by side here."
        action={<ButtonLink href="/properties">Browse properties</ButtonLink>}
      />
    )
  }

  // Only amenities that at least one property offers — an all-empty row is noise.
  const relevantAmenities = AMENITIES.filter(amenity =>
    properties.some(property => property.amenities.includes(amenity))
  )

  const specRows: { label: string; render: (property: Property) => string }[] = [
    { label: 'Price', render: property => displayPrice(property.price, property.price_label) },
    { label: 'Location', render: property => property.location },
    { label: 'Bedrooms', render: property => String(property.bedrooms) },
    { label: 'Bathrooms', render: property => String(property.bathrooms) },
    { label: 'Property type', render: property => property.property_type },
    { label: 'Furnishing', render: property => property.furnished },
    { label: 'Listing type', render: property => `For ${property.listing_type.toLowerCase()}` },
    { label: 'Status', render: property => property.status },
  ]

  return (
    <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
      <table className="w-full min-w-[560px] border-collapse text-left">
        <thead>
          <tr>
            <th scope="col" className="text-muted w-28 pb-3 text-[12px] font-semibold md:w-40">
              <span className="sr-only">Attribute</span>
            </th>
            {properties.map(property => (
              <th key={property.id} scope="col" className="pb-3 pl-3 align-top">
                <div className="relative">
                  <Link href={`/properties/${property.slug}`} className="block">
                    <span className="bg-surface relative block aspect-[16/10] overflow-hidden rounded-lg">
                      {property.images[0] ? (
                        <Image
                          src={propertyCardImage(property.images[0])}
                          alt={property.title}
                          fill
                          sizes="(min-width: 768px) 240px, 45vw"
                          className="object-cover"
                        />
                      ) : null}
                    </span>
                    <span className="text-ink mt-2 block text-[14px] leading-snug font-semibold">
                      {property.title}
                    </span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => toggleCompare(property.id)}
                    aria-label={`Remove ${property.title} from comparison`}
                    className="text-ink absolute top-1.5 right-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm"
                  >
                    <X size={15} aria-hidden="true" />
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {specRows.map(row => (
            <tr key={row.label} className="border-hairline border-t">
              <th scope="row" className="text-muted py-3 pr-3 text-[13px] font-medium align-top">
                {row.label}
              </th>
              {properties.map(property => (
                <td key={property.id} className="text-ink py-3 pl-3 text-[14px] font-semibold">
                  {row.render(property)}
                </td>
              ))}
            </tr>
          ))}

          {relevantAmenities.map(amenity => (
            <tr key={amenity} className="border-hairline border-t">
              <th scope="row" className="text-muted py-3 pr-3 text-[13px] font-medium align-top">
                {amenity}
              </th>
              {properties.map(property => (
                <td key={property.id} className="py-3 pl-3">
                  {property.amenities.includes(amenity) ? (
                    <>
                      <Check size={17} className="text-success" aria-hidden="true" />
                      <span className="sr-only">Included</span>
                    </>
                  ) : (
                    <>
                      <Minus size={17} className="text-muted" aria-hidden="true" />
                      <span className="sr-only">Not included</span>
                    </>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
