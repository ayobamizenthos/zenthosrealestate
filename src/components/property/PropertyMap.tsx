'use client'

import { ChevronDown, MapPin } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

export function PropertyMap({ address, location }: { address: string; location: string }) {
  const [isOpen, setIsOpen] = useState(true)

  const place = [address, location, 'Lagos', 'Nigeria'].filter(Boolean).join(', ')
  const embedSrc = `https://www.google.com/maps?q=${encodeURIComponent(place)}&output=embed`
  const readable = [address, location, 'Lagos'].filter(Boolean).join(', ')

  return (
    <section className="rounded-card shadow-card bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(open => !open)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
      >
        <span className="flex items-center gap-2.5">
          <MapPin size={20} className="text-brand shrink-0" aria-hidden="true" fill="currentColor" />
          <span className="text-ink text-[17px] font-bold">Map and location</span>
        </span>
        <ChevronDown
          size={20}
          aria-hidden="true"
          className={clsx('text-muted shrink-0 transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen ? (
        <div className="px-5 pb-5">
          <p className="text-muted mb-3 flex items-center gap-1.5 text-[14px]">
            <MapPin size={15} aria-hidden="true" className="text-brand shrink-0" fill="currentColor" />
            {readable}
          </p>

          <div className="overflow-hidden rounded-lg">
            <iframe
              src={embedSrc}
              title={`Map showing ${readable}`}
              loading="eager"
              referrerPolicy="no-referrer-when-downgrade"
              className="block h-[280px] w-full border-0 md:h-[380px]"
            />
          </div>
        </div>
      ) : null}
    </section>
  )
}
