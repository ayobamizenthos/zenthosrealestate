'use client'

import clsx from 'clsx'
import { Check, Scale } from 'lucide-react'
import { MAX_COMPARE_PROPERTIES } from '@/lib/constants'
import { useCompare } from './CompareProvider'

export function CompareButton({
  propertyId,
  propertyTitle,
}: {
  propertyId: string
  propertyTitle: string
}) {
  const { isComparing, toggleCompare, isFull } = useCompare()
  const selected = isComparing(propertyId)
  const disabled = !selected && isFull

  return (
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
        'flex h-11 items-center justify-center gap-2 rounded-control px-4 text-[14px] font-semibold transition-colors',
        selected ? 'bg-brand text-brand-ink' : 'text-ink hover:border-brand border bg-white',
        disabled && 'cursor-not-allowed opacity-40'
      )}
    >
      {selected ? <Check size={16} aria-hidden="true" /> : <Scale size={16} aria-hidden="true" />}
      {selected ? 'Comparing' : 'Compare'}
    </button>
  )
}
