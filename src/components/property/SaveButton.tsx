'use client'

import clsx from 'clsx'
import { Heart } from 'lucide-react'
import { useState } from 'react'
import { useSavedProperties } from './SavedProvider'

interface SaveButtonProps {
  propertyId: string
  propertyTitle: string
  /** `overlay` sits on a photo; `inline` sits on a white surface. */
  tone?: 'overlay' | 'inline'
}

export function SaveButton({ propertyId, propertyTitle, tone = 'overlay' }: SaveButtonProps) {
  const { isSaved, toggleSaved } = useSavedProperties()
  const [isPopping, setIsPopping] = useState(false)
  const saved = isSaved(propertyId)

  return (
    <button
      type="button"
      onClick={() => {
        if (!saved) {
          setIsPopping(true)
          window.setTimeout(() => setIsPopping(false), 400)
        }
        void toggleSaved(propertyId)
      }}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${propertyTitle} from saved` : `Save ${propertyTitle}`}
      className={clsx(
        'flex h-11 w-11 items-center justify-center rounded-full transition-colors',
        tone === 'overlay'
          ? 'bg-white/90 backdrop-blur-sm hover:bg-white'
          : 'border-hairline hover:border-brand border bg-white'
      )}
    >
      <Heart
        size={19}
        aria-hidden="true"
        className={clsx(
          'transition-colors',
          saved ? 'fill-brand text-brand' : 'text-ink',
          isPopping && 'animate-heart-pop'
        )}
      />
    </button>
  )
}
