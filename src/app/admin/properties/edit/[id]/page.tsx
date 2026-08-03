import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PropertyForm } from '@/components/admin/PropertyForm'
import { updatePropertyAction } from '@/lib/actions/properties'
import { requireAdmin } from '@/lib/auth'
import { getPropertyByIdForAdmin } from '@/lib/queries/properties'

export const metadata: Metadata = { title: 'Edit property' }
export const dynamic = 'force-dynamic'

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await requireAdmin()
  const { id } = await params

  const property = await getPropertyByIdForAdmin(supabase, id)
  if (!property) notFound()

  return (
    <div className="app-shell max-w-3xl py-6 md:py-10">
      <h1 className="text-title text-brand font-extrabold">Edit property</h1>
      <p className="text-muted mt-1 text-[14px]">
        {property.published ? (
          <>
            Live at{' '}
            <Link href={`/properties/${property.slug}`} className="text-brand font-semibold">
              /properties/{property.slug}
            </Link>
          </>
        ) : (
          'This listing is still a draft and is not visible publicly.'
        )}
      </p>

      <div className="mt-8">
        <PropertyForm action={updatePropertyAction} property={property} />
      </div>
    </div>
  )
}
