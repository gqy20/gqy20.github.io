import { useEffect, useMemo, useState } from 'react'
import { useProjectsData } from '../hooks/useProjectsData.js'
import { motion } from 'framer-motion'
import {
  FaArrowRight,
  FaEnvelope,
  FaExternalLinkAlt,
  FaGithub
} from 'react-icons/fa'
import './Hero.css'

const featuredProjects = [
  {
    name: 'TrumanWorld',
    label: '主角项目',
    title: '一个有记忆的 AI 小镇',
    description: '居民会记住经历、规划行动、形成关系。观察者只能改变环境，不能直接操控想法。',
    tags: ['Multi-Agent', '社会模拟', '11⭐'],
  },
  {
    name: 'zotero_cli',
    label: 'AI 原生工具',
    title: '让智能体操作文献库',
    description: '为 Claude Code 等 AI Agent 设计——直接检索 Zotero、阅读 PDF、管理标注并生成引用。',
    tags: ['Go CLI', 'Zotero', '4⭐'],
  },
  {
    name: 'IssueLab',
    label: '多智能体协作',
    title: '用 Issue 组织科研讨论',
    description: '基于 GitHub Issues 的多智能体讨论网络，支持跨仓库数字分身协作。',
    tags: ['Multi-Agent', 'GitHub Issues', '11⭐'],
  },
  {
    name: 'article-mcp',
    label: 'MCP 起点',
    title: '让智能体检索论文',
    description: '文献检索 MCP 工具，发布 PyPI v0.2.2。从 MCP 协议发布后开始构建的第一个项目。',
    tags: ['MCP', 'PyPI', '13⭐'],
  },
]

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

  const getProject = (name) => projectsByName.get(name)

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
            <p className="ai-kicker">Qingyu Ge / AI Agent / 自动化</p>
            <h1>让 AI 从回答问题，走向完成工作。</h1>
            <p className="ai-lede">
              我构建能理解任务、调用工具、处理上下文并持续迭代的智能体系统，
              关注 AI 在知识工作、开发效率、信息分析和自动化流程中的落地。
              一年四个阶段，从消费者到 Agent 社会构建者。
            </p>
            <div className="ai-actions">
              <a href="#/journey" className="ai-button ai-button-primary">
                查看完整旅程 <FaArrowRight />
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

      <section className="ai-section featured-section">
        <div className="ai-shell">
          <div className="ai-section-heading heading-row">
            <div>
              <p>代表项目</p>
              <h2>四个阶段的里程碑。</h2>
            </div>
            <a href="#/journey" className="text-link">
              完整时间线 <FaArrowRight />
            </a>
          </div>

          <div className="featured-grid">
            {featuredProjects.map((fp, index) => {
              const project = getProject(fp.name)
              return (
                <motion.article
                  className="system-card story-card"
                  key={fp.name}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.42, delay: index * 0.08 }}
                >
                  <div className="system-topline">
                    <span>{fp.label}</span>
                  </div>
                  <h3>{fp.name}</h3>
                  <h4>{fp.title}</h4>
                  <p>{fp.description}</p>
                  <div className="built-line compact">
                    {fp.tags.map(tag => <em key={tag}>{tag}</em>)}
                  </div>
                  <div className="experiment-actions">
                    {project?.url && (
                      <a href={project.url} target="_blank" rel="noreferrer">
                        <FaGithub /> GitHub
                      </a>
                    )}
                    {project?.homepage && (
                      <a href={project.homepage} target="_blank" rel="noreferrer">
                        <FaExternalLinkAlt /> 访问
                      </a>
                    )}
                  </div>
                </motion.article>
              )
            })}
          </div>
        </div>
      </section>

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
