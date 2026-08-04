'use client'

import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'
import { generalInquiryLink } from '@/lib/whatsapp'

export function WhatsAppFab() {
  const [hasScrolledPastFold, setHasScrolledPastFold] = useState(false)

  useEffect(() => {
    const sync = () => setHasScrolledPastFold(window.scrollY > window.innerHeight * 0.6)
    sync()
    window.addEventListener('scroll', sync, { passive: true })
    return () => window.removeEventListener('scroll', sync)
  }, [])

  return (
    <a
      href={generalInquiryLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Zenthos on WhatsApp"
      tabIndex={hasScrolledPastFold ? undefined : -1}
      aria-hidden={hasScrolledPastFold ? undefined : true}
      className={clsx(
        'bg-whatsapp shadow-float fixed right-4 bottom-[calc(64px+env(safe-area-inset-bottom)+16px)] z-40 flex h-14 w-14 items-center justify-center rounded-full text-white transition-all duration-300 active:scale-95 md:bottom-6',
        hasScrolledPastFold
          ? 'animate-nudge scale-100 opacity-100'
          : 'pointer-events-none scale-90 opacity-0'
      )}
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  )
}
