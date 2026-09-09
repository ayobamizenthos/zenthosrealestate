'use client'

import { Share2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ZenthosLogo } from '@/components/brand/ZenthosLogo'
import { useVisitCount } from '@/hooks/useVisitCount'
import { createPromptDismissal, useIsClient } from '@/lib/local-store'
import { claimPromptSlot, releasePromptSlot } from '@/lib/prompt-slot'

const REPROMPT_AFTER_MS = 7 * 24 * 60 * 60 * 1000
const MIN_VISITS = 2

const installPrompt = createPromptDismissal('zenthos.install-dismissed-at', REPROMPT_AFTER_MS)

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isIosSafari(): boolean {
  const ua = window.navigator.userAgent
  return /iPad|iPhone|iPod/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export function InstallBanner() {
  const isClient = useIsClient()
  const visitCount = useVisitCount()
  const isSuppressed = installPrompt.useIsSuppressed()
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const captureInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallEvent(event as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', captureInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', captureInstallPrompt)
  }, [])

  // Safe to read the window on this render: useIsClient is false through
  // hydration, so these only run once the markup has already matched.
  const showIosHint = isClient && isIosSafari()

  const isVisible =
    isClient &&
    !isSuppressed &&
    !isStandalone() &&
    visitCount >= MIN_VISITS &&
    (Boolean(installEvent) || showIosHint)

  useEffect(() => {
    if (!isVisible) return
    claimPromptSlot('install')
    return () => releasePromptSlot('install')
  }, [isVisible])

  if (!isVisible) return null

  const dismiss = () => installPrompt.dismiss()

  const install = async () => {
    if (!installEvent) return
    await installEvent.prompt()
    await installEvent.userChoice
    setInstallEvent(null)
    dismiss()
  }

  return (
    <div className="animate-slide-up fixed inset-x-3 bottom-[calc(64px+env(safe-area-inset-bottom)+12px)] z-50 md:inset-x-auto md:bottom-6 md:left-6 md:max-w-md">
      <div className="border-hairline shadow-card-hover flex items-center gap-3 rounded-full border bg-white/95 py-2 pr-2 pl-3 backdrop-blur-md">
        <span className="shrink-0">
          <ZenthosLogo showWordmark={false} />
        </span>

        {showIosHint ? (
          <p className="text-ink flex min-w-0 flex-1 flex-wrap items-center gap-1 text-[13px] leading-snug">
            Tap
            <Share2 size={13} aria-hidden="true" className="shrink-0" />
            then <span className="font-semibold">Add to Home Screen</span>
          </p>
        ) : (
          <p className="text-ink min-w-0 flex-1 truncate text-[13px] font-medium">
            Install the Zenthos app
          </p>
        )}

        {!showIosHint ? (
          <button
            type="button"
            onClick={() => void install()}
            className="bg-brand hover:bg-brand-hover flex h-9 shrink-0 items-center rounded-full px-4 text-[13px] font-bold text-white transition-colors"
          >
            Install
          </button>
        ) : null}

        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss install prompt"
          className="text-muted hover:text-ink hover:bg-surface flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
