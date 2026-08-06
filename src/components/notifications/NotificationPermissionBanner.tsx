'use client'

import { Bell, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { usePushSubscription } from '@/hooks/usePushSubscription'
import { createPromptDismissal } from '@/lib/local-store'

const REPROMPT_AFTER_MS = 14 * 24 * 60 * 60 * 1000

// Long enough that the visitor has seen the page and short enough that a single
// session still converts. Asking on first paint gets dismissed reflexively.
const PROMPT_DELAY_MS = 9000

const pushPrompt = createPromptDismissal('zenthos.push-prompt-dismissed-at', REPROMPT_AFTER_MS)

/*
  Every visitor is asked, signed in or not. A subscription belongs to the device,
  so a first-time visitor who allows notifications hears about new listings from
  then on whether or not they ever open the site again.
*/
export function NotificationPermissionBanner() {
  const isSuppressed = pushPrompt.useIsSuppressed()
  const { permission, isSubscribed, isBusy, subscribe } = usePushSubscription()
  const [hasWaited, setHasWaited] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setHasWaited(true), PROMPT_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [])

  const dismiss = () => pushPrompt.dismiss()

  const shouldShow = hasWaited && !isSuppressed && permission === 'default' && !isSubscribed

  if (!shouldShow) return null

  return (
    <div className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-50 px-3 md:bottom-6 md:left-6 md:w-80 md:px-0">
      <div className="border-hairline shadow-card-hover rounded-card border bg-white px-3.5 py-3">
        <div className="flex items-start gap-2.5">
          <Bell size={16} aria-hidden="true" className="text-brand mt-0.5 shrink-0" />

          <div className="min-w-0 flex-1">
            <p className="text-ink text-[14px] font-bold">Know first when we list</p>
            <p className="text-muted mt-0.5 text-[12.5px] leading-snug">
              Every new listing, the moment it goes up.
            </p>
          </div>

          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss notification prompt"
            className="text-muted hover:text-ink -mt-1.5 -mr-2 flex h-9 w-9 shrink-0 items-center justify-center"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="mt-2.5 flex items-center gap-2 pl-[26px]">
          <button
            type="button"
            onClick={async () => {
              const granted = await subscribe()
              if (granted) dismiss()
            }}
            disabled={isBusy}
            className="bg-brand hover:bg-brand-hover rounded-pill flex h-9 items-center px-4 text-[13px] font-bold text-white transition-colors disabled:opacity-60"
          >
            {isBusy ? 'Enabling…' : 'Turn on alerts'}
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="text-muted hover:text-ink flex h-9 shrink-0 items-center px-2 text-[13px] font-semibold whitespace-nowrap transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  )
}
