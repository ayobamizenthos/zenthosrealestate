import { Bath, BedDouble, ChevronRight, MapPin, Phone, Sofa, Toilet } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'
import { AmenityList } from '@/components/property/AmenityList'
import { CompareButton } from '@/components/property/CompareButton'
import { DownloadImagesButton } from '@/components/property/DownloadImagesButton'
import { InquiryForm } from '@/components/property/InquiryForm'
import { PropertyFeed } from '@/components/property/PropertyFeed'
import { PropertyGallery } from '@/components/property/PropertyGallery'
import { AreaGuidePanel } from '@/components/property/AreaGuidePanel'
import { PropertyMap } from '@/components/property/PropertyMap'
import { SaveButton } from '@/components/property/SaveButton'
import { ShareButton } from '@/components/property/ShareButton'
import { LocationLandingPage } from '@/components/location/LocationLandingPage'
import { PropertyJsonLd } from '@/components/seo/PropertyJsonLd'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { propertySocialImage } from '@/lib/cloudinary'
import { findLocationLanding, LOCATION_LANDING_PAGES, SITE } from '@/lib/constants'
import { isSupabaseConfigured } from '@/lib/env'
import { displayPrice, toMetaDescription } from '@/lib/format'
import { buildShareTitle, formatFullAddress } from '@/lib/share'
import { getAreaGuide } from '@/lib/queries/area-guides'
import {
  getAllPropertySlugs,
  getPropertyBySlug,
  getRelatedProperties,
} from '@/lib/queries/properties'
import { createSupabasePublicClient } from '@/lib/supabase/public'
import type { Property } from '@/lib/types'
import { propertyInquiryLink } from '@/lib/whatsapp'

type PageParams = Promise<{ slug: string }>

export const revalidate = 300

export async function generateStaticParams() {
  const areaParams = LOCATION_LANDING_PAGES.map(area => ({ slug: area.slug }))

  if (!isSupabaseConfigured) return areaParams

  try {
    const supabase = createSupabasePublicClient()
    const slugs = await getAllPropertySlugs(supabase)
    return [...areaParams, ...slugs.slice(0, 100).map(({ slug }) => ({ slug }))]
  } catch {
    return areaParams
  }
}

async function loadProperty(slug: string): Promise<Property | null> {
  if (!isSupabaseConfigured) return null
  const supabase = createSupabasePublicClient()
  return getPropertyBySlug(supabase, slug).catch(() => null)
}

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const { slug } = await params

  const area = findLocationLanding(slug)
  if (area) {
    return {
      title: { absolute: area.metaTitle },
      description: area.metaDescription,
      alternates: { canonical: `/properties/${area.slug}` },
      openGraph: {
        title: area.metaTitle,
        description: area.metaDescription,
        url: `/properties/${area.slug}`,
      },
    }
  }

  const property = await loadProperty(slug)

  if (!property) return { title: 'Property not found', robots: { index: false, follow: false } }

  const shareTitle = buildShareTitle(property)
  const [coverImage] = property.images
  const canonicalPath = `/properties/${property.slug}`

  const description = toMetaDescription(
    property.description ||
      `${property.bedrooms} bedroom ${property.property_type.toLowerCase()} for sale in ${property.location}, ${property.state}.`
  )

  return {
    title: shareTitle,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: 'article',
      title: shareTitle,
      description,
      url: canonicalPath,
      siteName: SITE.name,
      images: coverImage
        ? [{ url: propertySocialImage(coverImage), width: 1200, height: 630, alt: shareTitle }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: shareTitle,
      description,
      images: coverImage ? [propertySocialImage(coverImage)] : undefined,
    },
  }
}

function SpecTile({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="bg-surface rounded-card flex flex-col items-center gap-1 px-1.5 py-3 text-center md:gap-1.5 md:py-4">
      <span className="text-brand">{icon}</span>
      <span className="text-ink text-[14px] leading-tight font-bold text-balance md:text-[15px]">
        {value}
      </span>
      <span className="text-muted text-[11px] leading-tight md:text-[12px]">{label}</span>
    </div>
  )
}

