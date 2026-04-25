import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import '../setup.js'

// Test that components can be imported from new ui/ location
describe('UI Component Directory Structure', () => {
  it('Button can be imported from ui/ directory', async () => {
    const { default: Button } = await import('../../src/components/ui/button.jsx')
    const { container } = render(<Button>Test</Button>)
    const button = container.firstChild
    expect(button).toBeDefined()
    expect(button.tagName).toBe('BUTTON')
    expect(button.className).toContain('bg-primary')
  })

  it('Badge can be imported from ui/ directory', async () => {
    const { default: Badge } = await import('../../src/components/ui/badge.jsx')
    const { container } = render(<Badge>Test</Badge>)
    const badge = container.firstChild
    expect(badge).toBeDefined()
    expect(badge.className).toContain('bg-primary')
  })

  it('Button exports buttonVariants for external use', async () => {
    const { buttonVariants } = await import('../../src/components/ui/button.jsx')
    expect(buttonVariants).toBeDefined()
    expect(typeof buttonVariants).toBe('function')
  })
})
