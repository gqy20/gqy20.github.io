export const PORTFOLIO_TRACKS = [
  { id: 'all', label: '全部项目', shortLabel: '全部' },
  { id: 'featured', label: '代表系统', shortLabel: '代表' },
  { id: 'agent-systems', label: '智能体系统', shortLabel: '智能体' },
  { id: 'tool-interfaces', label: '工具接口', shortLabel: '接口' },
  { id: 'knowledge-work', label: '知识工作', shortLabel: '知识' },
  { id: 'automation', label: '自动化流程', shortLabel: '自动化' },
  { id: 'ai-devtools', label: 'AI 开发工具', shortLabel: '开发工具' },
  { id: 'domain-tools', label: '领域应用', shortLabel: '领域' }
]

const trackById = new Map(PORTFOLIO_TRACKS.map(track => [track.id, track]))

const projectTracks = {
  TrumanWorld: 'agent-systems',
  IssueLab: 'agent-systems',
  mind: 'agent-systems',
  'manim-agent': 'automation',
  'article-mcp': 'tool-interfaces',
  'crawl-mcp': 'tool-interfaces',
  mcp_agent: 'tool-interfaces',
  zotero_cli: 'knowledge-work',
  pdfget: 'knowledge-work',
  SLAIS: 'knowledge-work',
  pub2tts: 'knowledge-work',
  rss2cubox: 'automation',
  TrendPluse: 'automation',
  'cc-insights': 'ai-devtools',
  Skills_demo: 'ai-devtools',
  cc_plugins: 'ai-devtools',
  biotools_agent: 'ai-devtools',
  'genome-mcp': 'domain-tools',
  'protein-mcp': 'domain-tools',
  astro_light_pollution: 'domain-tools',
  'minimax-studio': 'automation',
  justdo: 'automation',
  flywheel: 'automation',
  'quick-py': 'ai-devtools'
}

const featuredOrder = ['TrumanWorld', 'zotero_cli', 'TrendPluse', 'IssueLab']

const narratives = {
  TrumanWorld: {
    title: '一个有记忆的 AI 小镇',
    summary: '居民会记住经历、规划行动、形成关系；观察者只能改变环境，不能直接操控想法。',
    problem: '单次聊天很难体现长期记忆、关系变化和环境演化。',
    built: ['记忆循环', '计划流程', '角色互动', '观察者机制', 'Web 界面'],
    aiRole: 'AI 居民根据记忆和环境生成行动，而不是被用户直接操控。'
  },
  zotero_cli: {
    title: '让智能体操作真实文献库',
    summary: 'Claude Code 和 Codex 可以检索 Zotero、阅读 PDF、管理标注并生成引用。',
    problem: '知识工作不能停留在回答问题，智能体需要进入真实资料库。',
    built: ['Go CLI', 'Zotero 接口', 'PDF 阅读流程', '引用生成'],
    aiRole: 'AI 通过命令行接口读取、整理和复用文献上下文。'
  },
  TrendPluse: {
    title: '捕捉 AI 生态趋势',
    summary: '从 GitHub 动态中追踪 AI 编程和智能体生态，用模型生成结构化洞察。',
    problem: '开源生态变化太快，需要持续采集、过滤和总结信号。',
    built: ['采集流程', '模型分析', '趋势报告', '自动更新'],
    aiRole: 'AI 从项目动态中提取趋势、归纳变化并生成报告。'
  },
  IssueLab: {
    title: '用 Issue 组织多智能体讨论',
    summary: '把观点交锋、数字分身和异步协作放进 GitHub Issues 的可追踪环境。',
    problem: '多智能体协作需要留下过程，而不是只输出最终结论。',
    built: ['讨论流程', '角色设定', '协作记录', 'GitHub Issues 接口'],
    aiRole: 'AI 以不同角色参与讨论，并把观点演化保留下来。'
  },
  'article-mcp': {
    title: '让智能体检索论文',
    summary: '把文献检索封装成 MCP 工具，让智能体稳定获取论文、摘要和全文上下文。',
    problem: '智能体需要可靠访问文献库，而不是依赖一次性搜索结果。',
    built: ['MCP Server', '文献检索', '摘要获取', 'PyPI 分发'],
    aiRole: 'AI 通过工具接口获取研究上下文，并把检索结果带回工作流。'
  }
}

const fallbackTrackByCategory = {
  MCP工具: 'tool-interfaces',
  AI应用: 'agent-systems',
  科研工具: 'knowledge-work',
  Web开发: 'automation',
  开发工具: 'ai-devtools',
  个人项目: 'automation'
}

export const isFeaturedProject = (project) => featuredOrder.includes(project?.name)

export const getPortfolioTrack = (project) => {
  const trackId = projectTracks[project?.name] || fallbackTrackByCategory[project?.category] || 'domain-tools'
  return trackById.get(trackId) || trackById.get('domain-tools')
}

export const getProjectNarrative = (project) => {
  const custom = narratives[project?.name]
  const track = getPortfolioTrack(project)

  if (custom) {
    return { ...custom, track }
  }

  const description = project?.description && !project.description.includes('暂无描述')
    ? project.description
    : `${project?.name || '这个项目'} 是一个围绕 ${track.label} 的实验。`

  return {
    title: track.label,
    summary: description,
    problem: '把想法整理成可运行、可复用的工具或流程。',
    built: [project?.language, ...(project?.tags || [])].filter(Boolean).slice(0, 4),
    aiRole: `服务于${track.label}方向的工具化实践。`,
    track
  }
}

const compareByFeaturedOrder = (a, b) => featuredOrder.indexOf(a.name) - featuredOrder.indexOf(b.name)

export const getProjectViewModel = (projects, options = {}) => {
  const selectedTrack = options.selectedTrack || 'all'
  const searchTerm = (options.searchTerm || '').trim().toLowerCase()
  const sortBy = options.sortBy || 'updated'

  const enriched = projects.map(project => ({
    ...project,
    portfolioTrack: getPortfolioTrack(project),
    narrative: getProjectNarrative(project),
    isFeatured: isFeaturedProject(project)
  }))

  const featured = enriched.filter(project => project.isFeatured).sort(compareByFeaturedOrder)
  const trackCounts = PORTFOLIO_TRACKS.filter(track => !['all', 'featured'].includes(track.id)).map(track => ({
    ...track,
    count: enriched.filter(project => project.portfolioTrack.id === track.id).length
  }))

  let filtered = enriched
  if (selectedTrack === 'featured') {
    filtered = featured
  } else if (selectedTrack !== 'all') {
    filtered = filtered.filter(project => project.portfolioTrack.id === selectedTrack)
  }

  if (searchTerm) {
    filtered = filtered.filter(project => {
      const haystack = [
        project.name,
        project.description,
        project.language,
        project.category,
        project.portfolioTrack.label,
        project.narrative.title,
        project.narrative.summary,
        project.narrative.problem,
        ...(project.tags || [])
      ].filter(Boolean).join(' ').toLowerCase()
      return haystack.includes(searchTerm)
    })
  }

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'featured') return Number(b.isFeatured) - Number(a.isFeatured) || compareByFeaturedOrder(a, b)
    if (sortBy === 'stars') return b.stars - a.stars
    return new Date(b.updatedAt) - new Date(a.updatedAt)
  })

  return { featured, filtered, trackCounts }
}
