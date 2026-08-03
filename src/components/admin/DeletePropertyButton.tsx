'use client'

import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { deletePropertyAction } from '@/lib/actions/properties'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'

/**
 * Deletion is irreversible, so it goes through an explicit confirmation naming
 * the listing rather than a bare `confirm()`.
 */
export function DeletePropertyButton({ id, title }: { id: string; title: string }) {
  const [isConfirming, setIsConfirming] = useState(false)
  useLockBodyScroll(isConfirming)

  return (
    <>
      <button
        type="button"
        onClick={() => setIsConfirming(true)}
        aria-label={`Delete ${title}`}
        className="text-muted hover:text-danger flex h-10 w-10 items-center justify-center transition-colors"
      >
        <Trash2 size={16} aria-hidden="true" />
      </button>

      {isConfirming ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Cancel"
            onClick={() => setIsConfirming(false)}
            className="absolute inset-0 bg-black/40"
          />

          <div className="rounded-card relative w-full max-w-sm bg-white p-5 shadow-xl">
            <h2 className="text-ink text-[17px] font-bold">Delete this property?</h2>
            <p className="text-muted mt-2 text-[14px] leading-relaxed">
              <span className="text-ink font-semibold">{title}</span> will be removed permanently,
              along with its saved-property and inquiry links. This cannot be undone.
            </p>

            <div className="mt-5 flex gap-2">
              <form action={deletePropertyAction} className="flex-1">
                <input type="hidden" name="id" value={id} />
                <Button type="submit" variant="danger" fullWidth>
                  Delete
                </Button>
              </form>
              <Button variant="secondary" onClick={() => setIsConfirming(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
