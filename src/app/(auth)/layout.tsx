import Link from 'next/link'
import { ZenthosLogo } from '@/components/brand/ZenthosLogo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="app-shell flex h-16 items-center">
        <Link href="/" aria-label="Zenthos Real Estate home">
          <ZenthosLogo />
        </Link>
      </header>

      <main className="flex flex-1 items-start justify-center px-4 py-8 md:items-center md:py-16">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  )
}
