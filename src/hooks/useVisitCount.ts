'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { createLocalStore, useLocalStore } from '@/lib/local-store'

const visitStore = createLocalStore<number>('zenthos.page-views', 0)

/**
 * Module-scoped so several components calling this hook on the same route do
 * not each add a view. Resets naturally on a full page load.
 */
let lastCountedPath: string | null = null

/**
 * Counts route views across sessions. The install and notification prompts both
 * wait for a repeat visit — asking on first contact is how you get denied.
 */
export function useVisitCount(): number {
  const pathname = usePathname()
  const visitCount = useLocalStore(visitStore)

  useEffect(() => {
    if (lastCountedPath === pathname) return
    lastCountedPath = pathname
    visitStore.update(current => current + 1)
  }, [pathname])

  return visitCount
}
