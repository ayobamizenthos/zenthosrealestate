import type { Metadata } from 'next'
import Link from 'next/link'
import { AdminNav } from '@/components/admin/AdminNav'
import { ZenthosLogo } from '@/components/brand/ZenthosLogo'
import { requireAdmin } from '@/lib/auth'

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s | Zenthos Admin' },
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-hairline bg-canvas sticky top-0 z-40 border-b">
        <div className="app-shell flex h-16 items-center gap-4">
          <Link href="/admin" aria-label="Zenthos admin dashboard" className="shrink-0">
            <ZenthosLogo />
          </Link>
          <span className="bg-surface text-brand rounded-pill hidden px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase sm:inline">
            Admin
          </span>

          <div className="flex-1" />

          <Link
            href="/"
            className="text-muted hover:text-brand text-[14px] font-semibold transition-colors"
          >
            View site
          </Link>
        </div>

        <div className="app-shell pb-3">
          <AdminNav />
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  )
}
