'use client'

import { useCallback, useEffect, useState } from 'react'
import { publicEnv } from '@/lib/env'

export type PushPermissionState = 'unsupported' | 'default' | 'granted' | 'denied'

/**
 * VAPID keys travel as base64url but the Push API wants raw bytes. The buffer
 * is allocated explicitly so the result is a `Uint8Array<ArrayBuffer>` — the
 * only view type `applicationServerKey` accepts.
 */
function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
  const normalised = padded.replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(normalised)

  const output = new Uint8Array(new ArrayBuffer(raw.length))
  for (let index = 0; index < raw.length; index += 1) {
    output[index] = raw.charCodeAt(index)
  }
  return output
}

export function usePushSubscription() {
  const [permission, setPermission] = useState<PushPermissionState>('unsupported')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isBusy, setIsBusy] = useState(false)

  useEffect(() => {
    // 'unsupported' is already the initial value, so an unsupported browser
    // needs no state write at all — which keeps this effect free of the
    // synchronous setState that triggers cascading renders.
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

    void navigator.serviceWorker.ready.then(async registration => {
      setPermission(Notification.permission as PushPermissionState)
      const existing = await registration.pushManager.getSubscription()
      setIsSubscribed(Boolean(existing))
    })
  }, [])

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!publicEnv.vapidPublicKey) return false

    setIsBusy(true)
    try {
      const outcome = await Notification.requestPermission()
      setPermission(outcome as PushPermissionState)
      if (outcome !== 'granted') return false

      const registration = await navigator.serviceWorker.ready
      const subscription =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicEnv.vapidPublicKey),
        }))

      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON()),
      })

      if (!response.ok) return false

      setIsSubscribed(true)
      return true
    } catch {
      return false
    } finally {
      setIsBusy(false)
    }
  }, [])

  const unsubscribe = useCallback(async (): Promise<void> => {
    setIsBusy(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (!subscription) {
        setIsSubscribed(false)
        return
      }

      await fetch('/api/push/subscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      })
      await subscription.unsubscribe()
      setIsSubscribed(false)
    } catch {
      // Leave the flag as-is; the next mount re-reads the real state.
    } finally {
      setIsBusy(false)
    }
  }, [])

  return { permission, isSubscribed, isBusy, subscribe, unsubscribe }
}
