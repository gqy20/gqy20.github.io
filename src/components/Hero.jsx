import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FaArrowRight,
  FaEnvelope,
  FaExternalLinkAlt,
  FaGithub,
  FaStar
} from 'react-icons/fa'
import './Hero.css'

const workflowNodes = [
  {
    key: 'intent',
    label: 'Intent',
    title: 'Frame the task',
    description: '把模糊需求整理成可执行的目标、约束和上下文。',
    project: 'TrendPluse'
  },
  {
    key: 'agent',
    label: 'Agent',
    title: 'Reason and plan',
    description: '让 AI 系统拆解问题、选择工具，并保留可追踪的推理路径。',
    project: 'manim-agent'
  },
  {
    key: 'tools',
    label: 'Tools',
    title: 'Call capabilities',
    description: '通过 MCP 和自动化接口，把外部能力接入 Agent 工作流。',
    project: 'article-mcp'
  },
  {
    key: 'data',
    label: 'Data',
    title: 'Retrieve context',
    description: '从网页、文献、代码和领域数据中获取足够可靠的上下文。',
    project: 'crawl-mcp'
  },
  {
    key: 'action',
    label: 'Action',
    title: 'Ship outputs',
    description: '把分析结果转成报告、代码、可视化或可复用的工具。',
    project: 'genome-mcp'
  },
  {
    key: 'feedback',
    label: 'Feedback',
    title: 'Measure and improve',
    description: '用使用数据和趋势信号迭代模型协作方式。',
    project: 'cc-insights'
  }
]

const capabilityStack = [
  {
    label: 'Agents',
    title: 'AI systems that plan with tools',
    description: '围绕任务规划、工具调用和反馈回路，构建能持续完成工作的 Agent 原型。'
  },
  {
    label: 'MCP',
    title: 'Tool interfaces for model workflows',
    description: '把检索、爬取、领域数据库和本地能力封装成稳定的模型上下文接口。'
  },
  {
    label: 'Coding',
    title: 'AI coding as an operating layer',
    description: '沉淀 AI 编程、代码分析和工程自动化实践，让开发过程可观察、可复用。'
  },
  {
    label: 'Automation',
    title: 'From prompt to repeatable workflow',
    description: '把一次性的提示词实验，整理成能反复运行、能被改进的工作流系统。'
  }
]

const projectCopy = {
  TrendPluse: {
    role: 'Trend intelligence',
    summary: '用 AI 分析 GitHub 趋势，识别开源生态里的方向、信号和项目变化。'
  },
  'manim-agent': {
    role: 'Agentic creation',
    summary: '探索 Agent 驱动的可视化生成流程，把意图转化成可执行的创作步骤。'
  },
  'article-mcp': {
    role: 'Knowledge retrieval',
    summary: '面向 Agent 的文献检索 MCP，把论文发现接入 AI 工作流。'
  },
  'crawl-mcp': {
    role: 'Web context',
    summary: '基于 crawl4ai 和 FastMCP 获取网页上下文，为 AI 分析提供可调用数据源。'
  },
  'genome-mcp': {
    role: 'Domain tools',
    summary: '把基因组相关数据访问能力封装成 MCP 工具，服务专业场景里的 Agent。'
  },
  'cc-insights': {
    role: 'Coding analytics',
    summary: '分析 Claude Code 使用数据，发现 AI 编程模式并给出改进建议。'
  }
}

