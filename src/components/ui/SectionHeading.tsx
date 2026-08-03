import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  description?: string
  linkHref?: string
  linkLabel?: string
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  linkHref,
  linkLabel,
}: SectionHeadingProps) {
  return (
    <div className="border-hairline mb-10 border-t pt-6 md:mb-14">
      {eyebrow ? (
        <p className="text-muted text-eyebrow font-semibold uppercase">{eyebrow}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <h2 className="text-ink max-w-xl text-[30px] leading-[1.04] md:text-display-lg lg:text-display-xl">
          {title}
        </h2>

        <div className="flex flex-1 items-end justify-between gap-6 md:flex-none">
          {description ? (
            <p className="text-muted max-w-xs text-[14px] leading-relaxed">{description}</p>
          ) : null}

          {linkHref && linkLabel ? (
            <Link
              href={linkHref}
              className="text-ink hover:text-brand group flex shrink-0 items-center gap-2 border-b border-current pb-1 text-[14px] font-semibold transition-colors"
            >
              {linkLabel}
              <ArrowRight
                size={15}
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  )
}
