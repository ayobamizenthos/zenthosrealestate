'use client'

import { useRouter } from 'next/navigation'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { getSavedPropertyIds, saveProperty, unsaveProperty } from '@/lib/queries/saved'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

interface SavedPropertiesApi {
  savedIds: ReadonlySet<string>
  isSaved: (propertyId: string) => boolean
  toggleSaved: (propertyId: string) => Promise<void>
}

const SavedPropertiesContext = createContext<SavedPropertiesApi | null>(null)

const NO_IDS: ReadonlySet<string> = new Set()

export function SavedProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const router = useRouter()
  const [loadedIds, setSavedIds] = useState<ReadonlySet<string>>(NO_IDS)

  // Derived, so signing out clears the hearts without a setState in an effect.
  const savedIds = user ? loadedIds : NO_IDS

  // Loaded client-side so the server layout never has to read auth cookies.
  useEffect(() => {
    if (!user) return

    let cancelled = false

    getSavedPropertyIds(createSupabaseBrowserClient(), user.id)
      .then(ids => {
        if (!cancelled) setSavedIds(new Set(ids))
      })
      .catch(() => {
        if (!cancelled) setSavedIds(NO_IDS)
      })

    return () => {
      cancelled = true
    }
  }, [user])

  const toggleSaved = useCallback(
    async (propertyId: string) => {
      if (!user) {
        router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`)
        return
      }

      const wasSaved = savedIds.has(propertyId)

      // Flip immediately so the heart animation is not gated on the network.
      setSavedIds(previous => {
        const next = new Set(previous)
        if (wasSaved) next.delete(propertyId)
        else next.add(propertyId)
        return next
      })

      try {
        const supabase = createSupabaseBrowserClient()
        if (wasSaved) await unsaveProperty(supabase, user.id, propertyId)
        else await saveProperty(supabase, user.id, propertyId)
      } catch {
        setSavedIds(previous => {
          const next = new Set(previous)
          if (wasSaved) next.add(propertyId)
          else next.delete(propertyId)
          return next
        })
      }
    },
    [router, savedIds, user]
  )

  const api = useMemo<SavedPropertiesApi>(
    () => ({
      savedIds,
      isSaved: (propertyId: string) => savedIds.has(propertyId),
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
