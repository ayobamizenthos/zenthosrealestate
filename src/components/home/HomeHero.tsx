import { ShieldCheck } from 'lucide-react'
import { HeroSearchForm } from './HeroSearchForm'

/**
 * Dark stage, centred type, and a white search card floating over it. The card
 * is the point of the page — a buyer should be able to start a real search
 * without scrolling or clicking through to another screen first.
 */
export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-[#1B0710]">
      {/* Two offset radial washes give the backdrop depth without a mesh gradient. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60rem 34rem at 78% -10%, rgba(128,0,32,0.75), transparent 62%), radial-gradient(46rem 28rem at 12% 108%, rgba(128,0,32,0.42), transparent 60%)',
        }}
      />

      <div className="app-shell relative flex flex-col items-center py-12 text-center md:py-24">
        <span className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[12px] font-semibold text-white/90 backdrop-blur-sm">
          <ShieldCheck size={13} aria-hidden="true" />
          Every listing inspected before it is published
        </span>

        <h1 className="mt-6 max-w-4xl text-[36px] leading-[1.04] font-extrabold tracking-tight text-white md:mt-7 md:text-[62px] lg:text-[72px]">
          Find the right property in Lagos &amp; Abuja
        </h1>

        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/70 md:mt-5 md:text-[17px]">
          Houses, duplexes and apartments for sale across the islands, the mainland and the capital
          — documented, and one WhatsApp message away.
        </p>

        <div className="mt-8 flex w-full justify-center md:mt-10">
          <HeroSearchForm />
        </div>
      </div>
    </section>
  )
}
