import 'server-only'

import { displayPriceCompact } from '@/lib/format'
import { createSupabaseServiceClient } from '@/lib/supabase/admin'
import type { NotificationKind, Property } from '@/lib/types'
import { sendPushToUsers, type PushPayload } from './send'

/**
 * Every notification does two things: write a durable row for the in-app bell,
 * then attempt a push. Push failure must never lose the in-app record, so the
 * insert always happens first.
 */
async function fanOut(
  userIds: string[],
  kind: NotificationKind,
  payload: PushPayload
): Promise<void> {
  const recipients = [...new Set(userIds)].filter(Boolean)
  if (!recipients.length) return

  const supabase = createSupabaseServiceClient()

  await supabase.from('notifications').insert(
    recipients.map(userId => ({
      user_id: userId,
      kind,
      title: payload.title,
      body: payload.body,
      url: payload.url,
    }))
  )

  await sendPushToUsers(recipients, payload)
}

async function usersFollowingLocation(location: string): Promise<string[]> {
  const supabase = createSupabaseServiceClient()
  const { data, error } = await supabase.rpc('users_following_location', {
    target_location: location,
  })

  if (error) return []
  return (data ?? []).map(row => row.user_id)
}

async function usersWhoSaved(propertyId: string): Promise<string[]> {
  const supabase = createSupabaseServiceClient()
  const { data, error } = await supabase
    .from('saved_properties')
    .select('user_id')
    .eq('property_id', propertyId)

  if (error) return []
  return (data ?? []).map(row => row.user_id)
}

async function adminUserIds(): Promise<string[]> {
  const supabase = createSupabaseServiceClient()
  const { data, error } = await supabase.from('admin_users').select('user_id')

  if (error) return []
  return (data ?? []).map(row => row.user_id)
}

export async function notifyNewProperty(property: Property): Promise<void> {
  const audience = await usersFollowingLocation(property.location)

  await fanOut(audience, 'new_property', {
    title: `New property in ${property.location}`,
    body: `${property.title} at ${displayPriceCompact(property.price, property.price_label)}`,
    url: `/properties/${property.slug}`,
    tag: `new-property-${property.id}`,
  })
}

export async function notifyPriceDrop(property: Property, previousPrice: number): Promise<void> {
  const audience = await usersWhoSaved(property.id)

  await fanOut(audience, 'price_drop', {
    title: 'Price drop',
    body: `${property.title} is now ${displayPriceCompact(property.price, property.price_label)}, down from ${displayPriceCompact(previousPrice, null)}`,
    url: `/properties/${property.slug}`,
    tag: `price-${property.id}`,
  })
}

export async function notifyStatusChange(property: Property): Promise<void> {
  const audience = await usersWhoSaved(property.id)

  await fanOut(audience, 'status_change', {
    title: `${property.title} is now ${property.status.toLowerCase()}`,
    body:
      property.status === 'Sold'
        ? 'This property has been sold. Similar listings are still available.'
        : `The status changed to ${property.status}.`,
    url: `/properties/${property.slug}`,
    tag: `status-${property.id}`,
  })
}

export async function notifyNewInquiry(inquiry: {
  id: string
  name: string
  propertyTitle: string | null
}): Promise<void> {
  const audience = await adminUserIds()

  await fanOut(audience, 'new_inquiry', {
    title: 'New inquiry',
    body: `${inquiry.name} asked about ${inquiry.propertyTitle ?? 'a property'}`,
    url: '/admin/inquiries',
    tag: `inquiry-${inquiry.id}`,
  })
}

export async function notifyInquiryUpdated(inquiry: {
  userId: string | null
  propertyTitle: string | null
  propertySlug: string | null
}): Promise<void> {
  if (!inquiry.userId) return

  await fanOut([inquiry.userId], 'inquiry_updated', {
    title: 'Your inquiry was reviewed',
    body: `We have picked up your enquiry about ${inquiry.propertyTitle ?? 'a property'}.`,
    url: inquiry.propertySlug ? `/properties/${inquiry.propertySlug}` : '/notifications',
  })
}
