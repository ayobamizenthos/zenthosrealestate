import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function AdvertiseBand() {
  return (
    <section className="bg-ink text-white">
      <div className="app-shell flex flex-col gap-8 py-14 md:flex-row md:items-center md:justify-between md:gap-12 md:py-16">
        <div className="max-w-xl">
          <h2 className="text-[26px] leading-tight font-extrabold text-white sm:text-[30px] md:text-[36px]">
            List your property free
          </h2>

          <p className="mt-4 text-[15px] leading-relaxed text-white/70 md:text-[16px]">
            Agents, developers and private owners list with us at no cost. Create an account and
            send us the address, the asking price and the documents. A Zenthos RE broker inspects
            the property and verifies the title before it goes live, then puts it in front of buyers
            already searching that area.
          </p>
        </div>

        <Link
          href="/register"
          className="text-ink group flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-white px-7 text-[15px] font-bold transition-colors hover:bg-white/90 sm:w-auto md:h-13"
        >
          Get started
          <ArrowRight
            size={17}
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>
    </section>
  )
}
