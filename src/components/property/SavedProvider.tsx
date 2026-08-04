'use client'

import { createContext, useCallback, useContext, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { createLocalStore, useLocalStore } from '@/lib/local-store'
import { getSavedPropertyIds, saveProperty, unsaveProperty } from '@/lib/queries/saved'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

interface SavedPropertiesApi {
  savedIds: readonly string[]
  savedCount: number
  isSaved: (propertyId: string) => boolean
  toggleSaved: (propertyId: string) => Promise<void>
}

const SavedPropertiesContext = createContext<SavedPropertiesApi | null>(null)

const savedStore = createLocalStore<string[]>('zenthos.saved-properties', [])

export function SavedProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const savedIds = useLocalStore(savedStore)

  useEffect(() => {
    if (!user) return

    let cancelled = false

    getSavedPropertyIds(createSupabaseBrowserClient(), user.id)
      .then(remote => {
        if (cancelled || remote.length === 0) return
        savedStore.update(current => [...new Set([...current, ...remote])])
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [user])

  const toggleSaved = useCallback(
    async (propertyId: string) => {
      const wasSaved = savedStore.getSnapshot().includes(propertyId)

      savedStore.update(current =>
        wasSaved ? current.filter(id => id !== propertyId) : [...current, propertyId]
      )

      if (!user) return

      try {
        const supabase = createSupabaseBrowserClient()
        if (wasSaved) await unsaveProperty(supabase, user.id, propertyId)
        else await saveProperty(supabase, user.id, propertyId)
      } catch {
        return
      }
    },
    [user]
  )

  const api = useMemo<SavedPropertiesApi>(
    () => ({
      savedIds,
      savedCount: savedIds.length,
      isSaved: (propertyId: string) => savedIds.includes(propertyId),
      toggleSaved,
    }),
    [savedIds, toggleSaved]
  )

  return <SavedPropertiesContext.Provider value={api}>{children}</SavedPropertiesContext.Provider>
}

export function useSavedProperties(): SavedPropertiesApi {
  const context = useContext(SavedPropertiesContext)
  if (!context) throw new Error('useSavedProperties must be used inside SavedProvider')
  return context
}
