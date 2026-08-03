'use client'

import { SaveButton } from './SaveButton'

/**
 * Thin client boundary so server-rendered grids can drop a heart onto a card
 * without the whole grid becoming a Client Component.
 */
export function PropertySaveAction({
  propertyId,
  propertyTitle,
}: {
  propertyId: string
  propertyTitle: string
}) {
  return <SaveButton propertyId={propertyId} propertyTitle={propertyTitle} />
}
