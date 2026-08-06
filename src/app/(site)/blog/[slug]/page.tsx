import { ArrowLeft, ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'
import { journalCardImage, journalHeroImage, journalSocialImage } from '@/lib/cloudinary'
import { SITE } from '@/lib/constants'
import { isSupabaseConfigured } from '@/lib/env'
import { getBlogPost, listBlogPosts, type BlogPost } from '@/lib/queries/blog'
import { createSupabasePublicClient } from '@/lib/supabase/public'
import { generalInquiryLink } from '@/lib/whatsapp'

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

async function loadOtherPosts(slug: string): Promise<BlogPost[]> {
  if (!isSupabaseConfigured) return []
  const posts = await listBlogPosts(createSupabasePublicClient()).catch(() => [])
  return posts.filter(post => post.slug !== slug).slice(0, 4)
}

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const { slug } = await params
  const post = await loadPost(slug)

  if (!post) return { title: 'Article not found', robots: { index: false, follow: false } }

  const socialImage = post.cover_image ? journalSocialImage(post.cover_image) : null

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
      images: socialImage
        ? [{ url: socialImage, width: 1200, height: 630, alt: post.cover_alt || post.title }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: socialImage ? [socialImage] : undefined,
    },
  }
}

/*
  Posts are written in a deliberately small subset of markdown: "## " for a
  subheading, "> " for a pull quote, "- " for a list item, "**bold**", "*italic*"
  and blank lines between blocks. Anything richer would mean shipping a parser
  for content only we author.
*/
function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((fragment, index) => {
    if (fragment.startsWith('**') && fragment.endsWith('**')) {
      return (
        <strong key={index} className="text-ink font-bold">
          {fragment.slice(2, -2)}
        </strong>
      )
    }

    if (fragment.startsWith('*') && fragment.endsWith('*')) {
      return <em key={index}>{fragment.slice(1, -1)}</em>
    }

    return fragment
  })
}

function renderBody(body: string) {
  return body
    .split(/\n{2,}/)
    .map(block => block.trim())
    .filter(Boolean)
    .map((block, index) => {
      if (block.startsWith('## ')) {
        return (
          <h2
            key={index}
            className="text-ink mt-9 mb-3 text-[20px] leading-snug font-bold md:mt-12 md:text-[24px]"
          >
            {block.slice(3)}
          </h2>
        )
      }

      if (block.startsWith('> ')) {
        return (
          <blockquote
            key={index}
            className="border-brand text-ink my-7 border-l-2 pl-4 text-[17px] leading-relaxed font-medium md:my-9 md:pl-6 md:text-[19px]"
          >
            {renderInline(block.slice(2))}
          </blockquote>
        )
      }

      if (block.startsWith('- ')) {
        return (
          <ul key={index} className="mb-5 space-y-2">
            {block
              .split('\n')
              .map(line => line.replace(/^-\s*/, '').trim())
              .filter(Boolean)
              .map(item => (
                <li
                  key={item}
                  className="text-ink/85 before:bg-brand relative pl-5 text-[16px] leading-[1.7] before:absolute before:top-[0.7em] before:left-0 before:h-1.5 before:w-1.5 before:rounded-full md:text-[17px]"
                >
                  {renderInline(item)}
                </li>
              ))}
          </ul>
        )
      }

      return (
        <p key={index} className="text-ink/85 mb-5 text-[16px] leading-[1.75] md:text-[17px]">
          {renderInline(block)}
        </p>
      )
    })
}

