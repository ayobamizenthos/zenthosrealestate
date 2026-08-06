import { ArrowUpRight } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { journalCardImage } from '@/lib/cloudinary'
import { isSupabaseConfigured } from '@/lib/env'
import { listBlogPosts, type BlogPost } from '@/lib/queries/blog'
import { createSupabasePublicClient } from '@/lib/supabase/public'

export const metadata: Metadata = {
  title: 'Lagos Property Blog',
  description:
    'Guides and market insight on buying property in Lagos: title documents, service charges, inspections and where value sits across the city.',
  alternates: { canonical: '/blog' },
}

export const revalidate = 600

async function loadPosts(): Promise<BlogPost[]> {
  if (!isSupabaseConfigured) return []
  return listBlogPosts(createSupabasePublicClient()).catch(() => [])
}

function PostCard({
  post,
  isLead,
  priority,
}: {
  post: BlogPost
  isLead: boolean
  priority: boolean
}) {
  return (
    <article
      className={
        isLead
          ? 'group border-hairline rounded-card relative flex flex-col overflow-hidden border bg-white sm:col-span-2 lg:col-span-3 lg:min-h-[320px] lg:flex-row'
          : 'group border-hairline rounded-card relative flex flex-col overflow-hidden border bg-white'
      }
    >
      {post.cover_image ? (
        <div
          className={
            isLead
              ? 'bg-surface relative aspect-[3/2] w-full shrink-0 lg:aspect-auto lg:w-[52%]'
              : 'bg-surface relative aspect-[3/2] w-full'
          }
        >
          <Image
            src={journalCardImage(post.cover_image)}
            alt={post.cover_alt || ''}
            fill
            sizes={isLead ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 640px) 45vw, 100vw'}
            priority={priority}
            fetchPriority={priority ? 'high' : 'auto'}
            loading={priority ? 'eager' : 'lazy'}
            {...(post.cover_blur
              ? { placeholder: 'blur' as const, blurDataURL: post.cover_blur }
              : {})}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      ) : null}

      <div
        className={
          isLead ? 'flex flex-1 flex-col p-5 md:p-7 lg:justify-center' : 'flex flex-1 flex-col p-5'
        }
      >
        <span className="text-brand text-[12px] font-semibold tracking-wide uppercase">
          {post.category}
        </span>

        <h2
          className={
            isLead
              ? 'text-ink mt-2.5 text-[21px] leading-snug font-bold md:text-[26px]'
              : 'text-ink mt-2.5 text-[19px] leading-snug font-bold'
          }
        >
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
            {post.title}
          </Link>
        </h2>

        <p
          className={
            isLead
              ? 'text-muted mt-3 flex-1 text-[15px] leading-relaxed lg:flex-none'
              : 'text-muted mt-2.5 flex-1 text-[14px] leading-relaxed'
          }
        >
          {post.excerpt}
        </p>

        <span className="text-muted mt-5 flex items-center justify-between gap-3 text-[13px]">
          {post.read_minutes} min read
          <ArrowUpRight
            size={17}
            aria-hidden="true"
            className="group-hover:text-brand shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </article>
  )
}

export default async function BlogIndexPage() {
  const posts = await loadPosts()

  return (
    <div className="app-shell py-8 md:py-14">
      <header className="max-w-2xl">
        <h1 className="text-ink text-[28px] leading-tight font-extrabold sm:text-[34px] md:text-[42px]">
          Lagos Property Blog
        </h1>
        <p className="text-muted mt-4 text-[15px] leading-relaxed md:text-[16px]">
          What we have learned brokering property in Lagos, written for buyers, owners and agents.
          No filler, no sales copy.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="text-muted mt-12 text-[15px]">New writing is on the way.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 md:mt-10">
          {/* The lead and the first row are above the fold on a phone, so they
              load eagerly rather than waiting for the lazy observer. */}
          {posts.map((post, index) => (
            <PostCard key={post.slug} post={post} isLead={index === 0} priority={index < 3} />
          ))}
        </div>
      )}
    </div>
  )
}
