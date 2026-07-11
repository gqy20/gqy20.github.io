import { describe, it, expect } from 'vitest'
import {
  PORTFOLIO_CONFIG,
  getPortfolioTrack,
  getProjectNarrative,
  getProjectViewModel
} from '../src/utils/portfolioProjects.js'

const projects = [
  {
    name: 'TrumanWorld',
    description: 'AI town',
    category: 'AI应用',
    language: 'JavaScript',
    tags: ['AI应用'],
    stars: 8,
    updatedAt: '2026-04-20T00:00:00Z'
  },
  {
    name: 'article-mcp',
    description: '文献检索MCP',
    category: 'MCP工具',
    language: 'Python',
    tags: ['MCP', 'AI工具'],
    stars: 13,
    updatedAt: '2026-04-21T00:00:00Z'
  },
  {
    name: 'cc-insights',
    description: 'Claude Code usage analysis',
    category: '开发工具',
    language: 'Go',
    tags: ['开发工具'],
    stars: 4,
    updatedAt: '2026-04-22T00:00:00Z'
  }
]

describe('Portfolio Projects Utils', () => {
  it('maps important repositories to portfolio tracks', () => {
    expect(getPortfolioTrack(projects[0]).id).toBe('agent-systems')
    expect(getPortfolioTrack(projects[1]).id).toBe('tool-interfaces')
    expect(getPortfolioTrack(projects[2]).id).toBe('ai-devtools')
  })

  it('loads portfolio semantics from json config', () => {
    expect(PORTFOLIO_CONFIG.tracks.some(track => track.id === 'knowledge-work')).toBe(true)
    // featured 列表加载且每项均为有效 project id(不强依赖具体顺序——数据会被定时任务更新)
    expect(PORTFOLIO_CONFIG.featured.length).toBeGreaterThanOrEqual(3)
    PORTFOLIO_CONFIG.featured.slice(0, 3).forEach(id => {
      expect(PORTFOLIO_CONFIG.projects[id]).toBeDefined()
    })
    expect(PORTFOLIO_CONFIG.projects.TrumanWorld.track).toBe('agent-systems')
    expect(PORTFOLIO_CONFIG.projects['article-mcp'].narrative.title).toBe('让智能体检索论文')
  })

  it('uses hand-written narrative for flagship systems', () => {
    const narrative = getProjectNarrative(projects[0])

    expect(narrative.title).toBe('一个有记忆的 AI 小镇')
    expect(narrative.problem).toMatch(/长期记忆/)
    expect(narrative.built.includes('记忆循环')).toBe(true)
  })

  it('builds a project page model around portfolio tracks', () => {
    const model = getProjectViewModel(projects, {
      selectedTrack: 'tool-interfaces',
      searchTerm: '',
      sortBy: 'updated'
    })

    expect(model.featured.map(p => p.name)).toEqual(['TrumanWorld'])
    expect(model.filtered.map(p => p.name)).toEqual(['article-mcp'])
    expect(model.trackCounts.find(t => t.id === 'tool-interfaces').count).toBe(1)
    expect(model.directoryGroups.map(group => group.id)).toEqual(['tool-interfaces'])
  })

  it('searches project names, descriptions, tracks, and narrative text', () => {
    const model = getProjectViewModel(projects, {
      selectedTrack: 'all',
      searchTerm: '文献库',
      sortBy: 'updated'
    })

    expect(model.filtered.map(p => p.name)).toEqual(['article-mcp'])
  })

  it('builds a compact directory grouped by portfolio track', () => {
    const model = getProjectViewModel(projects, { searchTerm: '', sortBy: 'updated' })

    expect(
      model.directoryGroups.map(g => [g.id, g.projects.map(p => p.name)])
    ).toEqual([
      ['tool-interfaces', ['article-mcp']],
      ['ai-devtools', ['cc-insights']]
    ])
  })

  it('directory search can include featured systems', () => {
    const model = getProjectViewModel(projects, { searchTerm: '小镇', sortBy: 'updated' })

    expect(model.directoryGroups.map(g => g.projects.map(p => p.name))).toEqual([['TrumanWorld']])
  })

  it('sorts the directory by project name', () => {
    const model = getProjectViewModel(projects, { searchTerm: '', sortBy: 'name' })

    expect(model.directoryGroups.flatMap(group => group.projects.map(project => project.name))).toEqual([
      'article-mcp',
      'cc-insights'
    ])
  })
})
