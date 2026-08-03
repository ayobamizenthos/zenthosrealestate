import { Mail, Phone } from 'lucide-react'
import Link from 'next/link'
import { ZenthosLogo } from '@/components/brand/ZenthosLogo'
import { LOCATION_LANDING_PAGES, SITE } from '@/lib/constants'

/**
 * Curated rather than exhaustive. Listing all ten property types made the
 * footer a wall of near-identical links — these are the searches that actually
 * carry volume.
 */
const POPULAR_SEARCHES = [
  { label: 'Duplexes for sale', href: '/properties?type=Detached+Duplex' },
  { label: 'Apartments for sale', href: '/properties?type=Apartment' },
  { label: 'Serviced properties', href: '/properties?serviced=1' },
  { label: '3 bedroom homes', href: '/properties?beds=3' },
  { label: 'Under ₦100M', href: '/properties?max=100000000' },
  { label: 'Newest listings', href: '/properties?sort=newest' },
]

export function SiteFooter() {
  return (
    <footer className="border-hairline bg-surface mt-16 border-t md:mt-20">
      <div className="app-shell py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <ZenthosLogo />
            <p className="text-muted mt-4 max-w-xs text-[14px] leading-relaxed">
              Brokerage for residential property across Lagos and Abuja. Every listing is inspected
              and its documentation checked before it reaches this site.
            </p>
          </div>

          <nav aria-labelledby="footer-areas">
            <h2 id="footer-areas" className="text-ink text-[14px] font-bold">
              Popular areas
            </h2>
            <ul className="mt-3 space-y-2">
              {LOCATION_LANDING_PAGES.map(location => (
                <li key={location.slug}>
                  <Link
                    href={`/properties/${location.slug}`}
                    className="text-muted hover:text-brand text-[14px] transition-colors"
                  >
                    {location.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-searches">
            <h2 id="footer-searches" className="text-ink text-[14px] font-bold">
              Popular searches
            </h2>
            <ul className="mt-3 space-y-2">
              {POPULAR_SEARCHES.map(search => (
                <li key={search.href}>
                  <Link
                    href={search.href}
                    className="text-muted hover:text-brand text-[14px] transition-colors"
                  >
                    {search.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-ink text-[14px] font-bold">Contact</h2>
            <ul className="mt-3 space-y-2">
              <li>
                <a
                  href={`tel:+${SITE.whatsappNumber}`}
                  className="text-muted hover:text-brand flex items-center gap-2 text-[14px] transition-colors"
                >
                  <Phone size={15} aria-hidden="true" />
                  {SITE.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="text-muted hover:text-brand flex items-center gap-2 text-[14px] transition-colors"
                >
                  <Mail size={15} aria-hidden="true" />
                  {SITE.email}
                </a>
              </li>
              <li>
                <Link
                  href="/properties"
                  className="text-muted hover:text-brand text-[14px] transition-colors"
                >
                  All properties
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-hairline text-muted mt-10 flex flex-col gap-2 border-t pt-6 text-[13px] md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <p>Lagos · Abuja, Nigeria</p>
        </div>
      </div>
    </footer>
  )
}
