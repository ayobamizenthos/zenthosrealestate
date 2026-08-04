import clsx from 'clsx'
import type { ReactNode } from 'react'
import type { PropertyStatus } from '@/lib/constants'

export function LocationBadge({ children }: { children: ReactNode }) {
  return (
    <span className="bg-brand text-brand-ink rounded-pill px-2.5 py-1 text-[12px] leading-none font-semibold">
      {children}
    </span>
  )
}

const STATUS_CLASSES: Record<PropertyStatus, string> = {
  Available: 'bg-success text-white',
  Reserved: 'bg-ink text-white',
  Sold: 'bg-danger text-white',
}

export function StatusBadge({ status }: { status: PropertyStatus }) {
  if (status === 'Available') return null

  return (
    <span
      className={clsx(
        'rounded-pill px-2.5 py-1 text-[12px] leading-none font-semibold uppercase',
        STATUS_CLASSES[status]
      )}
    >
      {status}
    </span>
  )
}

export function MetaPill({ children }: { children: ReactNode }) {
  return (
    <span className="border-hairline text-ink rounded-pill border bg-white px-3 py-1.5 text-[13px] font-medium">
      {children}
    </span>
  )
}
