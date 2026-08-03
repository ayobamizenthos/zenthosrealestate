import { defaultCache } from '@serwist/next/worker'
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import { Serwist } from 'serwist'

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

interface ZenthosPushPayload {
  title: string
  body: string
  url: string
  tag?: string
}

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  // defaultCache is network-first for pages and cache-first for images, which
  // is exactly the split the spec asks for.
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: '/offline',
        matcher: ({ request }) => request.destination === 'document',
      },
    ],
  },
})

serwist.addEventListeners()

self.addEventListener('push', event => {
  if (!event.data) return

  let payload: ZenthosPushPayload
  try {
    payload = event.data.json() as ZenthosPushPayload
  } catch {
    payload = { title: 'Zenthos Real Estate', body: event.data.text(), url: '/' }
  }

  event.waitUntil(
    (async () => {
      await self.registration.showNotification(payload.title, {
        body: payload.body,
        icon: '/icons/icon-192.png',
        badge: '/icons/badge-72.png',
        tag: payload.tag,
        data: { url: payload.url },
      })

      // Mirrors the unread count onto the installed app icon where supported.
      if ('setAppBadge' in navigator) {
        const unread = await self.registration.getNotifications()
        await navigator.setAppBadge?.(unread.length)
      }
    })()
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const target = (event.notification.data as { url?: string } | undefined)?.url ?? '/'

  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })

      // Reuse an open tab when one exists rather than stacking new windows.
      for (const client of clientList) {
        if ('focus' in client) {
          await client.focus()
          await client.navigate(target)
          return
        }
      }

      await self.clients.openWindow(target)
    })()
  )
})
