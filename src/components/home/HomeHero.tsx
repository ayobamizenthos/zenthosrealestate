import { HeroSearchForm } from './HeroSearchForm'

export function HomeHero() {
  return (
    <section className="relative bg-[#1B0710]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{
          background:
            'radial-gradient(60rem 34rem at 78% -10%, rgba(128,0,32,0.75), transparent 62%), radial-gradient(46rem 28rem at 12% 108%, rgba(128,0,32,0.42), transparent 60%)',
        }}
      />

      <div className="app-shell relative flex flex-col items-center py-12 text-center md:py-24">
        <h1 className="mt-6 max-w-4xl text-[36px] leading-[1.04] font-extrabold tracking-tight text-white md:mt-7 md:text-[62px] lg:text-[72px]">
          Find the right property in Lagos
        </h1>

        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/70 md:mt-5 md:text-[17px]">
          Houses, duplexes and apartments across Lagos island and mainland. Every title checked
          before we list it. Speak to a broker on WhatsApp today.
        </p>

        <div className="mt-8 flex w-full justify-center md:mt-10">
          <HeroSearchForm />
        </div>
      </div>
    </section>
  )
}
