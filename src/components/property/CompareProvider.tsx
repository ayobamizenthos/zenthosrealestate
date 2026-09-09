'use client'

import { createContext, useCallback, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'
import { MAX_COMPARE_PROPERTIES } from '@/lib/constants'
import { createLocalStore, useLocalStore } from '@/lib/local-store'

const EMPTY_SELECTION: string[] = []

const compareStore = createLocalStore<string[]>('zenthos.compare', EMPTY_SELECTION)

interface CompareApi {
  compareIds: string[]
  isComparing: (propertyId: string) => boolean
  toggleCompare: (propertyId: string) => void
  clearCompare: () => void
  isFull: boolean
}

const CompareContext = createContext<CompareApi | null>(null)

export function CompareProvider({ children }: { children: ReactNode }) {
  const compareIds = useLocalStore(compareStore)

  const toggleCompare = useCallback((propertyId: string) => {
    compareStore.update(previous => {
      if (previous.includes(propertyId)) {
        return previous.filter(id => id !== propertyId)
      }

      if (previous.length >= MAX_COMPARE_PROPERTIES) return previous
      return [...previous, propertyId]
    })
  }, [])

  const clearCompare = useCallback(() => compareStore.set(EMPTY_SELECTION), [])

  const api = useMemo<CompareApi>(
    () => ({
      compareIds,
      isComparing: (propertyId: string) => compareIds.includes(propertyId),
      toggleCompare,
      clearCompare,
      isFull: compareIds.length >= MAX_COMPARE_PROPERTIES,
    }),
    [clearCompare, compareIds, toggleCompare]
  )

  return <CompareContext.Provider value={api}>{children}</CompareContext.Provider>
}

export function useCompare(): CompareApi {
  const context = useContext(CompareContext)
  if (!context) throw new Error('useCompare must be used inside CompareProvider')
  return context
}
