import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import '../setup.js'
import RunMode, { parseRuntimeMessage } from '../../src/components/RunMode.jsx'

describe('RunMode', () => {
  it('does not render while closed', () => {
    render(<RunMode open={false} onClose={() => {}} />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('renders the lazy Godot frame after activation', () => {
    render(<RunMode open onClose={() => {}} />)
    expect(screen.getByRole('dialog')).toBeDefined()
    expect(screen.getByTitle('葛庆宇的 Agent 运行拓扑').getAttribute('src')).toContain('/runtime/home/index.html')
  })

  it('closes with Escape', () => {
    const onClose = vi.fn()
    render(<RunMode open onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes from the READ control', () => {
    const onClose = vi.fn()
    render(<RunMode open onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'READ' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('parses JSON messages and ignores malformed input', () => {
    expect(parseRuntimeMessage('{"type":"gqy:run:ready"}')).toEqual({ type: 'gqy:run:ready' })
    expect(parseRuntimeMessage('not-json')).toBeNull()
  })
})
