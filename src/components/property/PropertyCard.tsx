'use client'

import {
  Bath,
  BedDouble,
  ChevronLeft,
  ChevronRight,
  Images,
  MapPin,
  Phone,
  Toilet,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'
import { propertyBlurPlaceholder, propertyCardImage } from '@/lib/cloudinary'
import { SITE } from '@/lib/constants'
import { displayPrice } from '@/lib/format'
import { formatFullAddress } from '@/lib/share'
import type { PropertySummary } from '@/lib/types'
import { propertyInquiryLink } from '@/lib/whatsapp'

const CARD_IMAGE_SIZES = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'

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

export function PropertyCard({ property, priority = false, action }: PropertyCardProps) {
  const [activeImage, setActiveImage] = useState(0)
  const images = property.images.length ? property.images : []
  const fullAddress = formatFullAddress(property)

  const step = (delta: number) => {
    setActiveImage(current => (current + delta + images.length) % images.length)
  }

  return (
    <article className="group shadow-card hover:shadow-card-hover relative flex flex-col overflow-hidden rounded-card bg-white transition-shadow">
      <div className="bg-surface relative aspect-[4/3] w-full shrink-0 overflow-hidden">
        {images.length > 0 ? (
          <Image
            key={images[activeImage]}
            src={propertyCardImage(images[activeImage])}
            alt={`${property.title}, photo ${activeImage + 1}`}
            fill
            sizes={CARD_IMAGE_SIZES}
            priority={priority && activeImage === 0}
            loading={priority ? undefined : 'lazy'}
            placeholder="blur"
            blurDataURL={propertyBlurPlaceholder(images[activeImage])}
            className="object-cover"
          />
        ) : null}

        {action ? <div className="absolute top-3 right-3 z-20">{action}</div> : null}

        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous photo"
              className="text-ink absolute top-1/2 left-2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            >
              <ChevronLeft size={17} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next photo"
              className="text-ink absolute top-1/2 right-2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
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
        <p className="text-ink text-[24px] leading-none font-extrabold md:text-[26px]">
          {displayPrice(property.price, property.price_label)}
        </p>

        <p className="text-brand mt-2 text-[13px] font-semibold">
          {property.property_type} for sale
        </p>

        <h3 className="mt-1 text-[17px] leading-snug font-bold">
          <Link
            href={`/properties/${property.slug}`}
            className="text-ink after:absolute after:inset-0 after:content-[''] hover:underline"
          >
            {property.title}
          </Link>
        </h3>

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
        </div>

        <div className="mt-auto flex items-center justify-end gap-2 pt-4">
          <div className="relative z-20 flex gap-2">
            <a
              href={`tel:+${SITE.whatsappNumber}`}
              aria-label={`Call about ${property.title}`}
              className="text-ink hover:border-ink hover:bg-surface flex h-10 w-10 items-center justify-center rounded-full border transition-colors"
            >
              <Phone size={16} aria-hidden="true" />
            </a>
            <a
              href={propertyInquiryLink(property)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Message us on WhatsApp about ${property.title}`}
              className="bg-brand hover:bg-brand-hover flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors"
            >
              <WhatsAppIcon className="h-[17px] w-[17px]" />
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}
