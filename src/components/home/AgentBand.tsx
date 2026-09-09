import { ArrowRight, BellRing, Download, KeyRound } from 'lucide-react'
import Link from 'next/link'

const AGENT_BENEFITS = [
  {
    Icon: BellRing,
    title: 'Alerted the moment a listing goes live',
    body: 'Every new listing reaches you the second it publishes, on your phone, before it circulates.',
  },
  {
    Icon: Download,
    title: 'Full photo sets, one tap',
    body: 'Download the complete gallery for any listing and send it straight to your client.',
  },
  {
    Icon: KeyRound,
    title: 'Titles already checked',
    body: 'We confirm the documentation before listing, so you are not the one carrying that risk.',
  },
]

export function AgentBand() {
  return (
    <section className="bg-white">
      <div className="app-shell grid gap-12 py-16 md:py-20 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-16">
        <div>
          <h2 className="text-ink text-[26px] leading-[1.1] font-extrabold sm:text-[30px] md:text-[38px] md:leading-[1.08]">
            Selling to a client who wants Lagos?
          </h2>
          <p className="text-muted mt-5 max-w-md text-[15px] leading-relaxed md:text-[16px]">
            Register as a cooperating agent and work from our inspected listings. Listing with us is
            free. You keep the client relationship, we handle the inspection and the paperwork.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="bg-brand hover:bg-brand-hover rounded-control group flex h-12 items-center gap-2 px-6 text-[15px] font-bold text-white transition-colors"
            >
              Register as an agent
              <ArrowRight
                size={17}
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="/properties"
              className="text-ink hover:border-ink rounded-control flex h-12 items-center border px-6 text-[15px] font-semibold transition-colors"
            >
              Browse properties
            </Link>
          </div>
        </div>

        <ul className="space-y-8">
          {AGENT_BENEFITS.map(({ Icon, title, body }) => (
            <li key={title} className="flex gap-4">
              <span className="text-brand mt-0.5 shrink-0">
                <Icon size={19} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h3 className="text-ink text-[16px] font-bold">{title}</h3>
                <p className="text-muted mt-1.5 text-[14px] leading-relaxed">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
