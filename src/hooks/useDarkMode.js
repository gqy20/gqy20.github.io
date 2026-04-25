import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'dark-mode'

function getSystemPreference() {
  if (typeof window === 'undefined') return false
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return false
  }
}

function getStoredValue() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) return stored === 'true'
  } catch {
    // SSR or restricted environment
  }
  return null
}

export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = getStoredValue()
    if (stored !== null) return stored
    return getSystemPreference()
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
    try { localStorage.setItem(STORAGE_KEY, String(isDarkMode)) } catch {}
  }, [isDarkMode])

  useEffect(() => {
    try {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (e) => {
        if (getStoredValue() === null) setIsDarkMode(e.matches)
      }
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    } catch {}
  }, [])

  const toggle = useCallback(() => setIsDarkMode(prev => !prev), [])

  return { isDarkMode, setIsDarkMode, toggle }
}
