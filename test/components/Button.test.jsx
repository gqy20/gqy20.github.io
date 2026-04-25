import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '../setup.js'
import Button from '../../src/components/Button.jsx'

describe('Button Component', () => {
  it('renders with default variant classes', () => {
    const { container } = render(<Button>Click me</Button>)
    const button = container.firstChild

    // Default variant should have bg-primary
    expect(button.className).toContain('bg-primary')
    expect(button.className).toContain('text-primary-foreground')
  })

  it('renders with destructive variant', () => {
    const { container } = render(<Button variant="destructive">Delete</Button>)
    const button = container.firstChild

    expect(button.className).toContain('bg-destructive')
  })

  it('renders with outline variant', () => {
    const { container } = render(<Button variant="outline">Outline</Button>)
    const button = container.firstChild

    expect(button.className).toContain('border')
    expect(button.className).toContain('hover:bg-accent')
  })

  it('renders with ghost variant', () => {
    const { container } = render(<Button variant="ghost">Ghost</Button>)
    const button = container.firstChild

    expect(button.className).toContain('hover:bg-accent')
  })

  it('renders with link variant', () => {
    const { container } = render(<Button variant="link">Link</Button>)
    const button = container.firstChild

    expect(button.className).toContain('underline')
  })

  it('applies size classes correctly', () => {
    // Test sm size
    const { container: smContainer } = render(<Button size="sm">Small</Button>)
    const smButton = smContainer.firstChild
    expect(smButton.className).toContain('h-9')

    // Test lg size
    const { container: lgContainer } = render(<Button size="lg">Large</Button>)
    const lgButton = lgContainer.firstChild
    expect(lgButton.className).toContain('h-11')

    // Test icon size
    const { container: iconContainer } = render(<Button size="icon"><span>X</span></Button>)
    const iconButton = iconContainer.firstChild
    expect(iconButton.className).toContain('w-10')
    expect(iconButton.className).toContain('h-10')
  })

  it('merges custom className', () => {
    const { container } = render(<Button className="custom-class">Custom</Button>)
    const button = container.firstChild

    expect(button.className).toContain('custom-class')
    // Should still have base classes
    expect(button.className).toContain('inline-flex')
  })

  it('handles disabled state', () => {
    const { container } = render(<Button disabled>Disabled</Button>)
    const button = container.firstChild

    // Check disabled attribute
    expect(button.disabled).toBe(true)
    expect(button.className).toContain('disabled:opacity-50')
  })

  it('supports ref forwarding', () => {
    let refValue
    const TestComponent = () => {
      const ref = (el) => { refValue = el }
      return <Button ref={ref}>Ref Button</Button>
    }

    render(<TestComponent />)
    expect(refValue).toBeDefined()
    expect(refValue.tagName).toBe('BUTTON')
  })
})
