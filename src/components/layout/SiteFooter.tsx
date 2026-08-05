import { Download, Mail, Phone } from 'lucide-react'
import Link from 'next/link'
import { ZenthosLogo } from '@/components/brand/ZenthosLogo'
import { InstagramIcon } from '@/components/icons/InstagramIcon'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'
import { LOCATION_LANDING_PAGES, SITE } from '@/lib/constants'
import { generalInquiryLink } from '@/lib/whatsapp'

const POPULAR_SEARCHES = [
  { label: 'Detached duplexes', href: '/properties?type=Detached+Duplex' },
  { label: 'Semi-detached duplexes', href: '/properties?type=Semi-detached+Duplex' },
  { label: 'Terraced duplexes', href: '/properties?type=Terraced+Duplex' },
  { label: 'Apartments', href: '/properties?type=Apartment' },
  { label: 'Newest listings', href: '/properties?sort=newest' },
]

const COMPANY_LINKS = [
  { label: 'All properties', href: '/properties' },
  { label: 'Saved', href: '/saved' },
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
      <h2 className="text-[13px] font-semibold text-white/70">{heading}</h2>
      <ul className="mt-3">
        {links.map(link => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="flex min-h-11 items-center text-[14px] font-semibold tracking-wide text-white transition-colors hover:text-white/60"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function ContactAction({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-white transition-transform hover:-translate-y-0.5"
    >
      {children}
    </a>
  )
}

export function SiteFooter() {
  return (
    <footer className="bg-brand relative mt-24 flex flex-col justify-between overflow-hidden rounded-t-[60px] px-6 pt-20 pb-[130px] text-white md:rounded-t-[120px] md:px-12 md:pt-28 md:pb-[220px]">
      <div className="relative z-20 mx-auto grid w-full max-w-6xl gap-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <ZenthosLogo tone="white" className="h-14 w-[190px] md:h-16 md:w-[215px]" />

          <p className="mt-6 max-w-xs text-[14px] leading-relaxed text-white/65">
            Residential property across Lagos island and mainland. Every home is inspected and its
            title checked before it reaches this site.
          </p>

          <div className="mt-7 flex items-center gap-3">
            <ContactAction href={`tel:+${SITE.whatsappNumber}`} label="Call Zenthos Real Estate">
              <Phone size={18} aria-hidden="true" className="text-brand" />
            </ContactAction>
            <ContactAction href={`mailto:${SITE.email}`} label="Email Zenthos Real Estate">
              <Mail size={18} aria-hidden="true" className="text-brand" />
            </ContactAction>
            <ContactAction href={generalInquiryLink()} label="Chat on WhatsApp">
              <WhatsAppIcon className="h-[19px] w-[19px] text-[#25D366]" />
            </ContactAction>
            <ContactAction
              href="https://instagram.com/zenthosrealestate"
              label="Zenthos Real Estate on Instagram"
            >
              <InstagramIcon brand className="h-[19px] w-[19px]" />
            </ContactAction>
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
            <h2 className="text-[13px] font-semibold text-white/70">Get the app</h2>
            <Link
              href="/offline"
              className="text-brand mt-4 inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-3.5 text-[12px] font-bold transition-colors hover:bg-white/90"
            >
              <Download size={14} aria-hidden="true" />
              Install app
            </Link>
          </div>
        </div>
      </div>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-[0.06em] z-10 px-4 text-center text-[16.5vw] leading-none font-black tracking-tighter whitespace-nowrap text-white/10 italic uppercase md:text-[clamp(9vw,14vw,230px)]"
      >
        Zenthos RE.
      </span>
    </footer>
  )
}
