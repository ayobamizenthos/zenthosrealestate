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

/**
 * Pushes a payload to every device belonging to the given users. Endpoints that
 * the push service has retired (404/410) are pruned so the table does not grow
 * a tail of dead subscriptions.
 */
export async function sendPushToUsers(userIds: string[], payload: PushPayload): Promise<void> {
  if (!userIds.length) return
  if (!configureVapid()) return

  const supabase = createSupabaseServiceClient()
  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .in('user_id', userIds)

  if (error || !subscriptions?.length) return

  const serialised = JSON.stringify(payload)
  const staleSubscriptionIds: string[] = []

  await Promise.all(
    subscriptions.map(async subscription => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          serialised
        )
      } catch (cause) {
        const statusCode = (cause as { statusCode?: number }).statusCode
        if (statusCode === 404 || statusCode === 410) {
          staleSubscriptionIds.push(subscription.id)
        }
      }
    })
  )

  if (staleSubscriptionIds.length) {
    await supabase.from('push_subscriptions').delete().in('id', staleSubscriptionIds)
  }
}
