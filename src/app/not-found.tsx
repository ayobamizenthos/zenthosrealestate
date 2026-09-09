import Link from 'next/link'
import { ZenthosLogo } from '@/components/brand/ZenthosLogo'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <ZenthosLogo />
      <p className="text-brand mt-10 text-[13px] font-semibold">Error 404</p>
      <h1 className="text-ink mt-2 text-[22px] font-bold">This listing is no longer available</h1>
      <p className="text-muted mt-2 max-w-sm text-[14px] leading-relaxed">
        It may have been sold, withdrawn, or the link could be wrong. Browse what we currently have
        across Lagos.
      </p>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/properties"
          className="bg-brand hover:bg-brand-hover flex h-11 items-center rounded-full px-6 text-[14px] font-semibold text-white transition-colors"
        >
          Browse all properties
        </Link>
        <Link
          href="/"
          className="border-hairline text-ink hover:bg-surface flex h-11 items-center rounded-full border px-6 text-[14px] font-semibold transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
