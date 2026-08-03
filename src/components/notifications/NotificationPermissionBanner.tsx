'use client'

import { Bell, X } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { Button } from '@/components/ui/Button'
import { usePushSubscription } from '@/hooks/usePushSubscription'
import { useVisitCount } from '@/hooks/useVisitCount'
import { createPromptDismissal } from '@/lib/local-store'

const REPROMPT_AFTER_MS = 14 * 24 * 60 * 60 * 1000
// Deliberately later than the install banner's threshold so the two prompts
// never occupy the same corner on the same visit.
const MIN_VISITS = 4

const pushPrompt = createPromptDismissal('zenthos.push-prompt-dismissed-at', REPROMPT_AFTER_MS)

/**
 * A styled in-app banner rather than firing the browser permission dialog on
 * load — an unexplained prompt gets denied, and a denial is permanent.
 */
export function NotificationPermissionBanner() {
  const { user } = useAuth()
  const visitCount = useVisitCount()
  const isSuppressed = pushPrompt.useIsSuppressed()
  const { permission, isSubscribed, isBusy, subscribe } = usePushSubscription()

  const dismiss = () => pushPrompt.dismiss()

  const shouldShow =
    Boolean(user) &&
    !isSuppressed &&
    visitCount >= MIN_VISITS &&
    permission === 'default' &&
    !isSubscribed

  if (!shouldShow) return null

  return (
    <div className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-50 px-4 md:bottom-6 md:left-6 md:w-96 md:px-0">
      <div className="border-hairline shadow-card-hover rounded-card border bg-white p-4">
        <div className="flex items-start gap-3">
          <span className="bg-surface text-brand flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            <Bell size={18} aria-hidden="true" />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-ink text-[15px] font-bold">Get price alerts</p>
            <p className="text-muted mt-1 text-[13px] leading-relaxed">
              We&rsquo;ll tell you when a saved property drops in price or a new listing lands in an
              area you follow.
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

        <div className="mt-3 flex gap-2">
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
          <Button onClick={dismiss} variant="ghost">
            Not now
          </Button>
        </div>
      </div>
    </div>
  )
}
