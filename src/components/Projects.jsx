import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import {
  FaArchive,
  FaCode,
  FaExternalLinkAlt,
  FaGithub,
  FaSearch,
  FaSync
} from 'react-icons/fa'
import {
  SiCplusplus,
  SiGo,
  SiHtml5,
  SiJavascript,
  SiJupyter,
  SiKotlin,
  SiPython,
  SiRuby,
  SiRust,
  SiShell,
  SiSwift,
  SiTypescript
} from 'react-icons/si'
import './Projects.css'
import PageHeader from './PageHeader'
import ProjectVisual from './ProjectVisual'
import { getProjectViewModel } from '../utils/portfolioProjects'
import { getExternalLinkIcon, getLinkText, normalizeDescription } from '../utils/projectUtils'
import { useProjectsData } from '../hooks/useProjectsData.js'

const Projects = () => {
  const { data: projectsData, loading, error: hookError } = useProjectsData()
  const error = hookError ? '加载项目数据失败' : null
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('updated')
  const [selectedTrack, setSelectedTrack] = useState('all')
  const [visiblePerGroup, setVisiblePerGroup] = useState(2)

  const viewModel = useMemo(() => {
    if (!projectsData) return { featured: [], filtered: [], trackCounts: [], directoryGroups: [] }
    return getProjectViewModel(projectsData.allProjects, { searchTerm, sortBy, selectedTrack })
  }, [projectsData, searchTerm, selectedTrack, sortBy])

  const directoryState = useMemo(() => {
    const limit = selectedTrack === 'all' ? visiblePerGroup : Math.max(visiblePerGroup, 8)
    const groups = viewModel.directoryGroups.map(group => ({
      ...group,
      visibleProjects: group.projects.slice(0, limit)
    }))
    const total = viewModel.directoryGroups.reduce((sum, group) => sum + group.projects.length, 0)
    const visible = groups.reduce((sum, group) => sum + group.visibleProjects.length, 0)
    return { groups, total, visible }
  }, [selectedTrack, viewModel.directoryGroups, visiblePerGroup])

  const rootRef = useRef(null)

  useEffect(() => {
    setVisiblePerGroup(2)
  }, [searchTerm, selectedTrack, sortBy])

  if (loading) {
    return (
      <section className="projects">
        <div className="projects-shell">
          <div className="project-state">
            <FaSync className="spinner" />
            <p>正在加载项目数据...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="projects">
        <div className="projects-shell">
          <div className="project-state">
            <h2>加载失败</h2>
            <p>{error}</p>
            <button type="button" onClick={() => window.location.reload()}>重试</button>
          </div>
        </div>
      </section>
    )
  }

  const totalProjects = projectsData?.totalProjects || 0

  return (
    <section className="projects" ref={rootRef}>
      <PageHeader num="02" title="PROJECTS" />
      <div className="projects-shell">
        {/* Inline hero */}
        <motion.div
          className="projects-hero"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="page-header__heading">这些项目证明同一件事：AI 要进入真实工作流。</h1>
          <p className="page-header__lede">
            围绕智能体、工具接口和自动化系统沉淀的 {totalProjects} 个公开作品。
          </p>
        </motion.div>

        <section className="featured-projects" aria-labelledby="featured-title">
          <div className="section-heading">
            <h2 id="featured-title">先看能讲清楚方向的项目。</h2>
          </div>
          <div className="featured-grid">
            {viewModel.featured.slice(0, 4).map((project, index) => (
              <ProjectShowcase
                key={project.id}
                project={project}
                index={index}
              />
            ))}
          </div>
        </section>

        <section className="project-browser" aria-labelledby="browser-title">
          <div className="section-heading browser-heading">
            <div>
              <h2 id="browser-title">更多系统</h2>
            </div>
            <div className="project-tools">
              <label className="search-box">
                <FaSearch />
                <input
                  type="text"
                  placeholder="搜索项目、能力或关键词"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </label>
              <div className="sort-control" role="group" aria-label="项目排序方式">
                {[
                  ['updated', '最近更新'],
                  ['stars', 'Stars'],
                  ['name', 'A–Z']
                ].map(([value, label]) => (
                  <button
                    type="button"
                    key={value}
                    className={sortBy === value ? 'is-active' : ''}
                    aria-pressed={sortBy === value}
                    onClick={() => setSortBy(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="capability-filter" aria-label="按能力筛选项目">
            <button
              type="button"
              className={selectedTrack === 'all' ? 'is-active' : ''}
              aria-pressed={selectedTrack === 'all'}
              onClick={() => setSelectedTrack('all')}
            >
              全部 <span>{viewModel.trackCounts.reduce((sum, track) => sum + track.count, 0)}</span>
            </button>
            {viewModel.trackCounts.filter(track => track.count > 0).map(track => (
              <button
                type="button"
                key={track.id}
                className={selectedTrack === track.id ? 'is-active' : ''}
                aria-pressed={selectedTrack === track.id}
                onClick={() => setSelectedTrack(track.id)}
              >
                {track.shortLabel} <span>{track.count}</span>
              </button>
            ))}
          </div>

          {directoryState.groups.length > 0 ? (
            <>
              <div className="directory-summary" aria-live="polite">
                显示 {directoryState.visible} / {directoryState.total} 个项目
              </div>
              <div className="project-directory">
              {directoryState.groups.map(group => (
                <DirectoryGroup
                  key={group.id}
                  group={group}
                />
              ))}
              </div>
              {directoryState.visible < directoryState.total && (
                <button
                  type="button"
                  className="directory-more"
                  onClick={() => setVisiblePerGroup(count => count + (selectedTrack === 'all' ? 2 : 8))}
                >
                  显示更多项目
                </button>
              )}
            </>
          ) : (
            <div className="project-state">
              <FaSearch />
              <h3>没有找到匹配的项目</h3>
              <p>可以换一个关键词，或回到全部项目。</p>
            </div>
          )}
        </section>

        <footer className="data-footer">
          数据最后更新：{new Date(projectsData.lastUpdated).toLocaleString('zh-CN')}
        </footer>
      </div>
    </section>
  )
}

const DirectoryGroup = ({ group }) => (
  <section className="directory-group" aria-labelledby={`directory-${group.id}`}>
    <div className="directory-group-heading">
      <h3 id={`directory-${group.id}`}>{group.label}</h3>
      <span>{group.projects.length} 个项目</span>
    </div>
    <div className="directory-list">
      {group.visibleProjects.map(project => (
        <DirectoryItem key={project.id} project={project} />
      ))}
    </div>
  </section>
)

const DirectoryItem = ({ project }) => {
  const narrative = project.narrative
  const homepageIcon = getExternalLinkIcon(project.homepage)
  const hasDistinctTitle = narrative.title !== project.portfolioTrack.label
  const capabilities = narrative.built
    .filter(item => item?.toLowerCase() !== project.language?.toLowerCase())
    .slice(0, 2)
  const projectTarget = project.homepage || project.url

  return (
    <article className="directory-item">
      <div className="directory-main">
        <span className="directory-title-line">
          <a
            className="directory-project-name"
            href={projectTarget}
            target="_blank"
            rel="noopener noreferrer"
          >
            {project.name}
          </a>
          {hasDistinctTitle && <span className="directory-narrative-title">{narrative.title}</span>}
        </span>
        <em>{narrative.summary || normalizeDescription(project.description, project.name)}</em>
        {capabilities.length > 0 && (
          <span className="directory-capabilities">
            {capabilities.map(item => <small key={item}>{item}</small>)}
          </span>
        )}
      </div>
      <div className="directory-meta">
        {project.isArchived && <span><FaArchive /> 已归档</span>}
        <LanguageMark language={project.language} />
        <time dateTime={project.updatedAt}>{formatProjectDate(project.updatedAt)}</time>
        <a href={project.url} target="_blank" rel="noopener noreferrer" aria-label={`${project.name} GitHub`}>
          <FaGithub />
        </a>
        {project.homepage && (
          <a href={project.homepage} target="_blank" rel="noopener noreferrer" aria-label={`${project.name} 外部链接`}>
            {homepageIcon === 'pypi' ? 'PyPI' : <FaExternalLinkAlt />}
          </a>
        )}
      </div>
    </article>
  )
}

const LANGUAGE_ICONS = {
  'c++': SiCplusplus,
  go: SiGo,
  html: SiHtml5,
  javascript: SiJavascript,
  'jupyter notebook': SiJupyter,
  kotlin: SiKotlin,
  python: SiPython,
  ruby: SiRuby,
  rust: SiRust,
  shell: SiShell,
  swift: SiSwift,
  typescript: SiTypescript
}

const LanguageMark = ({ language }) => {
  const label = language || 'Unknown'
  const Icon = LANGUAGE_ICONS[label.toLowerCase()] || FaCode

  return (
    <span className="language-mark" title={`主要语言：${label}`} aria-label={`主要语言：${label}`}>
      <Icon aria-hidden="true" />
      {label}
    </span>
  )
}

const formatProjectDate = (value) => {
  if (!value) return '日期未知'
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit' }).format(new Date(value))
}

const ProjectShowcase = ({ project, index }) => {
  const narrative = project.narrative
  const isLead = index === 0
  const primaryUrl = project.homepage || project.url
  const primaryLabel = project.homepage ? getLinkText(project.homepage) : '查看源码'

  return (
    <article className={`featured-showcase ${isLead ? 'featured-showcase--lead' : ''}`}>
      <ProjectVisual projectName={project.name} />
      <div className="featured-showcase__content">
        <div className="featured-showcase__meta">
          <span>{project.portfolioTrack.shortLabel}</span>
          <span>{project.language || 'Unknown'}</span>
          {project.latestRelease?.tagName && <span>{project.latestRelease.tagName}</span>}
          {project.isArchived && <em><FaArchive /> 已归档</em>}
        </div>
        <p className="featured-showcase__repo">{project.name}</p>
        <h3>{narrative.title}</h3>
        <p className="featured-showcase__summary">
          {narrative.summary || normalizeDescription(project.description, project.name)}
        </p>
        <div className="featured-showcase__built" aria-label="核心构建内容">
          {narrative.built.slice(0, isLead ? 5 : 3).map(item => <span key={item}>{item}</span>)}
        </div>
        <div className="featured-showcase__actions">
          <a
            className="featured-showcase__primary"
            href={primaryUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {primaryLabel} <FaExternalLinkAlt />
          </a>
          {project.homepage && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.name} GitHub 源码`}
              title="查看 GitHub 源码"
            >
              <FaGithub />
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

export default Projects
