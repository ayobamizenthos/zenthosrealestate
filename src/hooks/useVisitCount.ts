'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { createLocalStore, useLocalStore } from '@/lib/local-store'

const visitStore = createLocalStore<number>('zenthos.page-views', 0)

let lastCountedPath: string | null = null

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
