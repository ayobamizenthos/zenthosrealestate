'use client'

import type { User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { isSupabaseConfigured } from '@/lib/env'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

interface AuthState {
  user: User | null
  /** False until Supabase has reported the initial session. */
  isResolved: boolean
}

const AuthContext = createContext<AuthState>({ user: null, isResolved: false })

/**
 * Resolves the viewer entirely in the browser. The server layout deliberately
 * does not read cookies, which keeps every public page cacheable; the cost is a
 * brief window where personalised chrome is absent, which `isResolved` lets
 * consumers hide rather than flash.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  // Lazy initialiser rather than an effect: with no Supabase there is nothing
  // to wait for, so the state is already final on first render.
  const [state, setState] = useState<AuthState>(() => ({
    user: null,
    isResolved: !isSupabaseConfigured,
  }))

  useEffect(() => {
    if (!isSupabaseConfigured) return

    const supabase = createSupabaseBrowserClient()

    // Fires immediately with INITIAL_SESSION, then on every sign-in and
    // sign-out — including from another tab.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ user: session?.user ?? null, isResolved: true })
    })

    return () => subscription.unsubscribe()
  }, [])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  return useContext(AuthContext)
}
