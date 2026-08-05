import { ArrowUpRight } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { isSupabaseConfigured } from '@/lib/env'
import { listBlogPosts, type BlogPost } from '@/lib/queries/blog'
import { createSupabasePublicClient } from '@/lib/supabase/public'

export const metadata: Metadata = {
  title: 'Lagos Property Journal',
  description:
    'Guides and market insight on buying property in Lagos: title documents, service charges, inspections and where value sits across the city.',
  alternates: { canonical: '/blog' },
}

export const revalidate = 600

function formatDate(value: string | null): string {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

async function loadPosts(): Promise<BlogPost[]> {
  if (!isSupabaseConfigured) return []
  return listBlogPosts(createSupabasePublicClient()).catch(() => [])
}

export default async function BlogIndexPage() {
  const posts = await loadPosts()

  return (
    <div className="app-shell py-10 md:py-14">
      <header className="max-w-2xl">
        <h1 className="text-ink text-[28px] leading-tight font-extrabold sm:text-[34px] md:text-[42px]">
          Lagos Property Journal
        </h1>
        <p className="text-muted mt-4 text-[15px] leading-relaxed md:text-[16px]">
          What we have learned brokering property in Lagos, written for buyers, owners and agents.
          No filler, no sales copy.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="text-muted mt-12 text-[15px]">New writing is on the way.</p>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {posts.map(post => (
            <article
              key={post.slug}
              className="group rounded-card shadow-card hover:shadow-card-hover relative flex flex-col bg-white p-5 transition-shadow md:p-6"
            >
              <span className="text-brand text-[12px] font-semibold">{post.category}</span>

              <h2 className="text-ink mt-2.5 text-[19px] leading-snug font-bold md:text-[20px]">
                <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
                  {post.title}
                </Link>
              </h2>

              <p className="text-muted mt-3 flex-1 text-[14px] leading-relaxed">{post.excerpt}</p>

              <span className="text-muted mt-5 flex items-center justify-between gap-3 text-[13px]">
                <span>
                  {formatDate(post.published_at)} · {post.read_minutes} min read
                </span>
                <ArrowUpRight
                  size={17}
                  aria-hidden="true"
                  className="group-hover:text-brand shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </span>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
