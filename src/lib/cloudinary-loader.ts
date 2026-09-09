'use client'

import type { ImageLoaderProps } from 'next/image'
import { isCloudinaryUrl, transformCloudinary } from './cloudinary'

export default function cloudinaryLoader({ src, width, quality }: ImageLoaderProps): string {
  if (!isCloudinaryUrl(src)) return src

  return transformCloudinary(src, `f_auto,q_${quality ?? 'auto'},w_${width},c_limit`)
}
