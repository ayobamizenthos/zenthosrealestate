'use client'

import { BellRing, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { propertyCardImage } from '@/lib/cloudinary'
import { isSupabaseConfigured } from '@/lib/env'
import { displayPriceCompact } from '@/lib/format'
import { playNotificationBell, unlockNotificationSound } from '@/lib/notification-sound'
import { recordAlert } from '@/lib/listing-alerts'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

interface ListingToast {
  id: string
  slug: string
  title: string
  location: string
  price: string
  image: string | null
}

interface PropertyInsertPayload {
  id?: unknown
  slug?: unknown
  title?: unknown
  location?: unknown
  price?: unknown
  price_label?: unknown
  images?: unknown
  published?: unknown
}

const DISMISS_AFTER_MS = 12000

function toToast(row: PropertyInsertPayload): ListingToast | null {
  if (row.published !== true) return null
  if (typeof row.id !== 'string' || typeof row.slug !== 'string' || typeof row.title !== 'string') {
    return null
  }

  const images = Array.isArray(row.images) ? row.images.filter(i => typeof i === 'string') : []

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    location: typeof row.location === 'string' ? row.location : '',
    price: displayPriceCompact(
      typeof row.price === 'number' ? row.price : null,
      typeof row.price_label === 'string' ? row.price_label : null
    ),
    image: images[0] ?? null,
  }
}

export function NotificationToaster() {
  const [toasts, setToasts] = useState<ListingToast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts(current => current.filter(toast => toast.id !== id))
  }, [])

  useEffect(() => {
    const arm = () => unlockNotificationSound()
    window.addEventListener('pointerdown', arm, { once: true })
    window.addEventListener('keydown', arm, { once: true })
    return () => {
      window.removeEventListener('pointerdown', arm)
      window.removeEventListener('keydown', arm)
    }
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) return

    const supabase = createSupabaseBrowserClient()

    const channel = supabase
      .channel('public:new-listings')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'properties' },
        payload => {
          const toast = toToast(payload.new as PropertyInsertPayload)
          if (!toast) return

          playNotificationBell()
          recordAlert({
            id: toast.id,
            slug: toast.slug,
            title: toast.title,
            location: toast.location,
            price: toast.price,
            image: toast.image,
          })
          setToasts(current => [toast, ...current.filter(t => t.id !== toast.id)].slice(0, 4))
          window.setTimeout(() => dismiss(toast.id), DISMISS_AFTER_MS)
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [dismiss])

  if (!toasts.length) return null

  return (
    <div
      role="region"
      aria-live="polite"
      aria-label="New listing alerts"
      className="scrollbar-none pointer-events-none fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom)+8px)] z-[55] flex max-h-[60vh] flex-col gap-2 overflow-y-auto px-4 md:inset-x-auto md:right-6 md:bottom-24 md:w-[22rem] md:px-0"
    >
      {toasts.map(toast => (
        <article
          key={toast.id}
          className="animate-pill-in border-hairline shadow-card-hover pointer-events-auto relative flex gap-3 rounded-card border bg-white p-3"
        >
          <Link
            href={`/properties/${toast.slug}`}
            onClick={() => dismiss(toast.id)}
            className="flex min-w-0 flex-1 gap-3"
          >
            <span className="bg-surface relative h-16 w-14 shrink-0 overflow-hidden rounded-lg">
              {toast.image ? (
                <Image
                  src={propertyCardImage(toast.image)}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              ) : null}
            </span>

            <span className="min-w-0 flex-1">
              <span className="text-brand flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase">
                <BellRing size={12} aria-hidden="true" />
                Just listed
              </span>
              <span className="text-ink mt-1 block truncate text-[14px] font-bold">
                {toast.title}
              </span>
              <span className="text-muted mt-0.5 block text-[12px]">
                {toast.price}
                {toast.location ? ` · ${toast.location}` : ''}
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            aria-label={`Dismiss alert for ${toast.title}`}
            className="text-muted hover:text-ink -mt-1 -mr-1 flex h-8 w-8 shrink-0 items-center justify-center"
          >
            <X size={15} aria-hidden="true" />
          </button>
        </article>
      ))}
    </div>
  )
}
