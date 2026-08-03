'use client'

import { Check, Link2, Share2 } from 'lucide-react'
import { useState } from 'react'

interface ShareButtonProps {
  title: string
  text: string
  path: string
}

/**
 * Uses the native share sheet where it exists — one tap to WhatsApp, Instagram,
 * Telegram or anything else installed — and falls back to copying the link on
 * desktop browsers that have no share target.
 */
export function ShareButton({ title, text, path }: ShareButtonProps) {
  const [justCopied, setJustCopied] = useState(false)

  const share = async () => {
    const url = `${window.location.origin}${path}`

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, text, url })
        return
      } catch {
        // The user dismissed the sheet, or the browser refused the payload.
        // Fall through to the clipboard so the action still does something.
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      setJustCopied(true)
      window.setTimeout(() => setJustCopied(false), 2000)
    } catch {
      setJustCopied(false)
    }
  }

  return (
    <button
      type="button"
      onClick={() => void share()}
      className="border-hairline text-ink hover:border-brand rounded-control flex h-12 items-center justify-center gap-2 border px-4 text-[15px] font-semibold transition-colors"
    >
      {justCopied ? (
        <>
          <Check size={17} aria-hidden="true" className="text-success" />
          Link copied
        </>
      ) : (
        <>
          <Share2 size={17} aria-hidden="true" />
          Share
        </>
      )}
    </button>
  )
}

export function CopyLinkButton({ path }: { path: string }) {
  const [justCopied, setJustCopied] = useState(false)

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(`${window.location.origin}${path}`)
          setJustCopied(true)
          window.setTimeout(() => setJustCopied(false), 2000)
        } catch {
          setJustCopied(false)
        }
      }}
      className="text-muted hover:text-brand flex items-center gap-1.5 text-[13px] font-medium transition-colors"
    >
      {justCopied ? <Check size={14} aria-hidden="true" /> : <Link2 size={14} aria-hidden="true" />}
      {justCopied ? 'Copied' : 'Copy link'}
    </button>
  )
}
