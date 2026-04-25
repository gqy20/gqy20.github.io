import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import '../setup.js'
import Button from '../../src/components/Button.jsx'

describe('Button Visual Effects', () => {
  it('primary variant has gradient-like visual polish', () => {
    const { container } = render(<Button>Primary</Button>)
    const btn = container.firstChild
    // Should have base styling + visual effects applied via CSS
    expect(btn.className).toContain('bg-primary')
    expect(btn.className).toContain('inline-flex')
  })

  it('ghost variant renders without heavy decoration', () => {
    const { container } = render(<Button variant="ghost">Ghost</Button>)
    const btn = container.firstChild
    expect(btn.className).toContain('hover:bg-accent')
    expect(btn.tagName).toBe('BUTTON')
  })

  it('link variant has underline offset', () => {
    const { container } = render(<Button variant="link">Link</Button>)
    const btn = container.firstChild
    expect(btn.className).toContain('underline-offset-4')
  })

  it('size icon produces square button', () => {
    const { container } = render(<Button size="icon"><span>X</span></Button>)
    const btn = container.firstChild
    expect(btn.className).toContain('w-10')
    expect(btn.className).toContain('h-10')
  })

  it('disabled state applies opacity', () => {
    const { container } = render(<Button disabled>Disabled</Button>)
    const btn = container.firstChild
    expect(btn.disabled).toBe(true)
    expect(btn.className).toMatch(/disabled:opacity-50|opacity-50/)
  })

  it('custom className merges correctly', () => {
    const { container } = render(<Button className="mt-4 extra">Custom</Button>)
    const btn = container.firstChild
    expect(btn.className).toContain('mt-4')
    expect(btn.className).toContain('extra')
  })

  it('success variant uses green palette', () => {
    const { container } = render(<Button variant="success">Success</Button>)
    const btn = container.firstChild
    expect(btn.className).toMatch(/green-500|bg-green/)
  })

  it('warning variant uses yellow palette', () => {
    const { container } = render(<Button variant="warning">Warning</Button>)
    const btn = container.firstChild
    expect(btn.className).toMatch(/yellow-500|bg-yellow/)
  })
})
