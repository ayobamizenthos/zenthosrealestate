'use client'

import { Bell, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
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
    <div className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-50 px-4 md:bottom-6 md:left-6 md:w-96 md:px-0">
      <div className="border-hairline shadow-card-hover rounded-card border bg-white p-4">
        <div className="flex items-start gap-3">
          <span className="bg-surface text-brand flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            <Bell size={18} aria-hidden="true" />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-ink text-[15px] font-bold">Know first when we list</p>
            <p className="text-muted mt-1 text-[13px] leading-relaxed">
              Good Lagos property moves before it is advertised. Turn on alerts and every new
              listing reaches you the moment it goes up.
            </p>
          </div>

          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss notification prompt"
            className="text-muted hover:text-ink -mt-1 -mr-1 flex h-9 w-9 shrink-0 items-center justify-center"
          >
            <X size={17} aria-hidden="true" />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Button
            onClick={async () => {
              const granted = await subscribe()
              if (granted) dismiss()
            }}
            disabled={isBusy}
            fullWidth
          >
            {isBusy ? 'Enabling…' : 'Turn on alerts'}
          </Button>
          <button
            type="button"
            onClick={dismiss}
            className="text-muted hover:text-ink flex h-12 shrink-0 items-center px-3 text-[14px] font-semibold whitespace-nowrap transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  )
}