export default async function PropertyDetailPage({ params }: { params: PageParams }) {
  const { slug } = await params

  const area = findLocationLanding(slug)
  if (area) {
    return <LocationLandingPage content={area} />
  }

  const property = await loadProperty(slug)

  if (!property) notFound()

  const supabase = isSupabaseConfigured ? createSupabasePublicClient() : null
  const [related, areaGuide] = supabase
    ? await Promise.all([
        getRelatedProperties(supabase, property).catch(() => []),
        getAreaGuide(supabase, property.location).catch(() => null),
      ])
    : [[], null]

  const canonicalPath = `/properties/${property.slug}`
  const priceDisplay = displayPrice(property.price, property.price_label)
  const shareTitle = buildShareTitle(property)
  const fullAddress = formatFullAddress(property)

  const detailRows: { label: string; value: string }[] = [
    ...(property.reference_code ? [{ label: 'Reference', value: property.reference_code }] : []),
    { label: 'Property type', value: property.property_type },
    { label: 'Bedrooms', value: String(property.bedrooms) },
    { label: 'Bathrooms', value: String(property.bathrooms) },
    { label: 'Toilets', value: String(property.toilets) },
    ...(property.area_sqm ? [{ label: 'Floor area', value: `${property.area_sqm} sqm` }] : []),
    { label: 'Furnishing', value: property.furnished },
    ...(property.title_document
      ? [{ label: 'Title document', value: property.title_document }]
      : []),
  ]

  return (
    <>
      <PropertyJsonLd property={property} />

      <nav aria-label="Breadcrumb">
        <ol className="app-shell text-muted flex items-center gap-1.5 py-1 text-[13px] whitespace-nowrap">
          <li className="shrink-0">
            <Link
              href="/"
              className="hover:text-brand inline-flex min-h-9 items-center transition-colors"
            >
              Home
            </Link>
          </li>
          <ChevronRight size={13} aria-hidden="true" className="shrink-0" />
          <li className="shrink-0">
            <Link
              href="/properties"
              className="hover:text-brand inline-flex min-h-9 items-center transition-colors"
            >
              Property for sale
            </Link>
          </li>
          <ChevronRight size={13} aria-hidden="true" className="shrink-0" />
          <li className="text-ink min-w-0 truncate font-medium">{property.title}</li>
        </ol>
      </nav>

      <article className="app-shell pb-8 md:py-8">
        <PropertyGallery images={property.images} title={property.title} />

        <div className="mt-6 lg:mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-10">
          <div className="min-w-0">
            <span className="text-brand text-[13px] font-semibold">
              {property.property_type} for sale
            </span>

            <div className="mt-3 flex items-start justify-between gap-4">
              <h1 className="text-ink min-w-0 flex-1 text-[24px] leading-tight sm:text-[28px] md:text-[34px]">
                {property.title}
              </h1>
              <span className="flex shrink-0 items-center">
                <SaveButton propertyId={property.id} propertyTitle={property.title} tone="icon" />
                <ShareButton
                  title={shareTitle}
                  text={shareTitle}
                  path={canonicalPath}
                  tone="icon"
                />
              </span>
            </div>

            <p className="text-muted mt-2 flex items-center gap-1.5 text-[14px]">
              <MapPin size={15} aria-hidden="true" className="shrink-0" />
              {fullAddress}
            </p>

            <p className="text-ink mt-5 text-[32px] leading-none font-extrabold md:text-[40px]">
              {priceDisplay}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2 lg:hidden">
              <a
                href={propertyInquiryLink(property)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand hover:bg-brand-hover rounded-control flex h-12 items-center justify-center gap-2 text-[15px] font-bold text-white transition-colors"
              >
                <WhatsAppIcon className="h-5 w-5" />
                WhatsApp
              </a>
              <a
                href={`tel:+${SITE.whatsappNumber}`}
                className="bg-ink rounded-control flex h-12 items-center justify-center gap-2 text-[15px] font-bold text-white transition-opacity hover:opacity-90"
              >
                <Phone size={18} aria-hidden="true" />
                Call
              </a>
              <DownloadImagesButton images={property.images} title={property.title} />
              <CompareButton propertyId={property.id} propertyTitle={property.title} />
            </div>

            <div className="mt-6 grid grid-cols-4 gap-1.5 sm:gap-3 md:mt-8">
              <SpecTile
                icon={<BedDouble size={17} aria-hidden="true" />}
                value={String(property.bedrooms)}
                label={property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
              />
              <SpecTile
                icon={<Bath size={17} aria-hidden="true" />}
                value={String(property.bathrooms)}
                label={property.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}
              />
              <SpecTile
                icon={<Toilet size={17} aria-hidden="true" />}
                value={String(property.toilets)}
                label={property.toilets === 1 ? 'Toilet' : 'Toilets'}
              />
              <SpecTile
                icon={<Sofa size={17} aria-hidden="true" />}
                value={property.furnished}
                label="Furnishing"
              />
            </div>

            <section className="mt-8 md:mt-10">
              <h2 className="text-ink text-[18px] font-bold md:text-[19px]">About this property</h2>
              <p className="text-ink mt-3 text-[15px] leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </section>

            {property.amenities.length > 0 ? (
              <section className="mt-8 md:mt-10">
                <h2 className="text-ink text-[18px] font-bold md:text-[19px]">Amenities</h2>
                <div className="mt-3.5">
                  <AmenityList amenities={property.amenities} />
                </div>
              </section>
            ) : null}

            <section className="mt-8 md:mt-10">
              <h2 className="text-ink text-[18px] font-bold md:text-[19px]">Property details</h2>
              <dl className="bg-surface rounded-card mt-3.5 grid px-4 md:grid-cols-2 md:gap-x-8 md:px-5">
                {detailRows.map(({ label, value }) => (
                  <div
                    key={label}
                    className="border-hairline flex items-baseline justify-between gap-4 border-b py-2.5 last:border-b-0 md:py-3"
                  >
                    <dt className="text-muted shrink-0 text-[13px]">{label}</dt>
                    <dd className="text-ink text-right text-[14px] font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {areaGuide ? (
              <section className="mt-8 md:mt-10">
                <AreaGuidePanel
                  guide={areaGuide}
                  slug={
                    findLocationLanding(property.location.toLowerCase().replace(/ /g, '-'))?.slug
                  }
                />
              </section>
            ) : null}

            <section className="mt-8 md:mt-10">
              <PropertyMap address={property.address} location={property.location} />
            </section>

            <section className="mt-8 md:mt-10">
              <InquiryForm property={property} />
            </section>
          </div>

          <aside className="mt-10 hidden lg:mt-0 lg:block">
            <div className="shadow-card rounded-card sticky top-24 bg-white">
              <div className="space-y-2 p-5">
                <a
                  href={propertyInquiryLink(property)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-brand hover:bg-brand-hover rounded-control flex h-12 w-full items-center justify-center gap-2 text-[15px] font-bold text-white transition-colors"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  WhatsApp
                </a>

                <a
                  href={`tel:+${SITE.whatsappNumber}`}
                  className="bg-ink rounded-control flex h-12 w-full items-center justify-center gap-2 text-[15px] font-bold text-white transition-opacity hover:opacity-90"
                >
                  <Phone size={18} aria-hidden="true" />
                  Call {SITE.phoneDisplay}
                </a>

                <DownloadImagesButton images={property.images} title={property.title} />
                <CompareButton propertyId={property.id} propertyTitle={property.title} />
              </div>
            </div>
          </aside>
        </div>

        {related.length > 0 ? (
          <section className="mt-12 md:mt-16">
            <SectionHeading
              title={`More properties in ${property.location}`}
              description={`More homes in ${property.location}.`}
              linkHref="/properties"
              linkLabel="All properties"
            />
            <PropertyFeed properties={related} />
          </section>
        ) : null}
      </article>
    </>
  )
}
