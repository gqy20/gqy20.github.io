import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'gqy20-theme'
const VALID = ['light', 'dark']

function getSystemPreference() {
  if (typeof window === 'undefined') return 'dark'
  try {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

function getStoredValue() {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (VALID.includes(v)) return v
  } catch {}
  return null
}

function applyTheme(theme) {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', theme)
  // 同时维护 .dark class，兼容现有 .app.dark CSS 规则
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

/**
 * 主题 hook — 单一来源 data-theme。
 * - localStorage 优先（用户显式选择 > 系统偏好）
 * - 未存值时跟随 prefers-color-scheme，跨系统主题变化实时响应
 * - 跨标签页通过 storage 事件同步
 */
export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    const stored = getStoredValue()
    return stored ?? getSystemPreference()
  })

  // theme 变化 → 写 DOM + 持久化
  useEffect(() => {
    applyTheme(theme)
    try { localStorage.setItem(STORAGE_KEY, theme) } catch {}
  }, [theme])

  // 跨标签页同步
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== STORAGE_KEY || !VALID.includes(e.newValue)) return
      setThemeState(e.newValue)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // 系统主题变化：仅在用户未显式选择时响应
  useEffect(() => {
    try {
      const mq = window.matchMedia('(prefers-color-scheme: light)')
      const handler = (e) => {
        if (getStoredValue() !== null) return   // 用户已选，不跟随
        setThemeState(e.matches ? 'light' : 'dark')
      }
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    } catch {}
  }, [])

  const setTheme = useCallback((next) => {
    setThemeState((prev) => (VALID.includes(next) ? next : prev))
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, setTheme, toggleTheme, isDark: theme === 'dark' }
}
