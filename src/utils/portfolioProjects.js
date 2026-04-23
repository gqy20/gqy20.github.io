import portfolioConfig from '../data/project-portfolio.json' with { type: 'json' }

export const PORTFOLIO_CONFIG = portfolioConfig
export const PORTFOLIO_TRACKS = portfolioConfig.tracks

const trackById = new Map(PORTFOLIO_TRACKS.map(track => [track.id, track]))
const featuredOrder = portfolioConfig.featured

const getProjectConfig = (project) => portfolioConfig.projects[project?.name] || {}

export const isFeaturedProject = (project) => featuredOrder.includes(project?.name)

export const getPortfolioTrack = (project) => {
  const projectConfig = getProjectConfig(project)
  const trackId = projectConfig.track ||
    portfolioConfig.fallbackTrackByCategory[project?.category] ||
    'domain-tools'

  return trackById.get(trackId) || trackById.get('domain-tools')
}

export const getProjectNarrative = (project) => {
  const track = getPortfolioTrack(project)
  const custom = getProjectConfig(project).narrative

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

const compareByFeaturedOrder = (a, b) => {
  const aIndex = featuredOrder.indexOf(a.name)
  const bIndex = featuredOrder.indexOf(b.name)
  const normalizedA = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex
  const normalizedB = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex
  return normalizedA - normalizedB
}

const projectMatchesSearch = (project, searchTerm) => {
  if (!searchTerm) return true

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
}

const sortProjects = (projects, sortBy) => [...projects].sort((a, b) => {
  if (sortBy === 'featured') return Number(b.isFeatured) - Number(a.isFeatured) || compareByFeaturedOrder(a, b)
  if (sortBy === 'stars') return b.stars - a.stars
  return new Date(b.updatedAt) - new Date(a.updatedAt)
})

const buildDirectoryGroups = (projects, searchTerm, sortBy) => {
  const directoryProjects = sortProjects(
    projects.filter(project => (searchTerm || !project.isFeatured) && projectMatchesSearch(project, searchTerm)),
    sortBy
  )

  return PORTFOLIO_TRACKS
    .filter(track => !['all', 'featured'].includes(track.id))
    .map(track => ({
      ...track,
      projects: directoryProjects.filter(project => project.portfolioTrack.id === track.id)
    }))
    .filter(group => group.projects.length > 0)
}

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
    filtered = filtered.filter(project => projectMatchesSearch(project, searchTerm))
  }

  filtered = sortProjects(filtered, sortBy)

  return {
    featured,
    filtered,
    trackCounts,
    directoryGroups: buildDirectoryGroups(enriched, searchTerm, sortBy)
  }
}
