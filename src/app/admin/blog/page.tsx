import type { Metadata } from 'next'
import { BlogEditor, type AdminBlogPost } from '@/components/admin/BlogEditor'
import { requireAdmin } from '@/lib/auth'

export const metadata: Metadata = { title: 'Journal' }

export default async function AdminBlogPage() {
  const { supabase } = await requireAdmin()

  const { data } = await supabase
    .from('blog_posts')
    .select(
      'id, slug, title, category, excerpt, body, cover_image, cover_alt, cover_credit, cover_blur, read_minutes, published, published_at'
    )
    .order('published_at', { ascending: false, nullsFirst: true })

  const posts = (data ?? []) as AdminBlogPost[]

  return (
    <div>
      <h1 className="text-title md:text-display text-brand font-extrabold">Journal</h1>
      <p className="text-muted mt-1.5 max-w-2xl text-[14px]">
        Articles published to the public journal. Drafts stay hidden until you tick publish.
      </p>

      <div className="mt-6 md:mt-8">
        <BlogEditor posts={posts} />
      </div>
    </div>
  )
}
