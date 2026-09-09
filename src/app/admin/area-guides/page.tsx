import clsx from 'clsx'
import type { Metadata } from 'next'
import { saveAreaGuideAction } from '@/lib/actions/area-guides'
import { requireAdmin } from '@/lib/auth'
import { PROPERTY_LOCATIONS } from '@/lib/constants'
import { listAreaGuides } from '@/lib/queries/area-guides'

export const metadata: Metadata = {
  title: 'Area guides',
  robots: { index: false, follow: false },
}

const FIELDS = [
  { name: 'headline', label: 'Headline', rows: 1, fullWidth: true },
  { name: 'overview', label: 'Overview', rows: 3, fullWidth: true },
  { name: 'estates', label: 'Estates and streets', rows: 3, fullWidth: false },
  { name: 'shopping', label: 'Shopping and markets', rows: 3, fullWidth: false },
  { name: 'landmarks', label: 'Landmarks', rows: 3, fullWidth: false },
  { name: 'getting_around', label: 'Getting around', rows: 3, fullWidth: false },
] as const

export default async function AreaGuidesPage() {
  const { supabase } = await requireAdmin()
  const guides = await listAreaGuides(supabase)

  const byLocation = new Map(guides.map(guide => [guide.location, guide]))

  return (
    <div className="space-y-6 md:space-y-8">
      <header>
        <h1 className="text-title md:text-display text-brand font-extrabold">Area guides</h1>
        <p className="text-muted mt-2 max-w-2xl text-[14px] leading-relaxed">
          Shown on every listing in the area and on the area landing page. Keep the detail concrete:
          named estates, named malls, named landmarks.
        </p>
      </header>

      <div className="space-y-3">
        {PROPERTY_LOCATIONS.map(location => {
          const guide = byLocation.get(location)

          return (
            <details
              key={location}
              className="border-hairline rounded-card overflow-hidden border bg-white"
            >
              <summary className="text-ink cursor-pointer p-4 text-[15px] font-bold md:p-5 md:text-[16px]">
                {location}
                {guide?.headline ? (
                  <span className="text-muted mt-0.5 block text-[13px] font-normal">
                    {guide.headline}
                  </span>
                ) : (
                  <span className="text-brand mt-0.5 block text-[13px] font-semibold">
                    Not written yet
                  </span>
                )}
              </summary>

              <form
                action={saveAreaGuideAction}
                className="border-hairline space-y-4 border-t p-4 md:p-5"
              >
                <input type="hidden" name="location" value={location} />

                <div className="grid gap-4 lg:grid-cols-2">
                  {FIELDS.map(field => (
                    <label
                      key={field.name}
                      className={clsx('block', field.fullWidth && 'lg:col-span-2')}
                    >
                      <span className="text-ink block text-[13px] font-semibold">
                        {field.label}
                      </span>
                      <textarea
                        name={field.name}
                        rows={field.rows}
                        defaultValue={
                          field.name === 'getting_around'
                            ? (guide?.gettingAround ?? '')
                            : ((guide?.[field.name as 'headline'] as string) ?? '')
                        }
                        className="bg-surface text-ink focus:ring-brand/30 mt-1.5 w-full rounded-lg px-3 py-2.5 text-[16px] outline-none focus:ring-2"
                      />
                    </label>
                  ))}
                </div>

                <button
                  type="submit"
                  className="bg-brand hover:bg-brand-hover rounded-control flex h-11 items-center px-5 text-[14px] font-bold text-white transition-colors"
                >
                  Save {location}
                </button>
              </form>
            </details>
          )
        })}
      </div>
    </div>
  )
}
