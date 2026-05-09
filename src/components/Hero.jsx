import { useMemo, useState } from 'react'
import { useProjectsData } from '../hooks/useProjectsData.js'
import { motion, AnimatePresence } from 'framer-motion'
import { FaArrowRight, FaGithub, FaEnvelope, FaGlobe } from 'react-icons/fa'
import { SiGitee, SiBilibili } from 'react-icons/si'
import './Hero.css'

const STAGES = [
  { id: 'consumer', label: 'AI 消费者', short: '消费者' },
  { id: 'mcp-builder', label: 'MCP 采用者', short: 'MCP' },
  { id: 'agent-builder', label: 'Agent 构建者', short: 'Agent' },
  { id: 'agent-society', label: '社会构建者', short: '社会' },
]

const HERO_PROJECTS = ['TrumanWorld', 'zotero_cli', 'article-mcp', 'IssueLab', 'mind']

const SOCIAL_LINKS = [
  { name: 'GitHub', url: 'https://github.com/gqy20', icon: FaGithub },
  { name: 'Gitee', url: 'https://gitee.com/gqy20', icon: SiGitee },
  { name: 'Bilibili', url: 'https://space.bilibili.com/500302320', icon: SiBilibili },
  { name: 'ModelScope', url: 'https://modelscope.cn/user/gqy20', icon: 'modelscope' },
  { name: 'Email', url: 'mailto:qingyu_ge@foxmail.com', icon: FaEnvelope },
  { name: 'Website', url: 'https://home.gqy20.top/', icon: FaGlobe },
]

function ModelScopeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '0.85em', height: '0.85em' }}>
      <path d="M12 2L3 7.5v9L12 22l9-5.5v-9L12 2zm0 2.5l6 3.5-6 3.5-6-3.5 6-3.5zm-7 5.2l6 3.5v6.6l-6-3.5v-6.6zm8 10.1v-6.6l6-3.5v6.6l-6 3.5z"/>
    </svg>
  )
}

function getStageForDate(dateStr) {
  if (!dateStr) return 0
  const d = new Date(dateStr)
  if (d < new Date('2025-07-01')) return 0
  if (d < new Date('2025-12-01')) return 1
  if (d < new Date('2026-03-01')) return 2
  return 3
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.33, 1, 0.68, 1] }
  }
}


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

        {/* Social links — top right */}
        <motion.div
          className="hero-socials"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          {SOCIAL_LINKS.filter(s => s.url).map((link) => {
            const isExternal = link.url.startsWith('http') || link.url.startsWith('mailto:')
            const Icon = link.icon === 'modelscope' ? ModelScopeIcon : link.icon
            return (
              <a
                key={link.name}
                href={link.url}
                className="hero-social"
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                aria-label={link.name}
                title={link.name}
              >
                <Icon />
              </a>
            )
          })}
        </motion.div>

        {/* Content column — left-aligned */}
        <div className="hero-v2__inner">
          {/* Identity */}
          <motion.div className="hero-identity" variants={fadeUp}>
            <span className="hero-avatar">QY</span>
            <div className="hero-identity__text">
              <strong>葛庆宇</strong>
              <span className="hero-identity__sep">/</span>
              <em>Qingyu Ge</em>
            </div>
          </motion.div>

          {/* Role — inline quiet */}
          <motion.p className="hero-role" variants={fadeUp}>
            AI Agent 构建者 · MCP 工具作者 · Multi-Agent 系统架构
          </motion.p>

          {/* Title */}
          <motion.h1 className="hero-title" variants={fadeUp}>
            从 AI 消费者，到{' '}
            <span className="hl-accent">Agent 社会</span>
            <br />构建者。
          </motion.h1>

          {/* CTAs */}
          <motion.div className="hero-actions" variants={fadeUp}>
            <a href="#/journey" className="ai-button ai-button-primary">
              查看完整旅程 <FaArrowRight />
            </a>
            <a href="#projects" className="ai-link">
              浏览全部项目 <FaArrowRight />
            </a>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="hero-scroll"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            <motion.div
              className="hero-scroll__icon"
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </motion.div>
          </motion.div>

        </div>

        {/* Timeline — breaks out, spans full width */}
        <motion.section
          className="hero-timeline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        >
          {/* Timeline header */}
          <div className="timeline-header">
            <span className="timeline-header__label">
              一年四个阶段，{loading ? '...' : stats.projects} 个开源项目
            </span>
          </div>

          {/* Track background line */}
          <div className="timeline-track">
            <div className="timeline-track-fill" />
          </div>

          {/* Time labels */}
          <div className="timeline-labels">
            <span>{timeRange.start}</span>
            <span>{timeRange.end}</span>
          </div>

          {/* Dots + projects — positioned by JS via viewport % */}
          <div className="timeline-dots">
            {timelineProjects.map((project, i) => (
              <motion.button
                key={project.id}
                className={`timeline-dot ${project.isHero ? 'timeline-dot--hero' : ''}`}
                style={{
                  left: `${(i / Math.max(timelineProjects.length - 1, 1)) * 100}%`
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.3,
                  delay: 0.9 + i * 0.06,
                  ease: [0.34, 1.56, 0.64, 1]
                }}
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
                transition={{ duration: 0.16 }}
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
      </section>
    </main>
  )
}

export default Hero
