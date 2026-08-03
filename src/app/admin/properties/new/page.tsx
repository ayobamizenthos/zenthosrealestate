import type { Metadata } from 'next'
import { PropertyForm } from '@/components/admin/PropertyForm'
import { createPropertyAction } from '@/lib/actions/properties'

export const metadata: Metadata = { title: 'Add property' }

export default function NewPropertyPage() {
  return (
    <div className="app-shell max-w-3xl py-6 md:py-10">
      <h1 className="text-title text-brand font-extrabold">Add property</h1>
      <p className="text-muted mt-1 text-[14px]">
        Drafts stay hidden from the public site until you publish them.
      </p>

      <div className="mt-8">
        <PropertyForm action={createPropertyAction} />
      </div>
    </div>
  )
}
