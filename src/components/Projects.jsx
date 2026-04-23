import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FaArchive,
  FaArrowRight,
  FaExternalLinkAlt,
  FaGithub,
  FaSearch,
  FaSync
} from 'react-icons/fa'
import './Projects.css'
import ProjectDetailModal from './ProjectDetailModal'
import {
  PORTFOLIO_TRACKS,
  getProjectViewModel
} from '../utils/portfolioProjects'
import { getExternalLinkIcon, normalizeDescription } from '../utils/projectUtils'

const Projects = () => {
  const [projectsData, setProjectsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTrack, setSelectedTrack] = useState('all')
  const [sortBy, setSortBy] = useState('featured')
  const [selectedProject, setSelectedProject] = useState(null)

  useEffect(() => {
    const loadProjectsData = async () => {
      try {
        setLoading(true)
        const data = await import('../data/projects.json')
        setProjectsData(data.default)
      } catch (err) {
        setError('加载项目数据失败')
        console.error('Failed to load projects data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadProjectsData()
  }, [])

  const viewModel = useMemo(() => {
    if (!projectsData) return { featured: [], filtered: [], trackCounts: [] }
    return getProjectViewModel(projectsData.allProjects, { selectedTrack, searchTerm, sortBy })
  }, [projectsData, selectedTrack, searchTerm, sortBy])

  const openProject = (project) => setSelectedProject(project)
  const closeProject = () => setSelectedProject(null)

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') closeProject()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

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
    <section className="projects">
      <div className="projects-shell">
        <motion.header
          className="projects-hero"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p>系统与工具</p>
          <h1>这些项目证明同一件事：AI 要进入真实工作流。</h1>
          <div className="projects-hero-copy">
            <span>围绕智能体、工具接口和自动化系统沉淀的 {totalProjects} 个公开作品。</span>
            <a href="#/blog">查看构建记录 <FaArrowRight /></a>
          </div>
        </motion.header>

        <section className="featured-projects" aria-labelledby="featured-title">
          <div className="section-heading">
            <p>代表系统</p>
            <h2 id="featured-title">先看能讲清楚方向的项目。</h2>
          </div>
          <div className="featured-grid">
            {viewModel.featured.slice(0, 4).map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                featured
                onOpen={openProject}
              />
            ))}
          </div>
        </section>

        <section className="project-browser" aria-labelledby="browser-title">
          <div className="section-heading browser-heading">
            <div>
              <p>项目索引</p>
              <h2 id="browser-title">按能力看，而不是按仓库看。</h2>
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
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="featured">代表优先</option>
                <option value="updated">最近更新</option>
                <option value="stars">星标数</option>
              </select>
            </div>
          </div>

          <div className="track-tabs">
            {PORTFOLIO_TRACKS.map(track => {
              const count = track.id === 'all'
                ? totalProjects
                : track.id === 'featured'
                  ? viewModel.featured.length
                  : viewModel.trackCounts.find(item => item.id === track.id)?.count || 0
              return (
                <button
                  type="button"
                  key={track.id}
                  className={selectedTrack === track.id ? 'active' : ''}
                  onClick={() => setSelectedTrack(track.id)}
                >
                  {track.label}<span>{count}</span>
                </button>
              )
            })}
          </div>

          {viewModel.filtered.length > 0 ? (
            <div className="projects-grid">
              {viewModel.filtered.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  onOpen={openProject}
                />
              ))}
            </div>
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

      <ProjectDetailModal
        project={selectedProject}
        isOpen={Boolean(selectedProject)}
        onClose={closeProject}
      />
    </section>
  )
}

const ProjectCard = ({ project, index, featured = false, onOpen }) => {
  const narrative = project.narrative
  const homepageIcon = getExternalLinkIcon(project.homepage)

  return (
    <motion.article
      className={`project-card ${featured ? 'featured' : ''}`}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.42, delay: Math.min(index, 8) * 0.035 }}
    >
      <div className="project-card-top">
        <span>{project.portfolioTrack.shortLabel}</span>
        {project.isArchived && <em><FaArchive /> 已归档</em>}
      </div>
      <h3>{project.name}</h3>
      <h4>{narrative.title}</h4>
      <p>{narrative.summary || normalizeDescription(project.description, project.name)}</p>
      <div className="project-built">
        {narrative.built.slice(0, 4).map(item => <span key={item}>{item}</span>)}
      </div>
      <div className="project-card-actions">
        <button type="button" onClick={() => onOpen(project)}>
          查看详情
        </button>
        <a href={project.url} target="_blank" rel="noopener noreferrer" aria-label={`${project.name} GitHub`}>
          <FaGithub />
        </a>
        {project.homepage && (
          <a href={project.homepage} target="_blank" rel="noopener noreferrer" aria-label={`${project.name} 外部链接`}>
            {homepageIcon === 'pypi' ? 'PyPI' : <FaExternalLinkAlt />}
          </a>
        )}
      </div>
    </motion.article>
  )
}

export default Projects
