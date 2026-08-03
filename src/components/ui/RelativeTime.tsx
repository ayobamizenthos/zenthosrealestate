'use client'

import { formatDate, formatRelativeTime } from '@/lib/format'
import { useIsClient } from '@/lib/local-store'

/**
 * "2 days ago" is computed from the current clock, so rendering it on the server
 * and again on the client produces two different strings and a hydration
 * mismatch. The absolute date is deterministic, so it goes out in the HTML and
 * is upgraded to the relative phrasing once mounted.
 */
export function RelativeTime({ iso, className }: { iso: string; className?: string }) {
  const isClient = useIsClient()

  return (
    <time dateTime={iso} className={className}>
      {isClient ? formatRelativeTime(iso) : formatDate(iso)}
    </time>
  )
}
