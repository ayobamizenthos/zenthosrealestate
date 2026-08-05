import type { ZenthosSupabaseClient } from '@/lib/supabase/types'

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  body: string
  cover_image: string | null
  category: string
  read_minutes: number
  published_at: string | null
}

const COLUMNS = 'slug, title, excerpt, body, cover_image, category, read_minutes, published_at'

export async function listBlogPosts(supabase: ZenthosSupabaseClient): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(COLUMNS)
    .eq('published', true)
    .order('published_at', { ascending: false })

  if (error) throw new Error(`Failed to load posts: ${error.message}`)
  return (data ?? []) as BlogPost[]
}

export async function getBlogPost(
  supabase: ZenthosSupabaseClient,
  slug: string
): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(COLUMNS)
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  if (error) throw new Error(`Failed to load post "${slug}": ${error.message}`)
  return (data as BlogPost | null) ?? null
}
