import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'
import { generalInquiryLink } from '@/lib/whatsapp'

/**
 * Sits above the bottom tab bar on mobile and in the corner on desktop. The
 * nudge animation runs on a 10s cycle and is disabled under reduced motion.
 */
export function WhatsAppFab() {
  return (
    <a
      href={generalInquiryLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Zenthos on WhatsApp"
      className="bg-whatsapp shadow-float animate-nudge fixed right-4 bottom-[calc(64px+env(safe-area-inset-bottom)+16px)] z-40 flex h-14 w-14 items-center justify-center rounded-full text-white transition-transform duration-200 active:scale-95 md:bottom-6"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  )
}
