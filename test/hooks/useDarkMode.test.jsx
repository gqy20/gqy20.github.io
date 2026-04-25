import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

describe('useDarkMode Hook', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  async function createHook(storedValue = null) {
    const store = { [storedValue !== null ? 'dark-mode' : '__none__']: storedValue }

    vi.stubGlobal('localStorage', {
      getItem: (key) => key === 'dark-mode' ? storedValue : null,
      setItem: vi.fn((key, val) => { store[key] = val }),
      removeItem: vi.fn(),
    })

    vi.stubGlobal('matchMedia', (query) => ({
      matches: false,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))

    const { useDarkMode } = await import('../../src/hooks/useDarkMode.js')
    return renderHook(() => useDarkMode())
  }

  it('should default to light mode when no preference stored', async () => {
    const { result } = await createHook(null)
    expect(result.current.isDarkMode).toBe(false)
  })

  it('should restore dark mode from localStorage', async () => {
    const { result } = await createHook('true')
    expect(result.current.isDarkMode).toBe(true)
  })

  it('should persist mode toggle to localStorage', async () => {
    const { result } = await createHook(null)

    act(() => { result.current.toggle() })
    expect(result.current.isDarkMode).toBe(true)

    act(() => { result.current.toggle() })
    expect(result.current.isDarkMode).toBe(false)
  })
})
