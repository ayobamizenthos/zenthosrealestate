import { Apple, Mail, Phone, Play } from 'lucide-react'
import Link from 'next/link'
import { InstagramIcon } from '@/components/icons/InstagramIcon'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'
import { LOCATION_LANDING_PAGES, SITE } from '@/lib/constants'
import { generalInquiryLink } from '@/lib/whatsapp'

const POPULAR_SEARCHES = [
  { label: 'Duplexes for sale', href: '/properties?type=Detached+Duplex' },
  { label: 'Apartments for sale', href: '/properties?type=Apartment' },
  { label: 'Serviced homes', href: '/properties?serviced=1' },
  { label: 'Newest listings', href: '/properties?sort=newest' },
]

const COMPANY_LINKS = [
  { label: 'All properties', href: '/properties' },
  { label: 'Saved homes', href: '/saved' },
  { label: 'Compare', href: '/compare' },
  { label: 'Agent access', href: '/register' },
]

function FooterColumn({
  heading,
  links,
}: {
  heading: string
  links: { label: string; href: string }[]
}) {
  return (
    <nav>
      <h2 className="text-[11px] font-semibold tracking-[0.18em] text-white/45 uppercase">
        {heading}
      </h2>
      <span className="mt-3 mb-4 block h-px w-full bg-white/15" />
      <ul className="space-y-3">
        {links.map(link => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-[14px] font-semibold tracking-wide text-white uppercase transition-colors hover:text-white/60"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function SiteFooter() {
  return (
    <footer className="bg-brand relative mt-24 flex flex-col justify-between overflow-hidden rounded-t-[60px] px-6 pt-20 pb-[150px] text-white md:min-h-[calc(100vh-80px)] md:rounded-t-[120px] md:px-12 md:pt-32 md:pb-[300px]">
      <div className="relative z-20 mx-auto grid w-full max-w-6xl gap-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-[26px] leading-none font-extrabold tracking-tight">ZENTHOS</p>
          <p className="mt-1 text-[10px] font-semibold tracking-[0.3em] text-white/50 uppercase">
            Real Estate
          </p>
          <p className="mt-6 max-w-xs text-[13px] leading-[1.9] tracking-wide text-white/60 uppercase">
            We broker residential property across Lagos and Abuja. Every home is inspected and its
            title checked before it reaches this site.
          </p>

          <div className="mt-7 flex items-center gap-3">
            <a
              href="https://instagram.com/zenthosrealestate"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Zenthos Real Estate on Instagram"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 transition-colors hover:bg-white/10"
            >
              <InstagramIcon className="h-[18px] w-[18px]" />
            </a>
            <a
              href={generalInquiryLink()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with Zenthos on WhatsApp"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 transition-colors hover:bg-white/10"
            >
              <WhatsAppIcon className="h-[18px] w-[18px]" />
            </a>
          </div>
        </div>

        <FooterColumn
          heading="Areas"
          links={LOCATION_LANDING_PAGES.slice(0, 6).map(area => ({
            label: area.name,
            href: `/properties/${area.slug}`,
          }))}
        />
        <FooterColumn heading="Popular" links={POPULAR_SEARCHES} />

        <div className="space-y-10">
          <FooterColumn heading="Company" links={COMPANY_LINKS} />

          <div>
            <h2 className="text-[11px] font-semibold tracking-[0.18em] text-white/45 uppercase">
              Mobile app
            </h2>
            <span className="mt-3 mb-4 block h-px w-full bg-white/15" />
            <div className="flex flex-wrap gap-3">
              <a
                href="/offline"
                className="flex h-12 items-center gap-2.5 rounded-lg border border-white/20 px-4 transition-colors hover:bg-white/10"
              >
                <Apple size={20} aria-hidden="true" />
                <span className="leading-tight">
                  <span className="block text-[9px] tracking-wide text-white/55 uppercase">
                    Download on the
                  </span>
                  <span className="block text-[13px] font-bold">App Store</span>
                </span>
              </a>
              <a
                href="/offline"
                className="flex h-12 items-center gap-2.5 rounded-lg border border-white/20 px-4 transition-colors hover:bg-white/10"
              >
                <Play size={18} aria-hidden="true" />
                <span className="leading-tight">
                  <span className="block text-[9px] tracking-wide text-white/55 uppercase">
                    Get it on
                  </span>
                  <span className="block text-[13px] font-bold">Google Play</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-20 mx-auto mt-16 flex w-full max-w-6xl flex-col gap-4 border-t border-white/15 pt-8 text-[12px] tracking-wide text-white/50 uppercase md:flex-row md:items-center md:justify-between">
        <p>
          © {new Date().getFullYear()} {SITE.name}
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <a
            href={`tel:+${SITE.whatsappNumber}`}
            className="flex items-center gap-2 hover:text-white"
          >
            <Phone size={13} aria-hidden="true" />
            {SITE.phoneDisplay}
          </a>
          <a href={`mailto:${SITE.email}`} className="flex items-center gap-2 hover:text-white">
            <Mail size={13} aria-hidden="true" />
            {SITE.email}
          </a>
          <span>Lagos · Abuja</span>
        </div>
      </div>

      {/* Oversized wordmark bleeding off the bottom edge, the way the brand
          treatment does on the rest of the estate. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-0.15em] left-1/2 z-10 -translate-x-1/2 text-[30vw] leading-none font-black tracking-tighter whitespace-nowrap text-white/10 italic uppercase md:text-[clamp(15vw,25vw,400px)]"
      >
        Zenthos
      </span>
    </footer>
  )
}
