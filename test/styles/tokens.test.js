import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const tokensPath = resolve(__dirname, '../../src/styles/tokens.css')

describe('Design Tokens', () => {
  let tokensContent

  beforeAll(() => {
    try {
      tokensContent = readFileSync(tokensPath, 'utf-8')
    } catch (e) {
      // File doesn't exist yet - this is expected in RED phase
      tokensContent = null
    }
  })

  it('should have tokens.css file exist', () => {
    expect(tokensContent).not.toBeNull()
  })

  it('should define primary color token', () => {
    expect(tokensContent).toContain('--color-primary')
  })

  it('should define accent color token', () => {
    expect(tokensContent).toContain('--color-accent')
  })

  it('should define semantic success color', () => {
    expect(tokensContent).toContain('--color-success')
  })

  it('should define semantic warning color', () => {
    expect(tokensContent).toContain('--color-warning')
  })

  it('should define radius tokens', () => {
    expect(tokensContent).toContain('--radius-sm')
    expect(tokensContent).toContain('--radius-md')
    expect(tokensContent).toContain('--radius-lg')
  })

  it('should use @theme directive for Tailwind v4', () => {
    expect(tokensContent).toContain('@theme')
  })

  it('should define shadow tokens', () => {
    expect(tokensContent).toContain('--shadow-sm')
    expect(tokensContent).toContain('--shadow-md')
    expect(tokensContent).toContain('--shadow-lg')
  })
})
