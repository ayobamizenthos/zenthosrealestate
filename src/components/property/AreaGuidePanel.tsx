import { Building2, Compass, Landmark, Route, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import type { AreaGuide } from '@/lib/queries/area-guides'

const SECTIONS = [
  { key: 'estates', label: 'Estates and streets', Icon: Building2 },
  { key: 'shopping', label: 'Shopping and markets', Icon: ShoppingBag },
  { key: 'landmarks', label: 'Landmarks', Icon: Landmark },
  { key: 'gettingAround', label: 'Getting around', Icon: Route },
] as const

export function AreaGuidePanel({ guide, slug }: { guide: AreaGuide; slug?: string }) {
  const entries = SECTIONS.map(section => ({ ...section, body: guide[section.key] })).filter(
    section => section.body.trim().length > 0
  )

  return (
    <section className="bg-surface rounded-card p-5 md:p-7">
      <div className="flex items-start gap-2.5">
        <Compass size={19} className="text-brand mt-0.5 shrink-0" aria-hidden="true" />
        <div className="min-w-0">
          <h2 className="text-ink text-[17px] font-bold md:text-[19px]">
            Area guide: {guide.location}
          </h2>
          {guide.headline ? (
            <p className="text-brand mt-1 text-[14px] font-semibold">{guide.headline}</p>
          ) : null}
        </div>
      </div>

      {guide.overview ? (
        <p className="text-ink mt-5 text-[15px] leading-relaxed">{guide.overview}</p>
      ) : null}

      {entries.length > 0 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {entries.map(({ key, label, Icon, body }) => (
            <div key={key} className="rounded-card bg-white p-5">
              <h3 className="text-ink flex items-center gap-2 text-[14px] font-bold">
                <Icon size={15} className="text-brand shrink-0" aria-hidden="true" />
                {label}
              </h3>
              <p className="text-muted mt-2 text-[14px] leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      ) : null}

      {slug ? (
        <Link
          href={`/properties/${slug}`}
          className="text-ink hover:text-brand mt-6 inline-flex text-[14px] font-semibold underline underline-offset-4 transition-colors"
        >
          See every property in {guide.location}
        </Link>
      ) : null}
    </section>
  )
}
