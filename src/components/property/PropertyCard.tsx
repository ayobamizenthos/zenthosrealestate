'use client'

import {
  Bath,
  BedDouble,
  Car,
  ChevronLeft,
  ChevronRight,
  Images,
  MapPin,
  Maximize,
  ShieldCheck,
  Toilet,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'
import { StatusBadge } from '@/components/ui/Badge'
import { propertyBlurPlaceholder, propertyCardImage } from '@/lib/cloudinary'
import { SITE } from '@/lib/constants'
import { RelativeTime } from '@/components/ui/RelativeTime'
import { displayPrice } from '@/lib/format'
import { formatFullAddress } from '@/lib/share'
import type { PropertySummary } from '@/lib/types'
import { propertyInquiryLink } from '@/lib/whatsapp'

const CARD_IMAGE_SIZES = '(min-width: 1024px) 380px, (min-width: 640px) 45vw, 100vw'

interface PropertyCardProps {
  property: PropertySummary
  priority?: boolean
  action?: ReactNode
}

function Spec({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 whitespace-nowrap">
      {icon}
      <span className="text-ink font-semibold">{value}</span>
      <span className="text-muted">{label}</span>
    </span>
  )
}

/**
 * Wide feed row rather than a grid tile: photography on the left, the full
 * detail stack on the right, broker actions pinned to the bottom. This is the
 * layout Nigerian buyers scan, and it fits far more information per screen
 * than a three-column grid of small cards.
 */
export function PropertyCard({ property, priority = false, action }: PropertyCardProps) {
  const [activeImage, setActiveImage] = useState(0)
  const images = property.images.length ? property.images : []
  const fullAddress = formatFullAddress(property)

  const step = (delta: number) => {
    setActiveImage(current => (current + delta + images.length) % images.length)
  }

  return (
    <article className="group border-hairline hover:border-ink relative border bg-white transition-colors sm:flex">
      {/* 4:5 on every breakpoint — the ratio the photographs are actually shot in. */}
      <div className="bg-surface relative aspect-[4/5] shrink-0 overflow-hidden sm:w-[260px] lg:w-[300px]">
        {images.length > 0 ? (
          <Image
            key={images[activeImage]}
            src={propertyCardImage(images[activeImage])}
            alt={`${property.title} — Photo ${activeImage + 1}`}
            fill
            sizes={CARD_IMAGE_SIZES}
            priority={priority && activeImage === 0}
            loading={priority ? undefined : 'lazy'}
            placeholder="blur"
            blurDataURL={propertyBlurPlaceholder(images[activeImage])}
            className="object-cover"
          />
        ) : null}

        <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5">
          {property.verified ? (
            <span className="bg-success flex items-center gap-1 px-2 py-1 text-[10px] font-bold tracking-wide text-white uppercase">
              <ShieldCheck size={11} aria-hidden="true" />
              Verified
            </span>
          ) : null}
          {property.serviced ? (
            <span className="bg-ink px-2 py-1 text-[10px] font-bold tracking-wide text-white uppercase">
              Serviced
            </span>
          ) : null}
          <StatusBadge status={property.status} />
        </div>

        {action ? <div className="absolute top-3 right-3 z-20">{action}</div> : null}

        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous photo"
              className="text-ink absolute top-1/2 left-2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            >
              <ChevronLeft size={17} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next photo"
              className="text-ink absolute top-1/2 right-2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            >
              <ChevronRight size={17} aria-hidden="true" />
            </button>

            <span className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 bg-black/70 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              <Images size={12} aria-hidden="true" />
              {activeImage + 1}/{images.length}
            </span>
          </>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4 md:p-5">
        <p className="text-ink text-[26px] leading-none font-extrabold md:text-[30px]">
          {displayPrice(property.price, property.price_label)}
        </p>

        <p className="text-brand mt-2 text-[13px] font-semibold">
          {property.property_type} for sale
        </p>

        <h3 className="mt-1 text-[18px] leading-snug font-bold">
          <Link
            href={`/properties/${property.slug}`}
            className="text-ink after:absolute after:inset-0 after:content-[''] hover:underline"
          >
            {property.title}
          </Link>
        </h3>

        {property.description ? (
          <p className="text-muted mt-1.5 line-clamp-2 text-[13px] leading-relaxed">
            {property.description}
          </p>
        ) : null}

        <p className="text-muted mt-2 flex items-start gap-1.5 text-[13px]">
          <MapPin size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
          <span className="line-clamp-1">{fullAddress}</span>
        </p>

        <div className="text-muted mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
          <Spec
            icon={<BedDouble size={15} aria-hidden="true" />}
            value={String(property.bedrooms)}
            label="Beds"
          />
          <Spec
            icon={<Bath size={15} aria-hidden="true" />}
            value={String(property.bathrooms)}
            label="Baths"
          />
          <Spec
            icon={<Toilet size={15} aria-hidden="true" />}
            value={String(property.toilets)}
            label="Toilets"
          />
          {property.area_sqm ? (
            <Spec
              icon={<Maximize size={15} aria-hidden="true" />}
              value={String(property.area_sqm)}
              label="m²"
            />
          ) : null}
          {property.furnished === 'Furnished' ? (
            <Spec icon={<Car size={15} aria-hidden="true" />} value="" label="Furnished" />
          ) : null}
        </div>

        <div className="border-hairline mt-4 flex items-center justify-between gap-3 border-t pt-3">
          <p className="text-muted text-[12px]">
            Added <RelativeTime iso={property.created_at} />
          </p>

          <div className="relative z-20 flex gap-2">
            <a
              href={`tel:+${SITE.whatsappNumber}`}
              className="border-hairline text-ink hover:border-ink flex h-10 items-center border px-3.5 text-[13px] font-semibold transition-colors"
            >
              Call
            </a>
            <a
              href={propertyInquiryLink(property)}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-whatsapp hover:bg-whatsapp-hover flex h-10 items-center gap-1.5 px-3.5 text-[13px] font-semibold text-white transition-colors"
            >
              <WhatsAppIcon className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}
