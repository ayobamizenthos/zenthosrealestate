import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/constants'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Signed-in and operational areas hold nothing a crawler should index.
        disallow: [
          '/admin',
          '/api/',
          '/saved',
          '/compare',
          '/profile',
          '/notifications',
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
          '/offline',
        ],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  }
}
