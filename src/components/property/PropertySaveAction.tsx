'use client'

import { SaveButton } from './SaveButton'

export function PropertySaveAction({
  propertyId,
  propertyTitle,
}: {
  propertyId: string
  propertyTitle: string
}) {
  return <SaveButton propertyId={propertyId} propertyTitle={propertyTitle} />
}
