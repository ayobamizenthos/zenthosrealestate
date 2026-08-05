import { ArrowLeft, ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SITE } from '@/lib/constants'
import { isSupabaseConfigured } from '@/lib/env'
import { getBlogPost, listBlogPosts, type BlogPost } from '@/lib/queries/blog'
import { createSupabasePublicClient } from '@/lib/supabase/public'

type PageParams = Promise<{ slug: string }>

export const revalidate = 600

export async function generateStaticParams() {
  if (!isSupabaseConfigured) return []
  try {
    const posts = await listBlogPosts(createSupabasePublicClient())
    return posts.map(post => ({ slug: post.slug }))
  } catch {
    return []
  }
}

async function loadPost(slug: string): Promise<BlogPost | null> {
  if (!isSupabaseConfigured) return null
  return getBlogPost(createSupabasePublicClient(), slug).catch(() => null)
}

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const { slug } = await params
  const post = await loadPost(slug)

  if (!post) return { title: 'Article not found', robots: { index: false, follow: false } }

  return {
    title: { absolute: post.title },
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      siteName: SITE.name,
      publishedTime: post.published_at ?? undefined,
    },
  }
}

// Posts are written in a deliberately small subset of markdown: "## " for a
// subheading, blank lines between paragraphs. Anything richer would mean
// shipping a parser for content only we author.
function renderBody(body: string) {
  return body
    .split(/\n{2,}/)
    .map(block => block.trim())
    .filter(Boolean)
    .map((block, index) =>
      block.startsWith('## ') ? (
        <h2
          key={index}
          className="text-ink mt-10 mb-3 text-[20px] font-bold md:mt-12 md:text-[24px]"
        >
          {block.slice(3)}
        </h2>
      ) : (
        <p key={index} className="text-ink/80 mb-5 text-[16px] leading-[1.75] md:text-[17px]">
          {block}
        </p>
      )
    )
}

export default async function BlogPostPage({ params }: { params: PageParams }) {
  const { slug } = await params
  const post = await loadPost(slug)

  if (!post) notFound()

  const publishedOn = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-NG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : ''

  return (
    <>
      <nav aria-label="Breadcrumb">
        <ol className="app-shell text-muted flex items-center gap-1.5 py-1 text-[13px]">
          <li>
            <Link
              href="/"
              className="hover:text-brand inline-flex min-h-9 items-center transition-colors"
            >
              Home
            </Link>
          </li>
          <ChevronRight size={13} aria-hidden="true" className="shrink-0" />
          <li>
            <Link
              href="/blog"
              className="hover:text-brand inline-flex min-h-9 items-center transition-colors"
            >
              Journal
            </Link>
          </li>
          <ChevronRight size={13} aria-hidden="true" className="shrink-0" />
          <li className="text-ink truncate font-medium">{post.title}</li>
        </ol>
      </nav>

      <article className="app-shell pb-16">
        <header className="mx-auto max-w-2xl pt-4 pb-8 md:pt-8">
          <span className="text-brand text-[13px] font-semibold">{post.category}</span>
          <h1 className="text-ink mt-3 text-[27px] leading-tight font-extrabold sm:text-[32px] md:text-[40px]">
            {post.title}
          </h1>
          <p className="text-muted mt-4 text-[14px]">
            {publishedOn} · {post.read_minutes} min read
          </p>
        </header>

        <div className="mx-auto max-w-2xl">{renderBody(post.body)}</div>

        <div className="mx-auto mt-12 max-w-2xl border-t pt-8">
          <Link
            href="/blog"
            className="text-ink hover:text-brand inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold transition-colors"
          >
            <ArrowLeft size={17} aria-hidden="true" />
            All articles
          </Link>
        </div>
      </article>
    </>
  )
}
