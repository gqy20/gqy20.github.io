import { useEffect, useMemo, useState } from 'react'
import { useProjectsData } from '../hooks/useProjectsData.js'
import { motion } from 'framer-motion'
import {
  FaArrowRight,
  FaEnvelope,
  FaExternalLinkAlt,
  FaGithub
} from 'react-icons/fa'
import TimelineSection from './TimelineSection.jsx'
import './Hero.css'

const Hero = () => {
  const { data: projectData, loading: projectsLoading } = useProjectsData()
  const [blogData, setBlogData] = useState(null)
  const loading = projectsLoading || !blogData

  useEffect(() => {
    import('../data/blog/index.json')
      .then(m => setBlogData(m.default))
      .catch(() => {})
  }, [])

  const projectsByName = useMemo(() => {
    const projects = projectData?.allProjects || []
    return new Map(projects.map(project => [project.name, project]))
  }, [projectData])

  const stats = useMemo(() => ({
    repositories: projectData?.totalRepositories ?? projectData?.totalProjects ?? 0,
    projects: projectData?.totalProjects ?? 0
  }), [projectData])

  const selectedPosts = useMemo(() => {
    const posts = blogData?.posts || []
    return posts
      .filter(post => post.published && !['test-post', 'task-list-demo'].includes(post.id))
      .slice(0, 2)
  }, [blogData])

  return (
    <main className="ai-home">
      <section className="ai-hero">
        <div className="ai-shell ai-hero-grid">
          <motion.div
            className="ai-hero-copy"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <p className="ai-kicker">Qingyu Ge / AI Agent / 2025 → 2026</p>
            <h1>从回答问题，到构建 Agent 社会。</h1>
            <p className="ai-lede">
              一年时间，四个阶段。从调用 API 的消费者，到构建多智能体社会的架构师。
              这条时间线记录了每一步转折——以及行业在同步发生什么。
            </p>
            <div className="ai-actions">
              <a href="#timeline" className="ai-button ai-button-primary">
                查看时间线 <FaArrowRight />
              </a>
              <a href="#/projects" className="ai-button ai-button-secondary">
                浏览全部项目 <FaArrowRight />
              </a>
              <a href="#notes" className="ai-button ai-button-ghost">
                构建记录
              </a>
            </div>
          </motion.div>

          <motion.aside
            className="signal-panel"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
          >
            <div className="signal-header">
              <span>方向</span>
              <span>持续构建中</span>
            </div>
            <div className="signal-list">
              {[
                ['智能体系统', '记忆、计划、协作与反馈'],
                ['工具接口', 'MCP、CLI、API 与真实数据'],
                ['自动化工作流', '从提示词到可运行系统']
              ].map(([label, value]) => (
                <div className="signal-row" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
            <div className="signal-stats">
              <div>
                <strong>{loading ? '...' : stats.repositories}</strong>
                <span>公开仓库</span>
              </div>
              <a href="#/projects" aria-label="浏览全部展示项目">
                <strong>{loading ? '...' : stats.projects}</strong>
                <span>展示项目</span>
              </a>
              <div>
                <strong>4</strong>
                <span>演进阶段</span>
              </div>
            </div>
          </motion.aside>
        </div>
      </section>

      <TimelineSection />

      <section className="ai-section log-section" id="notes">
        <div className="ai-shell log-layout">
          <div className="ai-section-heading">
            <p>记录</p>
            <h2>记录构建过程。</h2>
          </div>
          <div className="log-list">
            {selectedPosts.map(post => (
              <a className="log-item" href={`#/blog/${post.slug}`} key={post.id}>
                <span>{post.category} / {post.readTime}</span>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="ai-contact">
        <div className="ai-shell contact-strip">
          <div>
            <p>联系</p>
            <h2>欢迎交流 AI Agent、工具接口和自动化系统。</h2>
          </div>
          <div className="ai-actions">
            <a href="mailto:qingyu_ge@foxmail.com" className="ai-button ai-button-primary">
              <FaEnvelope /> Email
            </a>
            <a href="https://github.com/gqy20" target="_blank" rel="noreferrer" className="ai-button ai-button-ghost">
              <FaGithub /> GitHub
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Hero
