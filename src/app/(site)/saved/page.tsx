import type { Metadata } from 'next'
import { SavedPropertiesList } from '@/components/property/SavedPropertiesList'

export const metadata: Metadata = {
  title: 'Saved properties',
  robots: { index: false, follow: false },
}

export default function SavedPage() {
  return (
    <div className="app-shell py-6 md:py-10">
      <header className="mb-6">
        <h1 className="text-ink text-[28px] font-extrabold md:text-[36px]">Saved</h1>
        <p className="text-muted mt-1 text-[14px]">
          Kept on this device. Sign in and they follow you anywhere.
        </p>
      </header>

      <SavedPropertiesList />
    </div>
  )
}
