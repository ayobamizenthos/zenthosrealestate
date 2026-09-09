import type { MetadataRoute } from 'next'
import { LOCATION_LANDING_PAGES, SITE } from '@/lib/constants'
import { isSupabaseConfigured } from '@/lib/env'
import { listBlogPosts } from '@/lib/queries/blog'
import { getAllPropertySlugs } from '@/lib/queries/properties'
import { createSupabasePublicClient } from '@/lib/supabase/public'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE.url, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE.url}/properties`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE.url}/blog`, changeFrequency: 'weekly', priority: 0.7 },
    ...LOCATION_LANDING_PAGES.map(location => ({
      url: `${SITE.url}/properties/${location.slug}`,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
  ]

  if (!isSupabaseConfigured) return staticRoutes

  try {
    const supabase = createSupabasePublicClient()
    const [properties, posts] = await Promise.all([
      getAllPropertySlugs(supabase),
      listBlogPosts(supabase).catch(() => []),
    ])

    return [
      ...staticRoutes,
      ...properties.map(({ slug, updated_at }) => ({
        url: `${SITE.url}/properties/${slug}`,
        lastModified: new Date(updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
      ...posts.map(post => ({
        url: `${SITE.url}/blog/${post.slug}`,
        lastModified: post.published_at ? new Date(post.published_at) : undefined,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })),
    ]
  } catch {
    return staticRoutes
  }
}
