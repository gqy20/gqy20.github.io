import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { observeHomeSections } from '../../src/utils/homeSectionObservers.js'

class ObserverMock {
  static instances = []

  constructor(callback, options) {
    this.callback = callback
    this.options = options
    this.observed = []
    this.unobserve = vi.fn()
    this.disconnect = vi.fn()
    ObserverMock.instances.push(this)
  }

  observe(target) {
    this.observed.push(target)
  }
}

describe('observeHomeSections', () => {
  it('keeps section visibility separate from active navigation tracking', () => {
    ObserverMock.instances = []
    const root = document.createElement('div')
    root.innerHTML = `
      <section id="about" class="home-section"></section>
      <section id="work" class="home-section"></section>
    `
    const onActiveSection = vi.fn()

    const cleanup = observeHomeSections(root, onActiveSection, ObserverMock)
    const [activeObserver, revealObserver] = ObserverMock.instances
    const [about, work] = root.querySelectorAll('.home-section')

    expect(activeObserver.observed).toEqual([about, work])
    expect(revealObserver.observed).toEqual([work])
    expect(work.classList.contains('is-revealed')).toBe(false)

    activeObserver.callback([{ target: work, isIntersecting: true }], activeObserver)
    expect(onActiveSection).toHaveBeenCalledWith('work')
    expect(work.classList.contains('is-revealed')).toBe(false)

    revealObserver.callback([{ target: work, isIntersecting: true }], revealObserver)
    expect(work.classList.contains('is-revealed')).toBe(true)
    expect(revealObserver.unobserve).toHaveBeenCalledWith(work)

    cleanup()
    expect(activeObserver.disconnect).toHaveBeenCalledOnce()
    expect(revealObserver.disconnect).toHaveBeenCalledOnce()
  })

  it('leaves all content readable when IntersectionObserver is unavailable', () => {
    const root = document.createElement('div')
    root.innerHTML = '<section id="about" class="home-section"></section>'

    expect(() => observeHomeSections(root, vi.fn(), undefined)).not.toThrow()
    expect(root.querySelector('.home-section').className).toBe('home-section')
  })

  it('does not hide or defer-paint sections before observer callbacks', () => {
    const css = readFileSync(resolve(__dirname, '../../src/components/Hero.css'), 'utf8')
    const baseSectionRule = css.match(/\.home-section\s*\{([^}]*)\}/)?.[1]

    expect(baseSectionRule).toContain('opacity: 1')
    expect(baseSectionRule).not.toContain('content-visibility')
    expect(baseSectionRule).not.toContain('contain-intrinsic-size')
  })
})
