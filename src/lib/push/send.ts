import 'server-only'

import webpush from 'web-push'
import { isPushConfigured, publicEnv, serverEnv } from '@/lib/env'
import { createSupabaseServiceClient } from '@/lib/supabase/admin'

export interface PushPayload {
  title: string
  body: string
  url: string
  tag?: string
}

let vapidConfigured = false

function configureVapid(): boolean {
  if (!isPushConfigured) return false
  if (vapidConfigured) return true

  webpush.setVapidDetails(
    serverEnv.vapidSubject,
    publicEnv.vapidPublicKey,
    serverEnv.vapidPrivateKey
  )
  vapidConfigured = true
  return true
}

interface StoredSubscription {
  id: string
  endpoint: string
  p256dh: string
  auth: string
}

// Web push providers rate limit bursts, so devices go out in batches rather
// than as one thundering herd.
const DELIVERY_BATCH_SIZE = 100

async function deliver(subscriptions: StoredSubscription[], payload: PushPayload): Promise<void> {
  if (!subscriptions.length) return

  const serialised = JSON.stringify(payload)
  const staleSubscriptionIds: string[] = []

  for (let start = 0; start < subscriptions.length; start += DELIVERY_BATCH_SIZE) {
    const batch = subscriptions.slice(start, start + DELIVERY_BATCH_SIZE)

    await Promise.all(
      batch.map(async subscription => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: { p256dh: subscription.p256dh, auth: subscription.auth },
            },
            serialised,
            { TTL: 60 * 60 * 24, urgency: 'high' }
          )
        } catch (cause) {
          const statusCode = (cause as { statusCode?: number }).statusCode
          if (statusCode === 404 || statusCode === 410) {
            staleSubscriptionIds.push(subscription.id)
          }
        }
      })
    )
  }

  if (staleSubscriptionIds.length) {
    await createSupabaseServiceClient()
      .from('push_subscriptions')
      .delete()
      .in('id', staleSubscriptionIds)
  }
}

export async function sendPushToUsers(userIds: string[], payload: PushPayload): Promise<void> {
  if (!userIds.length) return
  if (!configureVapid()) return

  const { data, error } = await createSupabaseServiceClient()
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .in('user_id', userIds)

  if (error || !data?.length) return
  await deliver(data, payload)
}

/*
  Every device that has allowed notifications, whether or not anyone ever
  registered on it. This is what carries a new listing to the whole audience.
*/
export async function sendPushToEveryone(payload: PushPayload): Promise<void> {
  if (!configureVapid()) return

  const { data, error } = await createSupabaseServiceClient()
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')

  if (error || !data?.length) return
  await deliver(data, payload)
}
