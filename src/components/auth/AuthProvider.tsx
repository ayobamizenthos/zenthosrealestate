'use client'

import type { User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { isSupabaseConfigured } from '@/lib/env'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

interface AuthState {
  user: User | null

  isResolved: boolean
}

const AuthContext = createContext<AuthState>({ user: null, isResolved: false })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => ({
    user: null,
    isResolved: !isSupabaseConfigured,
  }))

  useEffect(() => {
    if (!isSupabaseConfigured) return

    const supabase = createSupabaseBrowserClient()

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
