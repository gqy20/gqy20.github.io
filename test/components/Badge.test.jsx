import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import '../setup.js'
import Badge from '../../src/components/Badge.jsx'

describe('Badge Component', () => {
  it('applies correct variant classes for default variant', () => {
    const { container } = render(<Badge>Test</Badge>)
    const badge = container.firstChild
    expect(badge.className).toContain('bg-primary')
  })

  it('applies secondary variant classes', () => {
    const { container } = render(<Badge variant="secondary">Secondary</Badge>)
    const badge = container.firstChild
    expect(badge.className).toContain('bg-secondary')
  })

  it('applies success variant classes', () => {
    const { container } = render(<Badge variant="success">Success</Badge>)
    const badge = container.firstChild
    expect(badge.className).toMatch(/green-500|bg-green/)
  })

  it('does not pass object as className', () => {
    const { container } = render(<Badge variant="outline">Outline</Badge>)
    const badge = container.firstChild
    expect(badge.className).not.toContain('[object Object]')
    expect(badge.className).toContain('text-foreground')
  })
})
