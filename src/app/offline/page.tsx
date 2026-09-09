import type { Metadata } from 'next'
import { WifiOff } from 'lucide-react'
import { ZenthosLogo } from '@/components/brand/ZenthosLogo'

export const metadata: Metadata = {
  title: 'Offline',
  robots: { index: false, follow: false },
}

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <ZenthosLogo />
      <WifiOff size={40} className="text-brand/30 mt-10" aria-hidden="true" />
      <h1 className="text-ink mt-5 text-[20px] font-bold">You&rsquo;re offline</h1>
      <p className="text-muted mt-2 max-w-xs text-[14px]">
        Connect to the internet to browse properties. Pages you have already opened stay available.
      </p>
    </div>
  )
}
