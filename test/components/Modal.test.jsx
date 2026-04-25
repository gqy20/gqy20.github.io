import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '../setup.js'
import { Modal } from '../../src/components/Modal.jsx'

describe('Modal Component', () => {
  it('renders when open', () => {
    const { container } = render(
      <Modal isOpen title="Test" onClose={() => {}}>Content</Modal>
    )
    const overlay = container.querySelector('[class*="fixed"][class*="inset-0"]')
    expect(overlay).not.toBeNull()
    expect(overlay.className).toContain('bg-black/50')
    expect(screen.getByText('Test')).toBeDefined()
    expect(screen.getByText('Content')).toBeDefined()
  })

  it('does not render when closed', () => {
    const { container } = render(
      <Modal isOpen={false} title="Hidden" onClose={() => {}}>Hidden</Modal>
    )
    expect(container.querySelector('[class*="fixed"][class*="inset-0"]')).toBeNull()
  })

  it('shows close button by default', () => {
    render(<Modal isOpen title="Closable" onClose={() => {}}>Content</Modal>)
    expect(screen.getByLabelText(/关闭/i)).toBeDefined()
  })

  it('hides close button when showCloseButton is false', () => {
    const { container } = render(
      <Modal isOpen title="NoClose" onClose={() => {}} showCloseButton={false}>No Close</Modal>
    )
    const buttons = container.querySelectorAll('button[aria-label]')
    const closeBtn = Array.from(buttons).find(b => b.getAttribute('aria-label')?.includes('关闭'))
    expect(closeBtn).toBeUndefined()
  })

  it('applies size variant: small', () => {
    const { container } = render(
      <Modal isOpen size="small" title="Small" onClose={() => {}}>Small</Modal>
    )
    const overlay = container.querySelector('[class*="fixed"][class*="inset-0"]')
    expect(overlay.className).toContain('modal-small')
  })

  it('applies size variant: large', () => {
    const { container } = render(
      <Modal isOpen size="large" title="Large" onClose={() => {}}>Large</Modal>
    )
    const overlay = container.querySelector('[class*="fixed"][class*="inset-0"]')
    expect(overlay.className).toContain('modal-large')
  })

  it('applies visual variant: glass', () => {
    const { container } = render(
      <Modal isOpen variant="glass" title="Glass" onClose={() => {}}>Glass</Modal>
    )
    const overlay = container.querySelector('[class*="fixed"][class*="inset-0"]')
    expect(overlay.className).toContain('modal-glass')
  })

  it('renders header, body sections', () => {
    render(
      <Modal isOpen title="Sections" description="Desc" onClose={() => {}}>
        <p>Body content</p>
      </Modal>
    )
    expect(screen.getByText('Sections')).toBeDefined()
    expect(screen.getByText('Desc')).toBeDefined()
    expect(screen.getByText('Body content')).toBeDefined()
  })

  it('calls onClose on escape key', () => {
    const onClose = vi.fn()
    render(<Modal isOpen title="Escape" onClose={onClose}>Esc</Modal>)

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose on backdrop click', () => {
    const onClose = vi.fn()
    const { container } = render(
      <Modal isOpen title="Backdrop" onClose={onClose} closeOnBackdrop>
        Click outside to close
      </Modal>
    )

    const backdrop = container.querySelector('[class*="fixed"][class*="inset-0"]')
    fireEvent.click(backdrop)
    expect(onClose).toHaveBeenCalled()
  })
})
