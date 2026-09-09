'use client'

import { useCallback, useEffect, useState } from 'react'
import { publicEnv } from '@/lib/env'

export type PushPermissionState = 'unsupported' | 'default' | 'granted' | 'denied'

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
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

    let cancelled = false

    /*
      Permission is resolved before the worker finishes installing. Gating it on
      `serviceWorker.ready` hid the prompt for the whole of a first visit, which
      is the visit most likely to convert.
    */
    const sync = async () => {
      let status: PermissionStatus | null = null

      try {
        status = await navigator.permissions.query({ name: 'notifications' as PermissionName })
      } catch {
        // Safari does not expose notifications through the Permissions API.
        await Promise.resolve()
      }

      const read = (): PushPermissionState =>
        status ? (status.state === 'prompt' ? 'default' : status.state) : Notification.permission

      if (cancelled) return
      setPermission(read())

      // Granting through the browser's own UI should retire the prompt too.
      status?.addEventListener('change', () => {
        if (!cancelled) setPermission(read())
      })

      const registration = await navigator.serviceWorker.ready
      const existing = await registration.pushManager.getSubscription()
      if (!cancelled) setIsSubscribed(Boolean(existing))
    }

    void sync()

    return () => {
      cancelled = true
    }
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
    } finally {
      setIsBusy(false)
    }
  }, [])

  return { permission, isSubscribed, isBusy, subscribe, unsubscribe }
}
