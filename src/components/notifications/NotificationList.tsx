'use client'

import { Bell, House, Tag, TriangleAlert } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { ButtonLink } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatRelativeTime } from '@/lib/format'
import { markNotificationsRead } from '@/lib/queries/notifications'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { AppNotification, NotificationKind } from '@/lib/types'

const KIND_ICONS: Record<NotificationKind, typeof Bell> = {
  new_property: House,
  price_drop: Tag,
  status_change: TriangleAlert,
  new_inquiry: Bell,
  inquiry_updated: Bell,
}

export function NotificationList({
  notifications,
  userId,
}: {
  notifications: AppNotification[]
  userId: string
}) {
  const router = useRouter()
  const hasMarkedRead = useRef(false)

  useEffect(() => {
    if (hasMarkedRead.current) return
    if (!notifications.some(notification => !notification.read)) return

    hasMarkedRead.current = true

    markNotificationsRead(createSupabaseBrowserClient(), userId)
      .then(() => {
        void navigator.clearAppBadge?.()
        router.refresh()
      })
      .catch(() => {
        hasMarkedRead.current = false
      })
  }, [notifications, router, userId])

  if (!notifications.length) {
    return (
      <EmptyState
        illustration={<Bell size={56} strokeWidth={1.5} aria-hidden="true" />}
        title="No notifications yet"
        description="Save a property and we'll let you know when its price or availability changes."
        action={<ButtonLink href="/properties">Browse properties</ButtonLink>}
      />
    )
  }

  return (
    <ul className="border-hairline divide-hairline divide-y overflow-hidden rounded-card border">
      {notifications.map(notification => {
        const Icon = KIND_ICONS[notification.kind] ?? Bell

        return (
          <li key={notification.id}>
            <Link
              href={notification.url}
              className="hover:bg-surface flex items-start gap-3 bg-white p-4 transition-colors"
            >
              <span className="bg-surface text-brand flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                <Icon size={17} aria-hidden="true" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="text-ink block text-[15px] font-semibold">
                  {notification.title}
                </span>
                <span className="text-muted mt-0.5 block text-[14px] leading-relaxed">
                  {notification.body}
                </span>
                <span className="text-muted mt-1 block text-[12px]">
                  {formatRelativeTime(notification.created_at)}
                </span>
              </span>

              {!notification.read ? (
                <span className="bg-brand mt-2 h-2 w-2 shrink-0 rounded-full" aria-label="Unread" />
              ) : null}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
