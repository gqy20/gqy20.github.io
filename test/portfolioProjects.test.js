import test from 'node:test'
import assert from 'node:assert/strict'
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

test('maps important repositories to portfolio tracks', () => {
  assert.equal(getPortfolioTrack(projects[0]).id, 'agent-systems')
  assert.equal(getPortfolioTrack(projects[1]).id, 'tool-interfaces')
  assert.equal(getPortfolioTrack(projects[2]).id, 'ai-devtools')
})

test('loads portfolio semantics from json config', () => {
  assert.ok(PORTFOLIO_CONFIG.tracks.some(track => track.id === 'knowledge-work'))
  assert.deepEqual(PORTFOLIO_CONFIG.featured.slice(0, 3), ['TrumanWorld', 'zotero_cli', 'TrendPluse'])
  assert.equal(PORTFOLIO_CONFIG.projects.TrumanWorld.track, 'agent-systems')
  assert.equal(PORTFOLIO_CONFIG.projects['article-mcp'].narrative.title, '让智能体检索论文')
})

test('uses hand-written narrative for flagship systems', () => {
  const narrative = getProjectNarrative(projects[0])

  assert.equal(narrative.title, '一个有记忆的 AI 小镇')
  assert.match(narrative.problem, /长期记忆/)
  assert.ok(narrative.built.includes('记忆循环'))
})

test('builds a project page model around portfolio tracks', () => {
  const model = getProjectViewModel(projects, {
    selectedTrack: 'tool-interfaces',
    searchTerm: '',
    sortBy: 'updated'
  })

  assert.deepEqual(model.featured.map(project => project.name), ['TrumanWorld'])
  assert.deepEqual(model.filtered.map(project => project.name), ['article-mcp'])
  assert.equal(model.trackCounts.find(track => track.id === 'tool-interfaces').count, 1)
})

test('searches project names, descriptions, tracks, and narrative text', () => {
  const model = getProjectViewModel(projects, {
    selectedTrack: 'all',
    searchTerm: '文献库',
    sortBy: 'updated'
  })

  assert.deepEqual(model.filtered.map(project => project.name), ['article-mcp'])
})

test('builds a compact directory grouped by portfolio track', () => {
  const model = getProjectViewModel(projects, { searchTerm: '', sortBy: 'updated' })

  assert.deepEqual(
    model.directoryGroups.map(group => [group.id, group.projects.map(project => project.name)]),
    [
      ['tool-interfaces', ['article-mcp']],
      ['ai-devtools', ['cc-insights']]
    ]
  )
})

test('directory search can include featured systems', () => {
  const model = getProjectViewModel(projects, { searchTerm: '小镇', sortBy: 'updated' })

  assert.deepEqual(model.directoryGroups.map(group => group.projects.map(project => project.name)), [['TrumanWorld']])
})
