'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'

export interface BlogActionState {
  error?: string
  saved?: string
}

const postSchema = z.object({
  title: z.string().trim().min(4, 'Give the article a title').max(120),
  category: z.string().trim().min(2).max(40),
  excerpt: z.string().trim().min(10, 'Write a short summary').max(400),
  body: z.string().trim().min(50, 'The article body is too short'),
  read_minutes: z.coerce.number().int().min(1).max(60),
  published: z.boolean(),
})

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 70)
}

function readForm(formData: FormData) {
  return {
    title: String(formData.get('title') ?? ''),
    category: String(formData.get('category') ?? ''),
    excerpt: String(formData.get('excerpt') ?? ''),
    body: String(formData.get('body') ?? ''),
    read_minutes: String(formData.get('read_minutes') ?? '4'),
    published: formData.get('published') === 'on',
  }
}

function refresh(slug?: string) {
  revalidatePath('/blog')
  revalidatePath('/admin/blog')
  revalidatePath('/sitemap.xml')
  if (slug) revalidatePath(`/blog/${slug}`)
}

export async function saveBlogPost(
  _state: BlogActionState,
  formData: FormData
): Promise<BlogActionState> {
  const { supabase } = await requireAdmin()

  const parsed = postSchema.safeParse(readForm(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Check the fields and try again.' }
  }

  const id = String(formData.get('id') ?? '')
  const existingSlug = String(formData.get('slug') ?? '')
  const slug = existingSlug || toSlug(parsed.data.title)

  if (!slug) return { error: 'That title does not produce a usable web address.' }

  const payload = { ...parsed.data, slug }

  const { error } = id
    ? await supabase.from('blog_posts').update(payload).eq('id', id)
    : await supabase.from('blog_posts').insert(payload)

  if (error) {
    return {
      error: error.code === '23505' ? 'An article with that title already exists.' : error.message,
    }
  }

  refresh(slug)
  return { saved: parsed.data.published ? 'Published' : 'Saved as draft' }
}

export async function deleteBlogPost(
  _state: BlogActionState,
  formData: FormData
): Promise<BlogActionState> {
  const { supabase } = await requireAdmin()
  const id = String(formData.get('id') ?? '')

  if (!id) return { error: 'Missing article.' }

  const { error } = await supabase.from('blog_posts').delete().eq('id', id)
  if (error) return { error: error.message }

  refresh()
  return { saved: 'Article deleted' }
}