const experimentNames = ['TrendPluse', 'article-mcp', 'crawl-mcp', 'manim-agent', 'cc-insights', 'genome-mcp']

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

  const projectsByName = useMemo(() => {
    const projects = projectData?.allProjects || []
    return new Map(projects.map(project => [project.name, project]))
  }, [projectData])

  const stats = useMemo(() => ({
    repositories: projectData?.totalRepositories ?? projectData?.totalProjects ?? 0,
    stars: projectData?.totalRepositoryStars ?? projectData?.totalStars ?? 0,
    projects: projectData?.totalProjects ?? 0
  }), [projectData])

  const experiments = useMemo(() => (
    experimentNames
      .map(name => projectsByName.get(name))
      .filter(Boolean)
  ), [projectsByName])

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
            <p className="ai-kicker">Qingyu Ge / AI systems / Agent workflows / MCP</p>
            <h1>Building AI systems, agents, and workflows.</h1>
            <p className="ai-lede">
              我关注 AI 如何从一次对话变成一套能持续运行的系统：理解意图、调用工具、
              读取上下文、产出行动，并从反馈中改进。
            </p>
            <div className="ai-actions">
              <a href="#workflow" className="ai-button ai-button-primary">
                Explore the stack <FaArrowRight />
              </a>
              <a href="https://github.com/gqy20" target="_blank" rel="noreferrer" className="ai-button ai-button-ghost">
                <FaGithub /> GitHub
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
              <span>Current stack</span>
              <span>live</span>
            </div>
            <div className="signal-grid">
              {workflowNodes.slice(0, 4).map(node => (
                <div className="signal-cell" key={node.key}>
                  <span>{node.label}</span>
                  <strong>{node.project}</strong>
                </div>
              ))}
            </div>
            <div className="signal-stats">
              <div>
                <strong>{loading ? '...' : stats.repositories}</strong>
                <span>repos</span>
              </div>
              <div>
                <strong>{loading ? '...' : stats.stars}</strong>
                <span>stars</span>
              </div>
              <div>
                <strong>{loading ? '...' : stats.projects}</strong>
                <span>projects</span>
              </div>
            </div>
          </motion.aside>
        </div>
      </section>

      <section className="ai-section workflow-section" id="workflow">
        <div className="ai-shell">
          <div className="ai-section-heading">
            <p>Workflow Map</p>
            <h2>AI 不只是模型能力，而是一条可运行的工作流。</h2>
          </div>

          <div className="workflow-map" aria-label="AI workflow map">
            {workflowNodes.map((node, index) => {
              const project = projectsByName.get(node.project)
              return (
                <motion.article
                  className="workflow-node"
                  key={node.key}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.42, delay: index * 0.06 }}
                >
                  <div className="node-index">{String(index + 1).padStart(2, '0')}</div>
                  <div>
                    <span className="node-label">{node.label}</span>
                    <h3>{node.title}</h3>
                    <p>{node.description}</p>
                    <a href={project?.url || '#/projects'} target={project?.url ? '_blank' : undefined} rel="noreferrer">
                      {node.project} <FaArrowRight />
                    </a>
                  </div>
                </motion.article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="ai-section capability-section">
        <div className="ai-shell capability-layout">
          <div className="ai-section-heading sticky-heading">
            <p>Capability Stack</p>
            <h2>从 Agent 到工具接口，再到可观察的 AI coding 实践。</h2>
          </div>
          <div className="capability-list">
            {capabilityStack.map((item, index) => (
              <motion.article
                className="capability-item"
                key={item.label}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.42, delay: index * 0.05 }}
              >
                <span>{item.label}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="ai-section experiments-section" id="featured-work">
        <div className="ai-shell">
          <div className="ai-section-heading heading-row">
            <div>
              <p>Selected Experiments</p>
              <h2>不是项目列表，是 AI 能力栈的实验记录。</h2>
            </div>
            <a href="#/projects" className="text-link">
              All projects <FaArrowRight />
            </a>
          </div>

          <div className="experiment-grid">
            {experiments.map((project, index) => {
              const copy = projectCopy[project.name] || {
                role: project.category,
                summary: project.description
              }
              return (
                <motion.article
                  className="experiment-card"
                  key={project.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.42, delay: index * 0.05 }}
                >
                  <div className="experiment-topline">
                    <span>{copy.role}</span>
                    <span><FaStar /> {project.stars}</span>
                  </div>
                  <h3>{project.name}</h3>
                  <p>{copy.summary}</p>
                  <div className="experiment-meta">
                    <span>{project.language}</span>
                    {(project.latestRelease?.tagName || project.latestTag?.name) && (
                      <span>{project.latestRelease?.tagName || project.latestTag?.name}</span>
                    )}
                  </div>
                  <div className="experiment-actions">
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
              )
            })}
          </div>
        </div>
      </section>

      <section className="ai-section log-section">
        <div className="ai-shell log-layout">
          <div className="ai-section-heading">
            <p>Build Log</p>
            <h2>记录 AI 工具、工作流和开发方式的演化。</h2>
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
            <p>Contact</p>
            <h2>Open to conversations around agents, MCP, and AI-native workflows.</h2>
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
