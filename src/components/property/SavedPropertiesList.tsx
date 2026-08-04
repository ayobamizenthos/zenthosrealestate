'use client'

import { useEffect, useMemo, useState } from 'react'
import { ButtonLink } from '@/components/ui/Button'
import { EmptyState, NoSavedIllustration } from '@/components/ui/EmptyState'
import { PropertyFeedSkeleton } from '@/components/ui/Skeleton'
import { getPropertiesByIds } from '@/lib/queries/properties'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { PropertySummary } from '@/lib/types'
import { PropertyCard } from './PropertyCard'
import { SaveButton } from './SaveButton'
import { useSavedProperties } from './SavedProvider'

export function SavedPropertiesList() {
  const { savedIds } = useSavedProperties()
  const [resolved, setResolved] = useState<{ ids: string[]; properties: PropertySummary[] } | null>(
    null
  )

  const key = [...savedIds].sort().join(',')
  const wanted = useMemo(() => (key ? key.split(',') : []), [key])

  useEffect(() => {
    if (wanted.length === 0) return

    let cancelled = false

    getPropertiesByIds(createSupabaseBrowserClient(), wanted)
      .then(found => {
        if (!cancelled) setResolved({ ids: wanted, properties: found })
      })
      .catch(() => {
        if (!cancelled) setResolved({ ids: wanted, properties: [] })
      })

    return () => {
      cancelled = true
    }
  }, [key, wanted])

  if (wanted.length > 0 && resolved?.ids.join(',') !== key) {
    return <PropertyFeedSkeleton count={3} />
  }

  const properties = wanted.length === 0 ? [] : (resolved?.properties ?? [])

  if (!properties.length) {
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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {properties.map((property, index) => (
        <PropertyCard
          key={property.id}
          property={property}
          priority={index < 3}
          action={<SaveButton propertyId={property.id} propertyTitle={property.title} />}
        />
      ))}
    </div>
  )
}
