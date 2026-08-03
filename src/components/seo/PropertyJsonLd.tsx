import { SITE } from '@/lib/constants'
import { propertyGalleryImage } from '@/lib/cloudinary'
import type { Property } from '@/lib/types'

/**
 * RealEstateListing structured data drives Google's rich results for property
 * searches. Emitted server-side so crawlers see it in the initial HTML.
 */
export function PropertyJsonLd({ property }: { property: Property }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    url: `${SITE.url}/properties/${property.slug}`,
    datePosted: property.created_at,
    image: property.images.map(propertyGalleryImage),
    numberOfRooms: property.bedrooms,
    numberOfBathroomsTotal: property.bathrooms,
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address || undefined,
      addressLocality: property.location,
      addressRegion: 'Lagos',
      addressCountry: 'NG',
    },
    ...(property.price !== null
      ? {
          offers: {
            '@type': 'Offer',
            price: property.price,
            priceCurrency: 'NGN',
            availability:
              property.status === 'Available'
                ? 'https://schema.org/InStock'
                : 'https://schema.org/SoldOut',
          },
        }
      : {}),
  }

  return (
    <script
      type="application/ld+json"
      // Values originate from our own database, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function OrganizationJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: SITE.name,
    description: SITE.tagline,
    url: SITE.url,
    telephone: `+${SITE.whatsappNumber}`,
    email: SITE.email,
    areaServed: ['Victoria Island', 'Lekki', 'Ikoyi', 'Ajah'].map(name => ({
      '@type': 'Place',
      name,
    })),
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Lagos',
      addressRegion: 'Lagos',
      addressCountry: 'NG',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
