import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FaArrowRight,
  FaBookOpen,
  FaCodeBranch,
  FaEnvelope,
  FaExternalLinkAlt,
  FaGithub,
  FaMicroscope,
  FaStar
} from 'react-icons/fa'
import './Hero.css'

const featuredProjectNames = ['article-mcp', 'crawl-mcp', 'genome-mcp', 'TrendPluse']

const focusAreas = [
  {
    title: 'Research MCP Servers',
    description: '把文献、网页、生物数据等科研资源封装成可被 Agent 调用的工具接口。',
    meta: 'MCP / FastMCP / Python',
    icon: FaCodeBranch
  },
  {
    title: 'Scientific Data Tools',
    description: '围绕基因组、蛋白质、文献和知识管理，构建更顺手的数据访问流程。',
    meta: 'Bioinformatics / Literature / Zotero',
    icon: FaMicroscope
  },
  {
    title: 'AI Coding Workflows',
    description: '探索 AI 辅助开发、趋势分析和自动化工作流，让工程实践更可复用。',
    meta: 'AI Coding / Automation / Analysis',
    icon: FaBookOpen
  }
]

const projectNarratives = {
  'article-mcp': '面向科研 Agent 的文献检索 MCP，把论文发现流程接入可编排工具链。',
  'crawl-mcp': '基于 crawl4ai 和 FastMCP 的网页爬取服务，用于网页内容获取与 AI 分析。',
  'genome-mcp': '面向生物信息研究的数据访问工具，降低基因组资源查询和调用成本。',
  TrendPluse: 'GitHub 趋势智能分析工具，用 AI 辅助观察开源生态与项目动向。'
}

const Hero = () => {
  const [projectData, setProjectData] = useState(null)
  const [blogData, setBlogData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [projects, blog] = await Promise.all([
          import('../data/projects.json'),
          import('../data/blog/index.json')
        ])
        setProjectData(projects.default)
        setBlogData(blog.default)
      } catch (error) {
        console.error('Failed to load home data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadHomeData()
  }, [])

  const stats = useMemo(() => ({
    repositories: projectData?.totalRepositories ?? projectData?.totalProjects ?? 0,
    stars: projectData?.totalRepositoryStars ?? projectData?.totalStars ?? 0,
    projects: projectData?.totalProjects ?? 0
  }), [projectData])

  const featuredProjects = useMemo(() => {
    const projects = projectData?.allProjects || []
    return featuredProjectNames
      .map(name => projects.find(project => project.name === name))
      .filter(Boolean)
  }, [projectData])

  const selectedPosts = useMemo(() => {
    const posts = blogData?.posts || []
    return posts
      .filter(post => post.published && !['test-post', 'task-list-demo'].includes(post.id))
      .slice(0, 2)
  }, [blogData])

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-shell hero-grid">
          <motion.div
            className="hero-copy"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <p className="hero-kicker">AI research tools / MCP / scientific workflows</p>
            <h1>Qingyu Ge</h1>
            <p className="hero-lede">
              Building AI tools for research workflows.
            </p>
            <p className="hero-description">
              在读硕士生，专注 MCP、科研自动化、生物信息数据访问与 AI 辅助编程工具。
              我更关心工具如何进入真实研究流程，而不只是完成一次演示。
            </p>

            <div className="hero-actions">
              <a href="#featured-work" className="home-button home-button-primary">
                查看代表项目 <FaArrowRight />
              </a>
              <a
                href="https://github.com/gqy20"
                target="_blank"
                rel="noreferrer"
                className="home-button home-button-secondary"
              >
                <FaGithub /> GitHub
              </a>
            </div>
          </motion.div>

          <motion.aside
            className="hero-panel"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            aria-label="GitHub statistics"
          >
            <img
              src="https://avatars.githubusercontent.com/u/150650455?v=4"
              alt="Qingyu Ge"
              className="hero-portrait"
            />
            <div className="hero-stat-grid">
              <div className="hero-stat">
                <span>{loading ? '...' : stats.repositories}</span>
                <p>公开仓库</p>
              </div>
              <div className="hero-stat">
                <span>{loading ? '...' : stats.stars}</span>
                <p>GitHub Stars</p>
              </div>
              <div className="hero-stat">
                <span>{loading ? '...' : stats.projects}</span>
                <p>展示项目</p>
              </div>
            </div>
          </motion.aside>
        </div>
      </section>

      <section className="home-section">
        <div className="home-shell">
          <div className="section-heading">
            <p>Focus</p>
            <h2>把 AI 能力接到研究工作的具体环节里</h2>
          </div>
          <div className="focus-grid">
            {focusAreas.map((area, index) => {
              const Icon = area.icon
              return (
                <motion.article
                  className="focus-card"
                  key={area.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                >
                  <Icon className="focus-icon" />
                  <h3>{area.title}</h3>
                  <p>{area.description}</p>
                  <span>{area.meta}</span>
                </motion.article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="home-section featured-section" id="featured-work">
        <div className="home-shell">
          <div className="section-heading section-heading-row">
            <div>
              <p>Selected Work</p>
              <h2>代表项目</h2>
            </div>
            <a href="#/projects" className="section-link">
              全部项目 <FaArrowRight />
            </a>
          </div>

          <div className="featured-grid">
            {featuredProjects.map((project, index) => (
              <motion.article
                className="featured-card"
                key={project.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
              >
                <div className="featured-card-top">
                  <span>{project.category}</span>
                  <span className="featured-stars"><FaStar /> {project.stars}</span>
                </div>
                <h3>{project.name}</h3>
                <p>{projectNarratives[project.name] || project.description}</p>
                <div className="project-meta-line">
                  <span>{project.language}</span>
                  {project.latestRelease?.tagName && <span>{project.latestRelease.tagName}</span>}
                  {!project.latestRelease?.tagName && project.latestTag?.name && <span>{project.latestTag.name}</span>}
                </div>
                <div className="featured-actions">
                  <a href={project.url} target="_blank" rel="noreferrer">
                    <FaGithub /> Repo
                  </a>
                  {project.homepage && (
                    <a href={project.homepage} target="_blank" rel="noreferrer">
                      <FaExternalLinkAlt /> Link
                    </a>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section writing-section">
        <div className="home-shell writing-layout">
          <div className="section-heading">
            <p>Writing</p>
            <h2>近期记录</h2>
            <span className="section-note">保留真实项目经验和工具思考，演示文章不放在首页入口。</span>
          </div>
          <div className="writing-list">
            {selectedPosts.map(post => (
              <a className="writing-item" href={`#/blog/${post.slug}`} key={post.id}>
                <span>{post.category} · {post.readTime}</span>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="home-contact">
        <div className="home-shell contact-inner">
          <div>
            <p>Contact</p>
            <h2>欢迎交流科研工具、MCP 和 AI coding workflow。</h2>
          </div>
          <div className="contact-actions">
            <a href="mailto:qingyu_ge@foxmail.com" className="home-button home-button-primary">
              <FaEnvelope /> Email
            </a>
            <a
              href="https://github.com/gqy20"
              target="_blank"
              rel="noreferrer"
              className="home-button home-button-secondary"
            >
              <FaGithub /> GitHub
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Hero
