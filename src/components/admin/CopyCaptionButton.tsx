'use client'

import { Check, ClipboardCopy } from 'lucide-react'
import { useState } from 'react'
import { buildInstagramCaption, type CaptionInput } from '@/lib/social-caption'

export function CopyCaptionButton({ property }: { property: CaptionInput }) {
  const [justCopied, setJustCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(buildInstagramCaption(property))
      setJustCopied(true)
      window.setTimeout(() => setJustCopied(false), 2500)
    } catch {
      setJustCopied(false)
    }
  }

  return (
    <button
      type="button"
      onClick={() => void copy()}
      aria-label={`Copy the Instagram caption for ${property.title}`}
      className="text-muted hover:text-brand flex h-10 w-10 items-center justify-center transition-colors"
    >
      {justCopied ? (
        <Check size={16} aria-hidden="true" className="text-success" />
      ) : (
        <ClipboardCopy size={16} aria-hidden="true" />
      )}
    </button>
  )
}
