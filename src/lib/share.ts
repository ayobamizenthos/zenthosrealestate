import type { Property, PropertySummary } from './types'

function toShorthandPrice(price: number | null, priceLabel: string | null): string {
  if (price === null) return priceLabel?.trim() || 'Price on Request'

  const trim = (value: number) => value.toFixed(1).replace(/\.0$/, '')
  if (price >= 1_000_000_000) return `${trim(price / 1_000_000_000)}B`
  if (price >= 1_000_000) return `${trim(price / 1_000_000)}M`
  if (price >= 1_000) return `${trim(price / 1_000)}K`
  return String(price)
}

export function buildShareTitle(
  property: Pick<Property, 'title' | 'price' | 'price_label' | 'address' | 'location' | 'state'>
): string {
  const price = toShorthandPrice(property.price, property.price_label)
  const place = property.address?.trim() || property.location

  return `${property.title} ${price}-${place}, ${property.state}`
}

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

      if ([...seen].some(previous => previous.includes(key))) return false
      seen.add(key)
      return true
    })
    .join(', ')
}
