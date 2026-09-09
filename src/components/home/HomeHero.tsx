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

      <div className="app-shell relative flex flex-col items-center py-8 text-center sm:py-10 md:py-16">
        <h1 className="max-w-4xl text-[28px] leading-[1.08] font-extrabold tracking-tight text-white text-balance sm:text-[34px] md:text-[52px] lg:text-[58px]">
          Find the right property in Lagos
        </h1>

        <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-white/70 sm:text-[15px] md:mt-4 md:text-[16px]">
          Houses, duplexes and apartments across Lagos island and mainland. Every title checked
          before we list it.
        </p>

        <div className="mt-5 flex w-full justify-center md:mt-8">
          <HeroSearchForm />
        </div>
      </div>
    </section>
  )
}
