import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface SectionHeadingProps {
  title: string
  description?: string
  linkHref?: string
  linkLabel?: string
}

export function SectionHeading({ title, description, linkHref, linkLabel }: SectionHeadingProps) {
  return (
    <div className="mb-8 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between md:gap-10">
      <h2 className="text-ink max-w-xl text-[25px] leading-[1.1] font-extrabold text-balance sm:text-[30px] md:text-[36px] md:leading-[1.04] lg:text-[46px]">
        {title}
      </h2>

      {description || (linkHref && linkLabel) ? (
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8 md:shrink-0 md:justify-end">
          {description ? (
            <p className="text-muted max-w-md text-[14px] leading-relaxed sm:max-w-xs md:text-[15px]">
              {description}
            </p>
          ) : null}

          {linkHref && linkLabel ? (
            <Link
              href={linkHref}
              className="bg-ink hover:bg-brand group flex h-11 shrink-0 items-center gap-2 self-start rounded-full px-5 text-[14px] font-semibold text-white transition-colors sm:self-end"
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
      ) : null}
    </div>
  )
}
