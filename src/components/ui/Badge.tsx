import type { ReactNode } from 'react'

export function LocationBadge({ children }: { children: ReactNode }) {
  return (
    <span className="bg-brand text-brand-ink rounded-pill px-2.5 py-1 text-[12px] leading-none font-semibold">
      {children}
    </span>
  )
}

export function MetaPill({ children }: { children: ReactNode }) {
  return (
    <span className="text-ink rounded-pill border bg-white px-3 py-1.5 text-[13px] font-medium">
      {children}
    </span>
  )
}
