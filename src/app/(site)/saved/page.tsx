import type { Metadata } from 'next'
import { SavedPropertiesList } from '@/components/property/SavedPropertiesList'
import { requireUser } from '@/lib/auth'
import { getPropertiesByIds } from '@/lib/queries/properties'
import { getSavedPropertyIds } from '@/lib/queries/saved'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Saved properties',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function SavedPage() {
  const user = await requireUser('/saved')
  const supabase = await createSupabaseServerClient()

  const savedIds = await getSavedPropertyIds(supabase, user.id)
  const properties = await getPropertiesByIds(supabase, savedIds)

  return (
    <div className="app-shell py-6 md:py-10">
      <header className="mb-6">
        <h1 className="text-title md:text-display text-brand font-extrabold">Saved</h1>
        <p className="text-muted mt-1 text-[14px]">
          {properties.length} {properties.length === 1 ? 'property' : 'properties'}
        </p>
      </header>

      <SavedPropertiesList properties={properties} />
    </div>
  )
}
