'use client'

import clsx from 'clsx'
import { ArrowRight, Check, Scale } from 'lucide-react'
import Link from 'next/link'
import { MAX_COMPARE_PROPERTIES } from '@/lib/constants'
import { useCompare } from './CompareProvider'

/*
  Adding to a comparison used to have no visible consequence: the label changed
  and nothing else. The link below it is what tells you where the shortlist went.
*/
export function CompareButton({
  propertyId,
  propertyTitle,
}: {
  propertyId: string
  propertyTitle: string
}) {
  const { compareIds, isComparing, toggleCompare, isFull } = useCompare()
  const selected = isComparing(propertyId)
  const disabled = !selected && isFull

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={() => toggleCompare(propertyId)}
        disabled={disabled}
        aria-pressed={selected}
        aria-label={
          disabled
            ? `Comparison is full at ${MAX_COMPARE_PROPERTIES} properties`
            : selected
              ? `Remove ${propertyTitle} from comparison`
              : `Add ${propertyTitle} to comparison`
        }
        className={clsx(
          'rounded-control flex h-11 items-center justify-center gap-2 px-4 text-[14px] font-semibold transition-colors',
          selected ? 'bg-brand text-brand-ink' : 'text-ink bg-surface hover:bg-hairline',
          disabled && 'cursor-not-allowed opacity-40'
        )}
      >
        {selected ? <Check size={16} aria-hidden="true" /> : <Scale size={16} aria-hidden="true" />}
        {selected ? 'Added to compare' : 'Compare'}
      </button>

      {compareIds.length > 0 ? (
        <Link
          href="/compare"
          className="text-brand inline-flex min-h-9 items-center justify-center gap-1.5 text-[13px] font-semibold"
        >
          View comparison ({compareIds.length})
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  )
}
