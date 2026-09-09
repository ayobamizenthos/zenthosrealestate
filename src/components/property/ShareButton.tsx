'use client'

import { Check, Link2, Share2 } from 'lucide-react'
import { useState } from 'react'

interface ShareButtonProps {
  title: string
  text: string
  path: string
  tone?: 'full' | 'icon'
}

export function ShareButton({ title, text, path, tone = 'full' }: ShareButtonProps) {
  const [justCopied, setJustCopied] = useState(false)

  const share = async () => {
    const url = `${window.location.origin}${path}`

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, text, url })
        return
      } catch {}
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
      aria-label={tone === 'icon' ? 'Share this property' : undefined}
      className={
        tone === 'icon'
          ? 'text-brand hover:bg-surface flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors'
          : 'text-brand bg-surface hover:bg-hairline rounded-control flex h-12 items-center justify-center gap-2 px-4 text-[15px] font-semibold transition-colors'
      }
    >
      {justCopied ? (
        <>
          <Check size={tone === 'icon' ? 20 : 17} aria-hidden="true" className="text-success" />
          {tone === 'icon' ? null : 'Link copied'}
        </>
      ) : (
        <>
          <Share2 size={tone === 'icon' ? 20 : 17} aria-hidden="true" />
          {tone === 'icon' ? null : 'Share'}
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
