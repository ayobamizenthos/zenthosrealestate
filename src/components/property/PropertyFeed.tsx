import type { PropertySummary } from '@/lib/types'
import { PropertyCard } from './PropertyCard'
import { PropertySaveAction } from './PropertySaveAction'

export function PropertyFeed({
  properties,
  showSaveAction = true,
}: {
  properties: PropertySummary[]
  showSaveAction?: boolean
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {properties.map((property, position) => (
        <PropertyCard
          key={property.id}
          property={property}
          priority={position < 3}
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
