import { useMemo, useState } from 'react'
import { useProjectsData } from '../hooks/useProjectsData.js'
import { motion, AnimatePresence } from 'framer-motion'
import { FaArrowRight, FaGithub } from 'react-icons/fa'
import './Hero.css'

const STAGES = [
  { id: 'consumer', label: 'AI 消费者', short: '消费者' },
  { id: 'mcp-builder', label: 'MCP 采用者', short: 'MCP' },
  { id: 'agent-builder', label: 'Agent 构建者', short: 'Agent' },
  { id: 'agent-society', label: '社会构建者', short: '社会' },
]

const HERO_PROJECTS = ['TrumanWorld', 'zotero_cli', 'article-mcp', 'IssueLab', 'mind']

function getStageForDate(dateStr) {
  if (!dateStr) return 0
  const d = new Date(dateStr)
  if (d < new Date('2025-07-01')) return 0
  if (d < new Date('2025-12-01')) return 1
  if (d < new Date('2026-03-01')) return 2
  return 3
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 }
  }
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.55, ease: [0.33, 1, 0.68, 1] }
  }
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: 0.45, ease: [0.33, 1, 0.68, 1] }
  }
}

const lineGrow = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 1.2, ease: [0.33, 1, 0.68, 1], delay: 0.6 }
  }
}

const dotPop = (index) => ({
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1, scale: 1,
    transition: {
      duration: 0.35,
      delay: 0.8 + index * 0.08,
      ease: [0.34, 1.56, 0.64, 1]
    }
  }
})

const Hero = () => {
  const { data: projectData, loading } = useProjectsData()
  const [hoveredProject, setHoveredProject] = useState(null)

  const timelineProjects = useMemo(() => {
    if (!projectData?.allProjects) return []
    return projectData.allProjects
      .filter(p => p.createdAt && !p.name.startsWith('gqy20'))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map(p => ({
        ...p,
        stage: getStageForDate(p.createdAt),
        isHero: HERO_PROJECTS.includes(p.name)
      }))
  }, [projectData])

  const stats = useMemo(() => ({
    repos: projectData?.totalRepositories ?? 0,
    projects: projectData?.totalProjects ?? 0
  }), [projectData])

  const timeRange = useMemo(() => {
    if (timelineProjects.length === 0) return { start: '2025.04', end: '现在' }
    const first = timelineProjects[0].createdAt.slice(0, 7).replace('-', '.')
    return { start: first, end: '现在' }
  }, [timelineProjects])

  return (
    <main className="ai-home">
      <section className="hero-v2">
        {/* Ambient glow */}
        <div className="hero-glow hero-glow--1" />
        <div className="hero-glow hero-glow--2" />

        <div className="hero-v2__inner">
          {/* Identity */}
          <motion.div className="hero-identity" variants={fadeUp}>
            <span className="hero-avatar">QY</span>
            <div className="hero-identity__text">
              <strong>葛清宇</strong>
              <span className="hero-identity__sep">/</span>
              <em>Qingyu Ge</em>
            </div>
          </motion.div>

          {/* Role tags */}
          <motion.div className="hero-tags" variants={fadeUp}>
            <span className="hero-tag">AI Agent 构建者</span>
            <span className="hero-tag hero-tag--muted">MCP 工具作者</span>
            <span className="hero-tag hero-tag--muted">Multi-Agent 系统架构</span>
          </motion.div>

          {/* Title */}
          <motion.h1 className="hero-title" variants={fadeUp}>
            从 AI 消费者，到{' '}
            <span className="hl-accent">Agent 社会</span>
            <br />构建者。
          </motion.h1>

          {/* Subtitle */}
          <motion.p className="hero-subtitle" variants={fadeUp}>
            一年四个阶段，{loading ? '...' : stats.projects} 个开源项目。
            围绕智能体、工具接口和自动化系统持续沉淀。
          </motion.p>

          {/* CTAs */}
          <motion.div className="hero-actions" variants={fadeUp}>
            <a href="#/journey" className="ai-button ai-button-primary">
              查看完整旅程 <FaArrowRight />
            </a>
            <a href="#/projects" className="ai-link">
              浏览全部项目 <FaArrowRight />
            </a>
          </motion.div>

          {/* Timeline */}
          <motion.section className="hero-timeline" variants={containerVariants} initial="hidden" animate="visible">
            {/* Track background line */}
            <motion.div className="timeline-track" variants={lineGrow} />

            {/* Time labels */}
            <div className="timeline-labels">
              <span>{timeRange.start}</span>
              <span>{timeRange.end}</span>
            </div>

            {/* Dots + projects */}
            <div className="timeline-dots">
              {timelineProjects.map((project, i) => (
                <motion.button
                  key={project.id}
                  className={`timeline-dot ${project.isHero ? 'timeline-dot--hero' : ''}`}
                  style={{ left: `${(i / Math.max(timelineProjects.length - 1, 1)) * 100}%` }}
                  variants={dotPop(i)}
                  onMouseEnter={() => setHoveredProject(project)}
                  onMouseLeave={() => setHoveredProject(null)}
                  aria-label={`${project.name}: ${project.description?.slice(0, 60)}`}
                >
                  <span className="dot-core" />
                </motion.button>
              ))}
            </div>

            {/* Stage labels below track */}
            <div className="timeline-stages">
              {STAGES.map((stage, i) => (
                <span
                  key={stage.id}
                  className="timeline-stage"
                  style={{ left: `${(i / (STAGES.length - 1)) * 100}%` }}
                >
                  {stage.short}
                </span>
              ))}
            </div>

            {/* Hover tooltip */}
            <AnimatePresence>
              {hoveredProject && (
                <motion.div
                  className="timeline-tooltip"
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    left: `${(timelineProjects.indexOf(hoveredProject) / Math.max(timelineProjects.length - 1, 1)) * 100}%`
                  }}
                >
                  <strong>{hoveredProject.name}</strong>
                  <p>{hoveredProject.description?.slice(0, 80)}</p>
                  <span className="tooltip-meta">
                    {new Date(hoveredProject.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short' })}
                    {hoveredProject.language && ` · ${hoveredProject.language}`}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          {/* Footer links */}
          <motion.footer className="hero-footer" variants={scaleIn}>
            <a href="https://github.com/gqy20" target="_blank" rel="noopener noreferrer">
              <FaGithub /> GitHub
            </a>
            <span className="hero-footer__dot" />
            <span>{stats.repos} 个公开仓库</span>
          </motion.footer>
        </div>
      </section>
    </main>
  )
}

export default Hero
