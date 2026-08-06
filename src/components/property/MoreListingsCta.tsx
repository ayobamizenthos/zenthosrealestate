import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'
import { generalInquiryLink } from '@/lib/whatsapp'

export function MoreListingsCta({ area }: { area?: string }) {
  return (
    <section className="mt-12 text-center">
      <p className="text-ink text-[16px] font-bold md:text-[18px]">
        Cannot find what you want{area ? ` in ${area}` : ''}?
      </p>
      <p className="text-muted mx-auto mt-1.5 max-w-sm text-[14px]">
        Message us for listings held off market.
      </p>

      <a
        href={generalInquiryLink()}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-brand hover:bg-brand-hover mt-4 inline-flex h-10 items-center gap-2 rounded-full px-5 text-[14px] font-semibold text-white transition-colors"
      >
        <WhatsAppIcon className="h-4 w-4" />
        Chat with us
      </a>
    </section>
  )
}
