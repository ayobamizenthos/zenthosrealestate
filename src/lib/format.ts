const NAIRA = '₦'

const nairaGrouping = new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 })

/** Full price for detail pages and admin tables: ₦85,000,000 */
export function formatNaira(amount: number): string {
  return `${NAIRA}${nairaGrouping.format(amount)}`
}

/**
 * Compact price for cards, push notifications and social card descriptions,
 * where the full figure would wrap: ₦85M, ₦1.2B, ₦850K.
 */
export function formatNairaCompact(amount: number): string {
  if (amount >= 1_000_000_000) return `${NAIRA}${trimZero(amount / 1_000_000_000)}B`
  if (amount >= 1_000_000) return `${NAIRA}${trimZero(amount / 1_000_000)}M`
  if (amount >= 1_000) return `${NAIRA}${trimZero(amount / 1_000)}K`
  return `${NAIRA}${nairaGrouping.format(amount)}`
}

function trimZero(value: number): string {
  return value.toFixed(1).replace(/\.0$/, '')
}

/**
 * Prefers the admin-authored label so listings can read "Price on Request"
 * without inventing a sentinel price value.
 */
export function displayPrice(price: number | null, priceLabel: string | null): string {
  if (priceLabel?.trim()) return priceLabel.trim()
  if (price === null) return 'Price on Request'
  return formatNaira(price)
}

export function displayPriceCompact(price: number | null, priceLabel: string | null): string {
  if (price !== null) return formatNairaCompact(price)
  return priceLabel?.trim() || 'Price on Request'
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export function formatRelativeTime(value: string): string {
  const elapsedMs = Date.now() - new Date(value).getTime()
  const minutes = Math.round(elapsedMs / 60_000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.round(hours / 24)
  if (days < 7) return `${days}d ago`

  return formatDate(value)
}

const COMBINING_MARKS = /[̀-ͯ]/g

/**
 * Builds the SEO slug for a property. Uniqueness is guaranteed by the database,
 * which appends a short discriminator when two listings collide.
 */
export function toSlug(input: string): string {
  return input
    .normalize('NFKD')
    .replace(COMBINING_MARKS, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export function truncateAtWord(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  const clipped = text.slice(0, maxLength)
  return `${clipped.slice(0, clipped.lastIndexOf(' '))}…`
}

/** Meta descriptions are capped at 160 characters by every major crawler. */
export function toMetaDescription(text: string): string {
  return truncateAtWord(text.replace(/\s+/g, ' ').trim(), 157)
}
