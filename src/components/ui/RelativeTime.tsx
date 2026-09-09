'use client'

import { formatDate, formatRelativeTime } from '@/lib/format'
import { useIsClient } from '@/lib/local-store'

export function RelativeTime({ iso, className }: { iso: string; className?: string }) {
  const isClient = useIsClient()

  return (
    <time dateTime={iso} className={className}>
      {isClient ? formatRelativeTime(iso) : formatDate(iso)}
    </time>
  )
}
