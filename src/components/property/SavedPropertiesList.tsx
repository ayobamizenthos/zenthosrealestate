'use client'

import { ButtonLink } from '@/components/ui/Button'
import { EmptyState, NoSavedIllustration } from '@/components/ui/EmptyState'
import type { PropertySummary } from '@/lib/types'
import { PropertyCard } from './PropertyCard'
import { SaveButton } from './SaveButton'
import { useSavedProperties } from './SavedProvider'

/**
 * Server-rendered for the first paint, then narrowed client-side so unsaving a
 * property removes the card immediately instead of after a round trip.
 */
export function SavedPropertiesList({ properties }: { properties: PropertySummary[] }) {
  const { savedIds } = useSavedProperties()
  const visible = properties.filter(property => savedIds.has(property.id))

  if (!visible.length) {
    return (
      <EmptyState
        illustration={<NoSavedIllustration />}
        title="Save properties you like"
        description="Tap the heart on any listing and it will be waiting here when you come back."
        action={<ButtonLink href="/properties">Browse properties</ButtonLink>}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3 lg:gap-6">
      {visible.map((property, index) => (
        <PropertyCard
          key={property.id}
          property={property}
          priority={index < 2}
          action={<SaveButton propertyId={property.id} propertyTitle={property.title} />}
        />
      ))}
    </div>
  )
}
