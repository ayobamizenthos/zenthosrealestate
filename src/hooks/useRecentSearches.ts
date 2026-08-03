'use client'

import { useCallback } from 'react'
import { createLocalStore, useLocalStore } from '@/lib/local-store'

const MAX_ENTRIES = 5
const EMPTY: string[] = []

/** Recent searches stay on the device — they are never sent to the server. */
const recentSearchStore = createLocalStore<string[]>('zenthos.recent-searches', EMPTY)

export function useRecentSearches() {
  const recentSearches = useLocalStore(recentSearchStore)

  const remember = useCallback((term: string) => {
    const trimmed = term.trim()
    if (!trimmed) return

    recentSearchStore.update(previous =>
      [trimmed, ...previous.filter(entry => entry !== trimmed)].slice(0, MAX_ENTRIES)
    )
  }, [])

  const clear = useCallback(() => recentSearchStore.set(EMPTY), [])

  return { recentSearches, remember, clear }
}
