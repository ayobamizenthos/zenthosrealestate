'use client'

import { Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect } from 'react'
import { deleteBlogPost, saveBlogPost, type BlogActionState } from '@/lib/actions/blog'
import { TextArea, TextField } from '@/components/ui/TextField'

const EMPTY: BlogActionState = {}

export interface AdminBlogPost {
  id: string
  slug: string
  title: string
  category: string
  excerpt: string
  body: string
  read_minutes: number
  published: boolean
  published_at: string | null
}

function PostFields({ post }: { post?: AdminBlogPost }) {
  return (
    <div className="space-y-4">
      <TextField
        name="title"
        label="Title"
        defaultValue={post?.title}
        required
        maxLength={120}
        hint="Keep it under 60 characters so search results do not truncate it."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          name="category"
          label="Category"
          defaultValue={post?.category ?? 'Market insight'}
          required
        />
        <TextField
          name="read_minutes"
          label="Read time (minutes)"
          type="number"
          min={1}
          max={60}
          defaultValue={post?.read_minutes ?? 4}
          required
        />
      </div>

      <TextArea
        name="excerpt"
        label="Summary"
        rows={3}
        defaultValue={post?.excerpt}
        required
        maxLength={400}
        hint="Shown on the article card and used as the meta description."
      />

      <TextArea
        name="body"
        label="Article"
        rows={16}
        defaultValue={post?.body}
        required
        hint="Leave a blank line between paragraphs. Start a line with ## to make it a subheading."
      />

      <label className="flex items-center gap-3 text-[14px]">
        <input
          type="checkbox"
          name="published"
          defaultChecked={post?.published ?? false}
          className="accent-brand h-4 w-4"
        />
        <span className="text-ink font-semibold">Publish to the site</span>
      </label>
    </div>
  )
}

export function BlogEditor({ posts }: { posts: AdminBlogPost[] }) {
  const router = useRouter()
  const [saveState, saveAction, savePending] = useActionState(saveBlogPost, EMPTY)
  const [deleteState, deleteAction, deletePending] = useActionState(deleteBlogPost, EMPTY)

  const savedAt = saveState.savedAt ?? deleteState.savedAt

  useEffect(() => {
    if (savedAt) router.refresh()
  }, [savedAt, router])

  const message = saveState.error ?? deleteState.error ?? saveState.saved ?? deleteState.saved
  const isError = Boolean(saveState.error ?? deleteState.error)

  return (
    <div className="space-y-8">
      {message ? (
        <p
          role="status"
          className={
            isError
              ? 'text-danger bg-danger/5 rounded-card px-4 py-3 text-[14px]'
              : 'text-success bg-success/5 rounded-card px-4 py-3 text-[14px]'
          }
        >
          {message}
        </p>
      ) : null}

      <details className="rounded-card shadow-card bg-white">
        <summary className="text-ink flex cursor-pointer items-center gap-2 p-5 text-[15px] font-bold">
          <Plus size={17} aria-hidden="true" className="text-brand" />
          Write a new article
        </summary>
        <form action={saveAction} className="space-y-4 border-t p-5">
          <PostFields />
          <button
            type="submit"
            disabled={savePending}
            className="bg-brand hover:bg-brand-hover rounded-control h-11 px-5 text-[14px] font-bold text-white transition-colors disabled:opacity-50"
          >
            {savePending ? 'Saving…' : 'Save article'}
          </button>
        </form>
      </details>

      <section>
        <h2 className="text-ink text-[17px] font-bold">
          {posts.length} {posts.length === 1 ? 'article' : 'articles'}
        </h2>

        <div className="mt-4 space-y-3">
          {posts.map(post => (
            <details key={post.id} className="rounded-card shadow-card bg-white">
              <summary className="flex cursor-pointer flex-wrap items-center gap-3 p-5">
                <span className="min-w-0 flex-1">
                  <span className="text-ink block truncate text-[15px] font-bold">
                    {post.title}
                  </span>
                  <span className="text-muted mt-0.5 block text-[13px]">
                    {post.category} · {post.read_minutes} min ·{' '}
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </span>
              </summary>

              <div className="space-y-5 border-t p-5">
                <form action={saveAction} className="space-y-4">
                  <input type="hidden" name="id" value={post.id} />
                  <input type="hidden" name="slug" value={post.slug} />
                  <PostFields post={post} />
                  <button
                    type="submit"
                    disabled={savePending}
                    className="bg-brand hover:bg-brand-hover rounded-control h-11 px-5 text-[14px] font-bold text-white transition-colors disabled:opacity-50"
                  >
                    {savePending ? 'Saving…' : 'Save changes'}
                  </button>
                </form>

                <form action={deleteAction} className="border-t pt-4">
                  <input type="hidden" name="id" value={post.id} />
                  <button
                    type="submit"
                    disabled={deletePending}
                    className="text-danger hover:bg-danger/5 rounded-control flex h-10 items-center gap-2 px-3 text-[14px] font-semibold transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={15} aria-hidden="true" />
                    Delete this article
                  </button>
                </form>
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}
