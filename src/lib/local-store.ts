'use client'

import { useSyncExternalStore } from 'react'

type Listener = () => void

export interface LocalStore<T> {
  subscribe: (listener: Listener) => () => void
  getSnapshot: () => T
  getServerSnapshot: () => T
  set: (next: T) => void
  update: (updater: (current: T) => T) => void
}

/**
 * localStorage exposed as a React external store. Reading through
 * `useSyncExternalStore` instead of an effect means the value is correct on the
 * first client render, hydration falls back to the server snapshot cleanly, and
 * two tabs stay in sync — none of which an effect-plus-setState achieves.
 *
 * `getSnapshot` must be referentially stable between changes or React will
 * re-render forever, hence the parsed-value cache.
 */
export function createLocalStore<T>(key: string, fallback: T): LocalStore<T> {
  const listeners = new Set<Listener>()
  let cachedRaw: string | null = null
  let cachedValue: T = fallback
  let hasRead = false

  function emit(): void {
    for (const listener of listeners) listener()
  }

  function getSnapshot(): T {
    if (typeof window === 'undefined') return fallback

    let raw: string | null
    try {
      raw = window.localStorage.getItem(key)
    } catch {
      return cachedValue
    }

    if (!hasRead || raw !== cachedRaw) {
      hasRead = true
      cachedRaw = raw
      try {
        cachedValue = raw === null ? fallback : (JSON.parse(raw) as T)
      } catch {
        cachedValue = fallback
      }
    }

    return cachedValue
  }

  function set(next: T): void {
    const serialised = JSON.stringify(next)
    try {
      window.localStorage.setItem(key, serialised)
    } catch {
      // Storage blocked or full — the cache below still drives this session.
    }

    hasRead = true
    cachedRaw = serialised
    cachedValue = next
    emit()
  }

  return {
    subscribe(listener) {
      listeners.add(listener)

      const handleStorage = (event: StorageEvent) => {
        if (event.key === key || event.key === null) emit()
      }
      window.addEventListener('storage', handleStorage)

      return () => {
        listeners.delete(listener)
        window.removeEventListener('storage', handleStorage)
      }
    },
    getSnapshot,
    getServerSnapshot: () => fallback,
    set,
    update(updater) {
      set(updater(getSnapshot()))
    },
  }
}

export function useLocalStore<T>(store: LocalStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot)
}

/**
 * A dismissible prompt: remembers when the user waved it away and re-offers it
 * once the window has passed.
 *
 * The `Date.now()` comparison lives inside the snapshot rather than in a
 * component body, so consuming components stay pure. The server snapshot
 * reports "suppressed" because a prompt must never appear in server HTML.
 */
export function createPromptDismissal(key: string, repromptAfterMs: number) {
  const store = createLocalStore<number>(key, 0)

  return {
    dismiss(): void {
      store.set(Date.now())
    },
    useIsSuppressed(): boolean {
      return useSyncExternalStore(
        store.subscribe,
        () => Date.now() - store.getSnapshot() < repromptAfterMs,
        () => true
      )
    },
  }
}

const neverChanges = () => () => {}

/**
 * True only after hydration. Lets a component branch on browser-only facts
 * (standalone display mode, iOS detection) during render rather than syncing
 * them into state from an effect.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    neverChanges,
    () => true,
    () => false
  )
}
