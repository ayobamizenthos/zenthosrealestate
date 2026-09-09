import { createLocalStore } from '@/lib/local-store'

export interface ListingAlert {
  id: string
  slug: string
  title: string
  location: string
  price: string
  image: string | null
  at: number
  read: boolean
}

const MAX_STORED = 30

export const listingAlerts = createLocalStore<ListingAlert[]>('zenthos.listing-alerts', [])

export function recordAlert(alert: Omit<ListingAlert, 'at' | 'read'>) {
  listingAlerts.update(current => {
    if (current.some(entry => entry.id === alert.id)) return current
    return [{ ...alert, at: Date.now(), read: false }, ...current].slice(0, MAX_STORED)
  })
}

export function markAllRead() {
  listingAlerts.update(current => current.map(entry => ({ ...entry, read: true })))
}

export function clearAlerts() {
  listingAlerts.set([])
}
