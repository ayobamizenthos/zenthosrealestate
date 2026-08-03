'use client'

import type { ImageLoaderProps } from 'next/image'
import { isCloudinaryUrl, transformCloudinary } from './cloudinary'

/**
 * Routes every `next/image` request through Cloudinary's CDN instead of Vercel's
 * optimizer — the free tier caps optimized images, and Cloudinary already stores
 * the originals. Local `/public` assets bypass transformation entirely.
 */
export default function cloudinaryLoader({ src, width, quality }: ImageLoaderProps): string {
  if (!isCloudinaryUrl(src)) return src

  return transformCloudinary(src, `f_auto,q_${quality ?? 'auto'},w_${width},c_limit`)
}
