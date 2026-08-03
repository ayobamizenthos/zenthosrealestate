/**
 * Cloudinary delivery URLs are stored whole in `properties.images`. Every render
 * path re-derives the size it needs by splicing a transform segment into the URL
 * rather than shipping the original asset.
 */

const UPLOAD_SEGMENT = '/image/upload/'

/**
 * Every Zenthos photograph is shot on the same iPhone at 3024×3780 — a 4:5
 * portrait. The whole product is built around that ratio so nothing is ever
 * cropped through a ceiling or a floor. Only the social card departs from it,
 * because Open Graph requires landscape.
 */
export const PROPERTY_ASPECT_RATIO = '4:5'

export const IMAGE_PRESETS = {
  cardThumb: 'f_auto,q_auto,w_600,c_fill,ar_4:5,g_auto',
  gallery: 'f_auto,q_auto,w_1400,c_fill,ar_4:5,g_auto',
  lightbox: 'f_auto,q_auto:best,w_2400,c_limit',
  socialCard: 'f_jpg,q_auto,w_1200,h_630,c_fill,g_auto',
  blurPlaceholder: 'f_auto,q_auto:low,w_24,c_fill,ar_4:5,e_blur:400',
} as const

export function isCloudinaryUrl(url: string): boolean {
  return url.includes('res.cloudinary.com') && url.includes(UPLOAD_SEGMENT)
}

/**
 * Splices a transform into a Cloudinary URL. Existing transforms are replaced so
 * repeated calls stay idempotent. Non-Cloudinary URLs pass through untouched,
 * which keeps local `/public` assets and seed placeholders working.
 */
export function transformCloudinary(url: string, transform: string): string {
  if (!isCloudinaryUrl(url)) return url

  const [origin, rest] = url.split(UPLOAD_SEGMENT)
  const segments = rest.split('/')

  // A leading segment containing an underscore-prefixed directive is a transform
  // block from an earlier call — drop it before applying the new one.
  const withoutExistingTransform = /^[a-z]{1,3}_/.test(segments[0]) ? segments.slice(1) : segments

  return `${origin}${UPLOAD_SEGMENT}${transform}/${withoutExistingTransform.join('/')}`
}

export function propertyCardImage(url: string): string {
  return transformCloudinary(url, IMAGE_PRESETS.cardThumb)
}

export function propertyGalleryImage(url: string): string {
  return transformCloudinary(url, IMAGE_PRESETS.gallery)
}

export function propertySocialImage(url: string): string {
  return transformCloudinary(url, IMAGE_PRESETS.socialCard)
}

export function propertyBlurPlaceholder(url: string): string {
  return transformCloudinary(url, IMAGE_PRESETS.blurPlaceholder)
}

/** Strips transforms so "download all images" saves the full-resolution original. */
export function propertyOriginalImage(url: string): string {
  return transformCloudinary(url, 'f_auto,q_auto:best')
}
