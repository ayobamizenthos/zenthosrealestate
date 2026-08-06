'use client'

import { useEffect, useState } from 'react'

const DESKTOP_QUERY = '(min-width: 768px)'

/**
 * Filter panels render as a bottom sheet on phones and a dropdown on desktop.
 * The two need different scroll-locking behaviour, which CSS alone cannot express.
 */
export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY)
    const sync = () => setIsDesktop(query.matches)

    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  return isDesktop
}
