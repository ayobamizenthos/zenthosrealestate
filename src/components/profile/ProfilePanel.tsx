'use client'

import clsx from 'clsx'
import { Bell, Bookmark, LogOut, Scale, Settings } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { usePushSubscription } from '@/hooks/usePushSubscription'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

interface ProfilePanelProps {
  fullName: string
  email: string
  phone: string | null
  isAdmin: boolean
}

export function ProfilePanel({ fullName, email, phone, isAdmin }: ProfilePanelProps) {
  const router = useRouter()
  const { permission, isSubscribed, isBusy, subscribe, unsubscribe } = usePushSubscription()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const signOut = async () => {
    setIsSigningOut(true)
    await createSupabaseBrowserClient().auth.signOut()
    router.replace('/')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <section className="border-hairline rounded-card border bg-white p-5">
        <p className="text-ink text-[17px] font-bold">{fullName || 'Your account'}</p>
        <p className="text-muted mt-1 text-[14px]">{email}</p>
        {phone ? <p className="text-muted text-[14px]">{phone}</p> : null}
      </section>

      <nav className="border-hairline divide-hairline overflow-hidden rounded-card border divide-y">
        <Link
          href="/saved"
          className="hover:bg-surface flex items-center gap-3 bg-white p-4 transition-colors"
        >
          <Bookmark size={18} className="text-brand" fill="currentColor" aria-hidden="true" />
          <span className="text-ink flex-1 text-[15px] font-semibold">Saved properties</span>
        </Link>

        <Link
          href="/compare"
          className="hover:bg-surface flex items-center gap-3 bg-white p-4 transition-colors"
        >
          <Scale size={18} className="text-brand" aria-hidden="true" />
          <span className="text-ink flex-1 text-[15px] font-semibold">Compare</span>
        </Link>

        <Link
          href="/notifications"
          className="hover:bg-surface flex items-center gap-3 bg-white p-4 transition-colors"
        >
          <Bell size={18} className="text-brand" aria-hidden="true" />
          <span className="text-ink flex-1 text-[15px] font-semibold">Notifications</span>
        </Link>

        {isAdmin ? (
          <Link
            href="/admin"
            className="hover:bg-surface flex items-center gap-3 bg-white p-4 transition-colors"
          >
            <Settings size={18} className="text-brand" aria-hidden="true" />
            <span className="text-ink flex-1 text-[15px] font-semibold">Admin dashboard</span>
          </Link>
        ) : null}
      </nav>

      <section className="border-hairline rounded-card border bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-ink text-[15px] font-bold">Push alerts</p>
            <p className="text-muted mt-1 text-[13px] leading-relaxed">
              {permission === 'unsupported'
                ? 'This browser does not support push notifications. On iPhone, add Zenthos to your Home Screen first.'
                : permission === 'denied'
                  ? 'Notifications are blocked in your browser settings for this site.'
                  : 'Price drops, status changes and new listings in areas you follow.'}
            </p>
          </div>

          {permission !== 'unsupported' && permission !== 'denied' ? (
            <button
              type="button"
              role="switch"
              aria-checked={isSubscribed}
              aria-label="Push alerts"
              disabled={isBusy}
              onClick={() => void (isSubscribed ? unsubscribe() : subscribe())}
              className={clsx(
                'relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50',
                isSubscribed ? 'bg-brand' : 'bg-hairline'
              )}
            >
              <span
                className={clsx(
                  'absolute top-1 h-5 w-5 rounded-full bg-white transition-transform',
                  isSubscribed ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          ) : null}
        </div>
      </section>

      <button
        type="button"
        onClick={() => void signOut()}
        disabled={isSigningOut}
        className="border-hairline text-danger hover:border-danger rounded-card flex h-12 w-full items-center justify-center gap-2 border bg-white text-[15px] font-semibold transition-colors disabled:opacity-60"
      >
        <LogOut size={17} aria-hidden="true" />
        {isSigningOut ? 'Signing out…' : 'Sign out'}
      </button>
    </div>
  )
}
