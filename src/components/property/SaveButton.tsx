'use client'

import clsx from 'clsx'
import { Bookmark } from 'lucide-react'
import { useState } from 'react'
import { useSavedProperties } from './SavedProvider'

interface SaveButtonProps {
  propertyId: string
  propertyTitle: string

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
          ? 'text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]'
          : 'bg-surface hover:bg-hairline'
      )}
    >
      <Bookmark
        size={20}
        aria-hidden="true"
        fill={saved ? 'currentColor' : 'none'}
        className={clsx(
          'transition-colors',
          saved ? 'text-brand' : tone === 'overlay' ? 'text-white' : 'text-ink',
          isPopping && 'animate-heart-pop'
        )}
      />
    </button>
  )
}
