'use client'

import clsx from 'clsx'
import { MessageSquareText, Phone, Mail, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { InstagramIcon } from '@/components/icons/InstagramIcon'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'
import { SITE } from '@/lib/constants'
import { generalInquiryLink } from '@/lib/whatsapp'

interface ContactChannel {
  label: string
  href: string
  icon: React.ReactNode
  external?: boolean
}

export function ContactFab() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasScrolledPastFold, setHasScrolledPastFold] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sync = () => setHasScrolledPastFold(window.scrollY > window.innerHeight * 0.6)
    sync()
    window.addEventListener('scroll', sync, { passive: true })
    return () => window.removeEventListener('scroll', sync)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const closeOnOutside = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('pointerdown', closeOnOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen])

  const channels: ContactChannel[] = [
    {
      label: 'WhatsApp',
      href: generalInquiryLink(),
      icon: <WhatsAppIcon className="h-[19px] w-[19px]" />,
      external: true,
    },
    {
      label: 'Call us',
      href: `tel:+${SITE.whatsappNumber}`,
      icon: <Phone size={18} aria-hidden="true" />,
    },
    {
      label: 'Email us',
      href: `mailto:${SITE.email}`,
      icon: <Mail size={18} aria-hidden="true" />,
    },
    {
      label: 'Instagram',
      href: 'https://instagram.com/zenthosrealestate',
      icon: <InstagramIcon className="h-[18px] w-[18px]" />,
      external: true,
    },
  ]

  return (
    <div
      ref={containerRef}
      className={clsx(
        'fixed right-4 bottom-[calc(64px+env(safe-area-inset-bottom)+16px)] z-40 flex flex-col items-end gap-3 transition-opacity duration-300 md:bottom-6',
        hasScrolledPastFold ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
    >
      <div className="flex flex-col items-end gap-2.5">
        {channels.map((channel, index) => (
          <a
            key={channel.label}
            href={channel.href}
            target={channel.external ? '_blank' : undefined}
            rel={channel.external ? 'noopener noreferrer' : undefined}
            tabIndex={isOpen ? undefined : -1}
            aria-hidden={isOpen ? undefined : true}
            onClick={() => setIsOpen(false)}
            style={{ transitionDelay: `${isOpen ? index * 45 : (channels.length - index) * 25}ms` }}
            className={clsx(
              'shadow-float text-ink flex h-11 items-center gap-2.5 rounded-full bg-white pr-4 pl-3 text-[14px] font-semibold transition-all duration-300 ease-out',
              isOpen
                ? 'translate-y-0 scale-100 opacity-100'
                : 'pointer-events-none translate-y-3 scale-90 opacity-0'
            )}
          >
            <span className="bg-brand flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white">
              {channel.icon}
            </span>
            {channel.label}
          </a>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(open => !open)}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close contact options' : 'Contact Zenthos'}
        tabIndex={hasScrolledPastFold ? undefined : -1}
        className="bg-brand hover:bg-brand-hover shadow-float flex h-14 w-14 items-center justify-center rounded-full text-white transition-all duration-300 active:scale-95"
      >
        <span
          className={clsx(
            'transition-transform duration-300',
            isOpen ? 'rotate-90 scale-0' : 'rotate-0 scale-100'
          )}
        >
          <MessageSquareText size={24} aria-hidden="true" />
        </span>
        <span
          className={clsx(
            'absolute transition-transform duration-300',
            isOpen ? 'rotate-0 scale-100' : '-rotate-90 scale-0'
          )}
        >
          <X size={24} aria-hidden="true" />
        </span>
      </button>
    </div>
  )
}
