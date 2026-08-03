'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { SearchOverlay } from './SearchOverlay'

interface SearchOverlayApi {
  openSearch: () => void
}

const SearchOverlayContext = createContext<SearchOverlayApi | null>(null)

export function SearchProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openSearch = useCallback(() => setIsOpen(true), [])
  const closeSearch = useCallback(() => setIsOpen(false), [])

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setIsOpen(true)
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  const api = useMemo(() => ({ openSearch }), [openSearch])

  return (
    <SearchOverlayContext.Provider value={api}>
      {children}
      {isOpen ? <SearchOverlay onClose={closeSearch} /> : null}
    </SearchOverlayContext.Provider>
  )
}

export function useSearchOverlay(): SearchOverlayApi {
  const context = useContext(SearchOverlayContext)
  if (!context) throw new Error('useSearchOverlay must be used inside SearchProvider')
  return context
}
