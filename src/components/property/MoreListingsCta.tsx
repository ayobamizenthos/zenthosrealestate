import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'
import { generalInquiryLink } from '@/lib/whatsapp'

export function MoreListingsCta({ area }: { area?: string }) {
  return (
    <section className="rounded-card mt-12 bg-ink px-6 py-10 text-center md:px-10 md:py-14">
      <h2 className="text-[22px] leading-tight font-extrabold text-white sm:text-[26px] md:text-[30px]">
        Cannot find what you are looking for?
      </h2>

      <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-white/70 md:text-[16px]">
        Not every home we broker reaches this page. Tell a broker what you need
        {area ? ` in ${area}` : ''} and we will send you the premium listings held off market.
      </p>

      <a
        href={generalInquiryLink()}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-brand hover:bg-brand-hover mt-7 inline-flex h-12 items-center justify-center gap-2.5 rounded-full px-7 text-[15px] font-bold text-white transition-colors md:h-13 md:px-8"
      >
        <WhatsAppIcon className="h-5 w-5" />
        Talk to a broker on WhatsApp
      </a>
    </section>
  )
}
