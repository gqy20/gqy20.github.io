import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import '../setup.js'
import RunMode, { parseRuntimeMessage } from '../../src/components/RunMode.jsx'
import { warmGodotRuntime } from '../../src/utils/godotRuntime.js'

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

  it('prefetches the small shell first and the engine after explicit intent', () => {
    document.head.querySelectorAll('[data-godot-prefetch]').forEach(node => node.remove())

    warmGodotRuntime()
    expect(document.head.querySelector('[href="/runtime/home/index.js"]')).not.toBeNull()
    expect(document.head.querySelector('[href="/runtime/home/index.pck"]')).not.toBeNull()
    expect(document.head.querySelector('[href="/runtime/home/index.wasm"]')).toBeNull()

    warmGodotRuntime({ includeEngine: true })
    warmGodotRuntime({ includeEngine: true })
    expect(document.head.querySelectorAll('[href="/runtime/home/index.wasm"]')).toHaveLength(1)
  })

  it('moves from the guided journey into project exploration', () => {
    render(<RunMode open onClose={() => {}} />)
    const frame = screen.getByTitle('葛庆宇的 Agent 运行拓扑')

    fireEvent(window, new window.MessageEvent('message', {
      data: JSON.stringify({ type: 'gqy:run:ready' }),
      source: frame.contentWindow,
    }))
    expect(screen.getByText('任务成为可追踪的上下文')).toBeDefined()

    fireEvent(window, new window.MessageEvent('message', {
      data: JSON.stringify({ type: 'gqy:run:journey-stage', stage: 'output' }),
      source: frame.contentWindow,
    }))
    expect(screen.getByRole('heading', { name: '上下文抵达真实项目' })).toBeDefined()

    fireEvent(window, new window.MessageEvent('message', {
      data: JSON.stringify({ type: 'gqy:run:journey-complete', node: 'issuelab' }),
      source: frame.contentWindow,
    }))
    expect(screen.queryByRole('heading', { name: '上下文抵达真实项目' })).toBeNull()
    expect(screen.getByRole('heading', { name: 'IssueLab' })).toBeDefined()
  })

  it('does not download the iframe when the browser is unsupported', () => {
    const secureContextDescriptor = Object.getOwnPropertyDescriptor(window, 'isSecureContext')
    Object.defineProperty(window, 'isSecureContext', { configurable: true, value: false })

    const { unmount } = render(<RunMode open onClose={() => {}} />)
    expect(screen.queryByTitle('葛庆宇的 Agent 运行拓扑')).toBeNull()
    expect(screen.getByRole('button', { name: '重新加载运行时' })).toBeDefined()
    unmount()

    if (secureContextDescriptor) {
      Object.defineProperty(window, 'isSecureContext', secureContextDescriptor)
    } else {
      delete window.isSecureContext
    }
  })
})