export default async function BlogPostPage({ params }: { params: PageParams }) {
  const { slug } = await params
  const [post, otherPosts] = await Promise.all([loadPost(slug), loadOtherPosts(slug)])

  if (!post) notFound()

  return (
    <>
      <nav aria-label="Breadcrumb">
        <ol className="app-shell text-muted flex items-center gap-1.5 py-1 text-[13px] whitespace-nowrap">
          <li className="shrink-0">
            <Link
              href="/"
              className="hover:text-brand inline-flex min-h-9 items-center transition-colors"
            >
              Home
            </Link>
          </li>
          <ChevronRight size={13} aria-hidden="true" className="shrink-0" />
          <li className="shrink-0">
            <Link
              href="/blog"
              className="hover:text-brand inline-flex min-h-9 items-center transition-colors"
            >
              Journal
            </Link>
          </li>
          <ChevronRight size={13} aria-hidden="true" className="shrink-0" />
          <li className="text-ink min-w-0 truncate font-medium">{post.title}</li>
        </ol>
      </nav>

      <article className="app-shell pb-14 md:pb-20">
        <header className="max-w-3xl pt-2 pb-6 md:pt-6 md:pb-8">
          <span className="text-brand text-[12px] font-semibold tracking-wide uppercase">
            {post.category}
          </span>
          <h1 className="text-ink mt-2.5 text-[27px] leading-tight font-extrabold sm:text-[32px] md:text-[42px]">
            {post.title}
          </h1>
          <p className="text-muted mt-4 max-w-2xl text-[16px] leading-relaxed md:text-[18px]">
            {post.excerpt}
          </p>
          <p className="text-muted mt-4 text-[13px]">{post.read_minutes} min read</p>
        </header>

        {post.cover_image ? (
          <figure className="mb-8 md:mb-12">
            <div className="bg-surface rounded-card relative aspect-[16/10] w-full overflow-hidden md:aspect-[16/7]">
              <Image
                src={journalHeroImage(post.cover_image)}
                alt={post.cover_alt || post.title}
                fill
                sizes="(min-width: 1440px) 1344px, 100vw"
                priority
                className="object-cover"
              />
            </div>
            {post.cover_credit ? (
              <figcaption className="text-muted mt-2 text-[12px]">{post.cover_credit}</figcaption>
            ) : null}
          </figure>
        ) : null}

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-14">
          <div className="min-w-0 max-w-[68ch]">
            {renderBody(post.body)}

            <div className="border-hairline mt-10 border-t pt-6 md:mt-14">
              <Link
                href="/blog"
                className="text-ink hover:text-brand inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold transition-colors"
              >
                <ArrowLeft size={17} aria-hidden="true" />
                All articles
              </Link>
            </div>
          </div>

          <aside className="mt-12 lg:sticky lg:top-24 lg:mt-0">
            <div className="bg-surface rounded-card p-5">
              <p className="text-ink text-[15px] font-bold">Buying in Lagos?</p>
              <p className="text-muted mt-1.5 text-[14px] leading-relaxed">
                Every listing on this site has been inspected and its title checked before it went
                up. Tell us what you are looking for.
              </p>
              <a
                href={generalInquiryLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand hover:bg-brand-hover rounded-control mt-4 flex h-11 items-center justify-center gap-2 text-[14px] font-bold text-white transition-colors"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Talk to a broker
              </a>
              <Link
                href="/properties"
                className="border-hairline text-ink hover:border-ink rounded-control mt-2 flex h-11 items-center justify-center border text-[14px] font-semibold transition-colors"
              >
                Browse listings
              </Link>
            </div>

            {otherPosts.length > 0 ? (
              <div className="mt-8">
                <p className="text-ink text-[15px] font-bold">More from the journal</p>
                <ul className="mt-4 space-y-4">
                  {otherPosts.map(other => (
                    <li key={other.slug}>
                      <Link href={`/blog/${other.slug}`} className="group flex gap-3">
                        {other.cover_image ? (
                          <span className="bg-surface relative h-16 w-20 shrink-0 overflow-hidden rounded-lg">
                            <Image
                              src={journalCardImage(other.cover_image)}
                              alt=""
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          </span>
                        ) : null}
                        <span className="min-w-0">
                          <span className="text-brand block text-[11px] font-semibold tracking-wide uppercase">
                            {other.category}
                          </span>
                          <span className="text-ink group-hover:text-brand mt-0.5 block text-[14px] leading-snug font-semibold transition-colors">
                            {other.title}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>
      </article>
    </>
  )
}
