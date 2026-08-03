import type { PropertySummary } from '@/lib/types'
import { PropertyCard } from './PropertyCard'
import { PropertySaveAction } from './PropertySaveAction'

/**
 * Single-column feed of wide rows. One definition is shared by browse, search,
 * location pages and saved, so the rhythm can never drift between them.
 */
export function PropertyFeed({
  properties,
  showSaveAction = true,
}: {
  properties: PropertySummary[]
  showSaveAction?: boolean
}) {
  return (
    <div className="flex flex-col gap-4">
      {properties.map((property, position) => (
        <PropertyCard
          key={property.id}
          property={property}
          priority={position < 2}
          action={
            showSaveAction ? (
              <PropertySaveAction propertyId={property.id} propertyTitle={property.title} />
            ) : null
          }
        />
      ))}
    </div>
  )
}
