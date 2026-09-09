'use client'

import { useSyncExternalStore } from 'react'

/*
  The install bar and the alerts prompt both live above the tab bar. Only one
  may hold that space at a time, so they queue: install asks first, and the
  alerts prompt waits until the visitor has dealt with it.
*/
export type PromptOwner = 'install' | 'alerts'

let holder: PromptOwner | null = null
const listeners = new Set<() => void>()

function emit(): void {
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function claimPromptSlot(owner: PromptOwner): void {
  if (holder === owner) return
  holder = owner
  emit()
}

export function releasePromptSlot(owner: PromptOwner): void {
  if (holder !== owner) return
  holder = null
  emit()
}

export function usePromptSlotHolder(): PromptOwner | null {
  return useSyncExternalStore(
    subscribe,
    () => holder,
    () => null
  )
}
