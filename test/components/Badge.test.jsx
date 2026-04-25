import test from 'node:test'
import assert from 'node:assert/strict'
import { render, screen } from '@testing-library/react'
import '../setup.js'

// Import Badge component
import Badge from '../../src/components/Badge.jsx'

test('Badge applies correct variant classes for default variant', () => {
  const { container } = render(<Badge>Test</Badge>)
  const badge = container.firstChild

  // Should have bg-primary class from default variant
  assert.ok(
    badge.className.includes('bg-primary'),
    `Expected 'bg-primary' in className but got: ${badge.className}`
  )
})

test('Badge applies secondary variant classes', () => {
  const { container } = render(<Badge variant="secondary">Secondary</Badge>)
  const badge = container.firstChild

  // Should have bg-secondary class
  assert.ok(
    badge.className.includes('bg-secondary'),
    `Expected 'bg-secondary' in className but got: ${badge.className}`
  )
})

test('Badge applies success variant classes', () => {
  const { container } = render(<Badge variant="success">Success</Badge>)
  const badge = container.firstChild

  // Should have green background
  assert.ok(
    badge.className.includes('green-500') || badge.className.includes('bg-green'),
    `Expected green color class in className but got: ${badge.className}`
  )
})

test('Badge does not pass object as className', () => {
  const { container } = render(<Badge variant="outline">Outline</Badge>)
  const badge = container.firstChild

  // The bug: variantClasses object was passed directly to cn()
  // This would result in "[object Object]" in className or incorrect merging
  assert.ok(
    !badge.className.includes('[object Object]'),
    'Badge should not have [object Object] in className - variantClasses bug detected!'
  )

  // Should have text-foreground class for outline variant
  assert.ok(
    badge.className.includes('text-foreground'),
    `Expected 'text-foreground' in className but got: ${badge.className}`
  )
})
