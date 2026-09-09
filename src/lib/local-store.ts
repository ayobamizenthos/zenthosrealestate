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
    } catch {}

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

export function useIsClient(): boolean {
  return useSyncExternalStore(
    neverChanges,
    () => true,
    () => false
  )
}
