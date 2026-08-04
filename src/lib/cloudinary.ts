const UPLOAD_SEGMENT = '/image/upload/'

export const PROPERTY_ASPECT_RATIO = '4:5'

const WATERMARK = 'l_zenthos:properties:zenthos_watermark,o_38,w_0.18,fl_relative,g_south_east,x_0.04,y_0.04'

export const IMAGE_PRESETS = {
  cardThumb: `f_auto,q_auto,w_800,c_fill,ar_4:3,g_auto/${WATERMARK}`,
  gallery: `f_auto,q_auto,w_1400,c_fill,ar_4:5,g_auto/${WATERMARK}`,
  lightbox: `f_auto,q_auto:best,w_2400,c_limit/${WATERMARK}`,
  socialCard: `f_jpg,q_auto,w_1200,h_630,c_fill,g_auto/${WATERMARK}`,
  blurPlaceholder: 'f_auto,q_10,w_24,c_fill,ar_4:3,e_blur:400',
} as const

export function isCloudinaryUrl(url: string): boolean {
  return url.includes('res.cloudinary.com') && url.includes(UPLOAD_SEGMENT)
}

export function transformCloudinary(url: string, transform: string): string {
  if (!isCloudinaryUrl(url)) return url

  const [origin, rest] = url.split(UPLOAD_SEGMENT)
  const segments = rest.split('/')

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

export function propertyOriginalImage(url: string): string {
  return transformCloudinary(url, 'f_auto,q_auto:best')
}
