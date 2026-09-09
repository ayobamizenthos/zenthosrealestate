'use client'

import { ArrowDown, ArrowUp, Star, StarOff } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect } from 'react'
import { moveFeaturedProperty, setFeatured, type FeaturedActionState } from '@/lib/actions/featured'
import { propertyCardImage } from '@/lib/cloudinary'
import { displayPriceCompact } from '@/lib/format'
import type { PropertySummary } from '@/lib/types'

const EMPTY: FeaturedActionState = {}

interface FeaturedOrderListProps {
  featured: PropertySummary[]
  candidates: PropertySummary[]
}

export function FeaturedOrderList({ featured, candidates }: FeaturedOrderListProps) {
  const router = useRouter()
  const [moveState, moveAction, movePending] = useActionState(moveFeaturedProperty, EMPTY)
  const [toggleState, toggleAction, togglePending] = useActionState(setFeatured, EMPTY)

  const savedAt = moveState.savedAt ?? toggleState.savedAt

  useEffect(() => {
    if (savedAt) router.refresh()
  }, [savedAt, router])

  const order = featured.map(property => property.id).join(',')
  const error = moveState.error ?? toggleState.error

  return (
    <div className="space-y-10">
      {error ? (
        <p className="text-danger rounded-card bg-danger/5 px-4 py-3 text-[14px]">{error}</p>
      ) : null}

      <section>
        <h2 className="text-ink text-[17px] font-bold">Homepage order</h2>
        <p className="text-muted mt-1 text-[14px]">
          These appear under &ldquo;Currently drawing the most interest&rdquo;, top to bottom. Set a
          position number or nudge a listing up and down.
        </p>

        {featured.length === 0 ? (
          <p className="text-muted border-hairline rounded-card mt-5 border bg-white p-8 text-center text-[14px]">
            Nothing is featured yet. Add a listing from the list below.
          </p>
        ) : (
          <ol className="mt-5 space-y-2">
            {featured.map((property, index) => (
              <li
                key={property.id}
                className="border-hairline rounded-card flex flex-wrap items-center gap-x-3 gap-y-2 border bg-white p-3"
              >
                <span className="bg-brand text-brand-ink flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-bold">
                  {index + 1}
                </span>

                <span className="bg-surface relative h-12 w-16 shrink-0 overflow-hidden rounded-md">
                  {property.images[0] ? (
                    <Image
                      src={propertyCardImage(property.images[0])}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : null}
                </span>

                <span className="min-w-0 flex-1 basis-40">
                  <span className="text-ink block truncate text-[14px] font-semibold">
                    {property.title}
                  </span>
                  <span className="text-muted block text-[13px]">
                    {displayPriceCompact(property.price, property.price_label)} ·{' '}
                    {property.location}
                  </span>
                </span>

                <span className="ml-auto flex shrink-0 items-center gap-1.5">
                  <form action={moveAction}>
                    <input type="hidden" name="id" value={property.id} />
                    <input type="hidden" name="order" value={order} />
                    <input type="hidden" name="position" value={index} />
                    <button
                      type="submit"
                      disabled={index === 0 || movePending}
                      aria-label={`Move ${property.title} up`}
                      className="text-ink hover:bg-surface flex h-9 w-9 items-center justify-center rounded-full transition-colors disabled:opacity-30"
                    >
                      <ArrowUp size={16} aria-hidden="true" />
                    </button>
                  </form>

                  <form action={moveAction}>
                    <input type="hidden" name="id" value={property.id} />
                    <input type="hidden" name="order" value={order} />
                    <input type="hidden" name="position" value={index + 2} />
                    <button
                      type="submit"
                      disabled={index === featured.length - 1 || movePending}
                      aria-label={`Move ${property.title} down`}
                      className="text-ink hover:bg-surface flex h-9 w-9 items-center justify-center rounded-full transition-colors disabled:opacity-30"
                    >
                      <ArrowDown size={16} aria-hidden="true" />
                    </button>
                  </form>

                  <form action={moveAction} className="flex items-center gap-1.5">
                    <input type="hidden" name="id" value={property.id} />
                    <input type="hidden" name="order" value={order} />
                    <label className="sr-only" htmlFor={`position-${property.id}`}>
                      Position for {property.title}
                    </label>
                    <input
                      id={`position-${property.id}`}
                      name="position"
                      type="number"
                      min={1}
                      max={featured.length}
                      defaultValue={index + 1}
                      className="bg-surface text-ink h-10 w-14 rounded-lg px-2 text-center text-[16px] font-semibold outline-none"
                    />
                    <button
                      type="submit"
                      disabled={movePending}
                      className="bg-ink h-9 rounded-full px-3 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      Move
                    </button>
                  </form>

                  <form action={toggleAction}>
                    <input type="hidden" name="id" value={property.id} />
                    <input type="hidden" name="featured" value="false" />
                    <button
                      type="submit"
                      disabled={togglePending}
                      aria-label={`Remove ${property.title} from the homepage`}
                      className="text-muted hover:text-danger flex h-9 w-9 items-center justify-center rounded-full transition-colors disabled:opacity-40"
                    >
                      <StarOff size={16} aria-hidden="true" />
                    </button>
                  </form>
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section>
        <h2 className="text-ink text-[17px] font-bold">Add to the homepage</h2>
        <p className="text-muted mt-1 text-[14px]">
          Published listings that are not featured yet. Adding one puts it last, then move it where
          you want.
        </p>

        {candidates.length === 0 ? (
          <p className="text-muted border-hairline rounded-card mt-5 border bg-white p-8 text-center text-[14px]">
            Every published listing is already featured.
          </p>
        ) : (
          <ul className="mt-5 space-y-2">
            {candidates.map(property => (
              <li
                key={property.id}
                className="border-hairline rounded-card flex items-center gap-3 border bg-white p-3"
              >
                <span className="bg-surface relative h-12 w-16 shrink-0 overflow-hidden rounded-md">
                  {property.images[0] ? (
                    <Image
                      src={propertyCardImage(property.images[0])}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : null}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="text-ink block truncate text-[14px] font-semibold">
                    {property.title}
                  </span>
                  <span className="text-muted block text-[13px]">
                    {displayPriceCompact(property.price, property.price_label)} ·{' '}
                    {property.location}
                  </span>
                </span>

                <form action={toggleAction} className="shrink-0">
                  <input type="hidden" name="id" value={property.id} />
                  <input type="hidden" name="featured" value="true" />
                  <button
                    type="submit"
                    disabled={togglePending}
                    className="bg-brand hover:bg-brand-hover flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold text-white transition-colors disabled:opacity-50"
                  >
                    <Star size={14} aria-hidden="true" />
                    Feature
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
