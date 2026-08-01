import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import AgentWorkflow from '../../src/components/AgentWorkflow.jsx'

const defaultMatchMedia = window.matchMedia

afterEach(() => {
  cleanup()
  window.matchMedia = defaultMatchMedia
})

describe('AgentWorkflow', () => {
  it('renders a complete static workflow before loading animation code', () => {
    const { container } = render(<AgentWorkflow />)

    expect(screen.getByRole('heading', { level: 3 }).textContent).toContain('把一次回答变成可验证的工作流')
    expect(screen.getByRole('button', { name: '播放工作流动画' }).disabled).toBe(false)
    expect(container.querySelector('.agent-workflow__agent-status').textContent).toBe('READY')
    expect(container.querySelectorAll('.agent-workflow__tool-status')).toHaveLength(3)
    expect(container.querySelector('.agent-workflow__result-status').textContent).toBe('VERIFIED')
  })

  it('keeps the static result visible and removes playback for reduced motion', () => {
    window.matchMedia = vi.fn(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    const { container } = render(<AgentWorkflow />)

    expect(screen.queryByRole('button', { name: '播放工作流动画' })).toBeNull()
    expect(container.querySelector('.agent-workflow__result-status').textContent).toBe('VERIFIED')
  })
})
