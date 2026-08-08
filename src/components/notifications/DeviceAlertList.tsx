'use client'

import { BellRing } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'
import { ButtonLink } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { RelativeTime } from '@/components/ui/RelativeTime'
import { propertyCardImage } from '@/lib/cloudinary'
import { listingAlerts, markAllRead } from '@/lib/listing-alerts'
import { useLocalStore } from '@/lib/local-store'

export function DeviceAlertList({ hideWhenEmpty = false }: { hideWhenEmpty?: boolean }) {
  const alerts = useLocalStore(listingAlerts)

  useEffect(() => {
    const timer = window.setTimeout(markAllRead, 1200)
    return () => window.clearTimeout(timer)
  }, [])

  if (!alerts.length) {
    // Signed-in visitors already have their account list above this one, so an
    // empty device feed is noise rather than information.
    if (hideWhenEmpty) return null

    return (
      <EmptyState
        illustration={<BellRing size={40} className="text-brand" aria-hidden="true" />}
        title="No alerts yet"
        description="Keep this tab open and every new listing will land here the moment it publishes."
        action={<ButtonLink href="/properties">Browse properties</ButtonLink>}
      />
    )
  }

  return (
    <ul className="space-y-3">
      {alerts.map(alert => (
        <li key={alert.id}>
          <Link
            href={`/properties/${alert.slug}`}
            className="shadow-card hover:shadow-card-hover rounded-card flex gap-3 bg-white p-3 transition-shadow"
          >
            <span className="bg-surface relative h-16 w-14 shrink-0 overflow-hidden rounded-lg">
              {alert.image ? (
                <Image
                  src={propertyCardImage(alert.image)}
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
              <span className="text-ink mt-1 block truncate text-[15px] font-bold">
                {alert.title}
              </span>
              <span className="text-muted mt-0.5 block text-[13px]">
                {alert.price}
                {alert.location ? ` · ${alert.location}` : ''}
              </span>
            </span>

            <span className="text-muted shrink-0 text-[12px]">
              <RelativeTime iso={new Date(alert.at).toISOString()} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
