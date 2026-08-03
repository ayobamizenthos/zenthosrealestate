'use client'

import { Share2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ZenthosLogo } from '@/components/brand/ZenthosLogo'
import { Button } from '@/components/ui/Button'
import { useVisitCount } from '@/hooks/useVisitCount'
import { createPromptDismissal, useIsClient } from '@/lib/local-store'

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
    // iOS exposes standalone on navigator rather than through display-mode.
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

/**
 * Custom banner instead of the browser's default mini-infobar, so the prompt
 * matches the brand and we control when it appears.
 */
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

  // Every browser-only fact is read during render behind `isClient`, which
  // keeps hydration honest without syncing anything through an effect.
  if (!isClient) return null
  if (isSuppressed) return null
  if (isStandalone()) return null
  if (visitCount < MIN_VISITS) return null

  const showIosHint = isIosSafari()
  if (!installEvent && !showIosHint) return null

  const dismiss = () => installPrompt.dismiss()

  const install = async () => {
    if (!installEvent) return
    await installEvent.prompt()
    await installEvent.userChoice
    setInstallEvent(null)
    dismiss()
  }

  return (
    // Bottom-left on desktop: the right corner belongs to the WhatsApp button,
    // and the centre of the page is where the search card lives.
    <div className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-50 px-4 md:right-auto md:bottom-6 md:left-6 md:w-[22rem] md:px-0">
      <div className="border-hairline shadow-card-hover rounded-card border bg-white p-4">
        <div className="flex items-start gap-3">
          <ZenthosLogo showWordmark={false} />

          <div className="min-w-0 flex-1">
            <p className="text-ink text-[15px] font-bold">Add to Home Screen</p>
            {showIosHint ? (
              <p className="text-muted mt-1 flex flex-wrap items-center gap-1 text-[13px] leading-relaxed">
                Tap
                <Share2 size={14} aria-hidden="true" className="inline" />
                then <span className="text-ink font-semibold">Add to Home Screen</span>.
              </p>
            ) : (
              <p className="text-muted mt-1 text-[13px] leading-relaxed">
                Install Zenthos for quick access and property alerts.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss install prompt"
            className="text-muted hover:text-ink -mt-1 -mr-1 flex h-9 w-9 shrink-0 items-center justify-center"
          >
            <X size={17} aria-hidden="true" />
          </button>
        </div>

        {!showIosHint ? (
          <div className="mt-3 flex gap-2">
            <Button onClick={() => void install()} fullWidth className="whitespace-nowrap">
              Install
            </Button>
            <Button onClick={dismiss} variant="ghost" className="shrink-0 whitespace-nowrap">
              Not now
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
