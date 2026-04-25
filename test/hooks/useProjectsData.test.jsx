import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import '../setup.js'

describe('useProjectsData Hook', () => {
  beforeEach(() => {
    // Reset module cache between tests
    vi.resetModules()
  })

  it('should return null initially before data loads', async () => {
    const { useProjectsData } = await import('../../src/hooks/useProjectsData.js')

    const { result } = renderHook(() => useProjectsData())

    expect(result.current.data).toBeNull()
    expect(result.current.loading).toBe(true)
  })

  it('should load data asynchronously without blocking', async () => {
    const { useProjectsData } = await import('../../src/hooks/useProjectsData.js')

    const { result } = renderHook(() => useProjectsData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    }, { timeout: 5000 })

    expect(result.current.data).not.toBeNull()
    expect(result.current.data.allProjects).toBeDefined()
    expect(result.current.data.totalProjects).toBeGreaterThan(0)
  })

  it('should share cached data across multiple callers', async () => {
    const { useProjectsData } = await import('../../src/hooks/useProjectsData.js')

    // Wait for first hook to load data
    const h1 = renderHook(() => useProjectsData())
    await waitFor(() => expect(h1.result.current.loading).toBe(false), { timeout: 5000 })

    // Second hook should get cached data immediately
    const h2 = renderHook(() => useProjectsData())
    expect(h2.result.current.data).not.toBeNull()
    expect(h2.result.current.loading).toBe(false)

    // Both reference same object (shared cache)
    expect(h1.result.current.data).toBe(h2.result.current.data)

    h1.unmount()
    h2.unmount()
  })
})
