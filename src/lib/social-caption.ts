import { SITE } from './constants'
import { formatNaira } from './format'
import type { PropertySummary } from './types'

/*
  A listing description is written in paragraphs for the website. Instagram wants
  the same facts as a scannable list, so the caption is rebuilt from the record
  rather than pasted from the page.
*/

const AREA_TAGS: Record<string, string> = {
  'Victoria Island': '#VictoriaIsland',
  Ikoyi: '#Ikoyi',
  'Banana Island': '#BananaIsland',
  'Eko Atlantic': '#EkoAtlantic',
  Oniru: '#Oniru',
  Lekki: '#LekkiPhase1',
  Ajah: '#Ajah',
  Ikeja: '#Ikeja',
  Magodo: '#Magodo',
  Omole: '#Omole',
  Maryland: '#MarylandLagos',
  Gbagada: '#Gbagada',
}

// The website copy is prose. Bullets read better on Instagram, so sentences are
// split back out into the short phrases they were written from.
function toBullets(description: string): string[] {
  const body = description
    .replace(/\r\n?/g, '\n')
    .split(/\n{2,}/)
    .slice(1)
    // The closing paragraph states the title, which gets its own line below.
    .filter(paragraph => !/^title is /i.test(paragraph.trim()))
    .join(' ')

  return body
    .split(/(?<=\.)\s+|,\s+(?=[a-z])/)
    .map(part =>
      part
        .replace(/^(and|with|plus)\s+/i, '')
        .replace(/^(a|an|the)\s+/i, '')
        .replace(/\.$/, '')
        .trim()
    )
    .filter(part => part.length > 2 && part.length < 90)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
}

export interface CaptionInput extends Pick<
  PropertySummary,
  'title' | 'slug' | 'location' | 'address' | 'price' | 'price_label' | 'description'
> {
  title_document: string | null
}

export function buildInstagramCaption(property: CaptionInput): string {
  const price = property.price
    ? formatNaira(property.price)
    : (property.price_label ?? 'Price on request')
  const headline = property.description
    .replace(/\r\n?/g, '\n')
    .split(/\n{2,}/)[0]
    .trim()

  const lines = [headline, '', `📍 ${property.address}, Lagos`, `💰 ${price}`]

  const bullets = toBullets(property.description)
  if (bullets.length) {
    lines.push('', 'FEATURES')
    for (const bullet of bullets) lines.push(`• ${bullet}`)
  }

  if (property.title_document) lines.push('', `📄 Title: ${property.title_document}`)

  lines.push(
    '',
    'Full details and photos:',
    `${SITE.url.replace(/^https?:\/\//, '')}/properties/${property.slug}`,
    '',
    [
      '#LagosRealEstate',
      AREA_TAGS[property.location] ?? '#Lagos',
      '#PropertyForSaleInLagos',
      '#ZenthosRealEstate',
      '#LagosProperty',
      '#NigeriaRealEstate',
    ].join(' ')
  )

  return lines.join('\n')
}
