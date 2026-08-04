'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { countUnreadNotifications } from '@/lib/queries/notifications'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export function useUnreadNotificationCount(): number {
  const { user } = useAuth()
  const [loadedCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) return

    const supabase = createSupabaseBrowserClient()
    let cancelled = false

    const refresh = () => {
      countUnreadNotifications(supabase, user.id)
        .then(count => {
          if (!cancelled) setUnreadCount(count)
        })
        .catch(() => undefined)
    }

    refresh()

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        refresh
      )
      .subscribe()

    return () => {
      cancelled = true
      void supabase.removeChannel(channel)
    }
  }, [user])

  return user ? loadedCount : 0
}
