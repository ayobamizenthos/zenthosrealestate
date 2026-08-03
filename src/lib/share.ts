import type { Property, PropertySummary } from './types'

/** "300000000" → "300M". Matches how the brokerage writes prices everywhere. */
function toShorthandPrice(price: number | null, priceLabel: string | null): string {
  if (price === null) return priceLabel?.trim() || 'Price on Request'

  const trim = (value: number) => value.toFixed(1).replace(/\.0$/, '')
  if (price >= 1_000_000_000) return `${trim(price / 1_000_000_000)}B`
  if (price >= 1_000_000) return `${trim(price / 1_000_000)}M`
  if (price >= 1_000) return `${trim(price / 1_000)}K`
  return String(price)
}

/**
 * The single title used for the browser tab, Open Graph, the native share sheet
 * and WhatsApp previews:
 *
 *   "2 Bedroom Apartment 300M-Lekki Phase 1, Lagos"
 *
 * It is deliberately identical to the folder name the photographs arrive in, so
 * a listing reads the same in the brokerage's files and on a client's phone.
 */
export function buildShareTitle(
  property: Pick<Property, 'title' | 'price' | 'price_label' | 'address' | 'location' | 'state'>
): string {
  const price = toShorthandPrice(property.price, property.price_label)
  const place = property.address?.trim() || property.location

  return `${property.title} ${price}-${place}, ${property.state}`
}

/**
 * "Off Admiralty Way, Lekki Phase 1, Lekki, Lagos" — but never "Ajah, Ajah,
 * Lagos". The street often already names its area, so repeated parts are
 * dropped rather than concatenated blindly.
 */
export function formatFullAddress(
  property: Pick<PropertySummary, 'address' | 'location' | 'state'>
): string {
  const parts = [property.address?.trim(), property.location, property.state].filter(
    (part): part is string => Boolean(part)
  )

  const seen = new Set<string>()
  return parts
    .filter(part => {
      const key = part.toLowerCase()
      if (seen.has(key)) return false
      // A street that already contains its area makes the area redundant.
      if ([...seen].some(previous => previous.includes(key))) return false
      seen.add(key)
      return true
    })
    .join(', ')
}
