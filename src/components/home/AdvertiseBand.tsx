import { ArrowRight, Megaphone } from 'lucide-react'
import Link from 'next/link'

export function AdvertiseBand() {
  return (
    <section className="bg-ink text-white">
      <div className="app-shell flex flex-col gap-8 py-14 md:flex-row md:items-center md:justify-between md:py-16">
        <div className="max-w-xl">
          <span className="flex items-center gap-2 text-[12px] font-semibold tracking-[0.16em] text-white/50 uppercase">
            <Megaphone size={15} aria-hidden="true" />
            Have a property to sell
          </span>

          <h2 className="mt-4 text-[28px] leading-tight font-extrabold text-white md:text-[36px]">
            List it with Zenthos
          </h2>

          <p className="mt-4 text-[15px] leading-relaxed text-white/70 md:text-[16px]">
            Send us the address, the asking price and the documents. We inspect it, photograph it
            and put it in front of buyers already searching your area.
          </p>
        </div>

        <Link
          href="/register"
          className="text-ink group flex h-13 shrink-0 items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[15px] font-bold transition-colors hover:bg-white/90"
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
