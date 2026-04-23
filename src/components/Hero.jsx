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

const featuredSystems = [
  {
    name: 'TrumanWorld',
    type: 'Agent simulation',
    statement: '一个 AI 小镇实验：居民拥有记忆、计划与社交关系，观察者只能创造条件，不能直接操控想法。',
    automates: '多智能体生活、交互与社会仿真',
    aiRole: 'generative agents / memory / planning',
    interface: 'FastAPI + Next.js'
  },
  {
    name: 'IssueLab',
    type: 'Agent collaboration',
    statement: '基于 GitHub Issues 的多智能体讨论网络，让观点交锋、数字分身和异步协作留下可追踪轨迹。',
    automates: '讨论组织、观点生成、协作记录',
    aiRole: 'multi-agent debate / digital participants',
    interface: 'GitHub Issues + Python'
  },
  {
    name: 'zotero_cli',
    type: 'AI-native knowledge CLI',
    statement: '让 Claude Code、Codex 等 AI agent 能直接操作 Zotero：检索、阅读 PDF、管理标注、生成引文。',
    automates: '文献库检索、阅读、引用与知识管理',
    aiRole: 'agent-operable research library',
    interface: 'Go CLI'
  },
  {
    name: 'TrendPluse',
    type: 'Intelligence pipeline',
    statement: '追踪 AI 编程工具和智能体生态，用模型从 GitHub 动态中提取趋势信号和结构化洞察。',
    automates: '开源趋势采集、分析与报告生成',
    aiRole: 'trend extraction / report synthesis',
    interface: 'Python + reports'
  },
  {
    name: 'manim-agent',
    type: 'Agentic creation',
    statement: '自然语言到 Manim 动画：Agent 写代码、渲染、审查、迭代，并接入配音和字幕流程。',
    automates: '动画代码生成、渲染评审、视频产出',
    aiRole: 'code generation / visual feedback loop',
    interface: 'Python + Web'
  },
  {
    name: 'article-mcp',
    type: 'Tool interface',
    statement: '把文献检索封装成模型可调用的 MCP 工具，让 agent 能稳定获取论文、摘要和全文上下文。',
    automates: '文献发现与知识检索',
    aiRole: 'MCP tool layer',
    interface: 'FastMCP + PyPI'
  }
]

const capabilityStack = [
  {
    label: 'Agent orchestration',
    title: '让多个智能体能协作、争论、计划和行动。',
    description: '从 TrumanWorld 到 IssueLab，重点不只是调用模型，而是设计智能体之间的关系、记忆、角色和反馈机制。',
    projects: ['TrumanWorld', 'IssueLab', 'mind']
  },
  {
    label: 'Tool interfaces',
    title: '把外部能力变成 AI 可以可靠调用的工具层。',
    description: '用 MCP、CLI 和 API 把文献、网页、生物数据、天文评估、媒体生成等能力接入模型工作流。',
    projects: ['article-mcp', 'crawl-mcp', 'genome-mcp', 'protein-mcp']
  },
  {
    label: 'Knowledge workflows',
    title: '让 AI 进入真实的信息获取、阅读和整理流程。',
    description: '围绕 Zotero、PDF、RSS、PubMed 和 GitHub 趋势，构建可持续运行的知识工作自动化。',
    projects: ['zotero_cli', 'pdfget', 'rss2cubox', 'TrendPluse']
  },
  {
    label: 'Automation products',
    title: '把一次提示词实验打磨成可分发的工具。',
    description: '从 Go/Python CLI 到 Web 应用和报告流水线，关注可重复运行、可观测、可交付的自动化系统。',
    projects: ['minimax-studio', 'justdo', 'flywheel', 'cc-insights']
  },
  {
    label: 'AI coding workflows',
    title: '把 AI 编程从对话变成可观察的工程系统。',
    description: '沉淀 Skills、Claude Code 插件、使用数据分析和仓库审计，让 AI coding 能被度量和改进。',
    projects: ['cc-insights', 'Skills_demo', 'cc_plugins', 'biotools_agent']
  }
]

const applicationFields = [
  {
    field: 'Developer productivity',
    description: '分析 AI coding 使用数据、构建 Skills 面板和插件工作流，让开发过程更可观察。',
    projects: ['cc-insights', 'Skills_demo', 'cc_plugins']
  },
  {
    field: 'Knowledge work',
    description: '让 agent 操作 Zotero、检索论文、阅读 PDF、生成报告，把知识管理变成可执行流程。',
    projects: ['zotero_cli', 'pdfget', 'SLAIS']
  },
  {
    field: 'Information intelligence',
    description: '从 RSS、GitHub、期刊和领域数据中采集信号，自动过滤、分析和输出洞察。',
    projects: ['TrendPluse', 'rss2cubox', 'evo-flywheel']
  },
  {
    field: 'Creative automation',
    description: '把视频、动画、配音、音乐和脚本生成组织成端到端创作流水线。',
    projects: ['manim-agent', 'minimax-studio']
  },
  {
    field: 'Domain tools',
    description: '把生物信息、蛋白结构、天文观测等专业能力封装成 AI 可以使用的工具。',
    projects: ['genome-mcp', 'protein-mcp', 'astro_light_pollution']
  }
]

const toolLayer = [
  { label: 'Literature', projects: ['zotero_cli', 'article-mcp', 'pdfget'] },
  { label: 'Web context', projects: ['crawl-mcp', 'rss2cubox'] },
  { label: 'Biology', projects: ['genome-mcp', 'protein-mcp'] },
  { label: 'Agents', projects: ['TrumanWorld', 'IssueLab', 'mind'] },
  { label: 'Coding', projects: ['cc-insights', 'Skills_demo'] },
  { label: 'Media', projects: ['manim-agent', 'minimax-studio'] }
]

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
            <p className="ai-kicker">Qingyu Ge / AI Agents / Automation</p>
            <h1>Building AI agents and automation systems for real workflows.</h1>
            <p className="ai-lede">
              我关注 AI 如何进入真实工作流：理解任务、调用工具、处理上下文、执行动作，
              并通过反馈持续改进。从多智能体系统到 MCP 工具层，从知识工作到创作自动化。
            </p>
            <div className="ai-actions">
              <a href="#featured-systems" className="ai-button ai-button-primary">
                View systems <FaArrowRight />
              </a>
              <a href="#build-notes" className="ai-button ai-button-ghost">
                Build notes
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
              <span>Portfolio signal</span>
              <span>active</span>
            </div>
            <div className="signal-grid">
              {[
                ['Agent systems', 'TrumanWorld / IssueLab'],
                ['Tool layer', 'MCP / CLI / APIs'],
                ['Knowledge work', 'Zotero / PDF / RSS'],
                ['Automation', 'Coding / media / reports']
              ].map(([label, value]) => (
                <div className="signal-cell" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
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
                <strong>{featuredSystems.length}</strong>
                <span>systems</span>
              </div>
            </div>
          </motion.aside>
        </div>
      </section>

      <section className="ai-section systems-section" id="featured-systems">
        <div className="ai-shell">
          <div className="ai-section-heading heading-row">
            <div>
              <p>Featured Systems</p>
              <h2>不是仓库列表，而是模型、工具、数据和行动组成的系统。</h2>
            </div>
            <a href="#/projects" className="text-link">
              All projects <FaArrowRight />
            </a>
          </div>

          <div className="system-grid">
            {featuredSystems.map((system, index) => {
              const project = getProject(system.name)
              return (
                <motion.article
                  className="system-card"
                  key={system.name}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.42, delay: index * 0.05 }}
                >
                  <div className="system-topline">
                    <span>{system.type}</span>
                    {project?.stars !== undefined && (
                      <span><FaStar /> {project.stars}</span>
                    )}
                  </div>
                  <h3>{system.name}</h3>
                  <p>{system.statement}</p>
                  <dl className="system-details">
                    <div>
                      <dt>Automates</dt>
                      <dd>{system.automates}</dd>
                    </div>
                    <div>
                      <dt>AI role</dt>
                      <dd>{system.aiRole}</dd>
                    </div>
                    <div>
                      <dt>Interface</dt>
                      <dd>{system.interface}</dd>
                    </div>
                  </dl>
                  <div className="experiment-actions">
                    {project?.url && (
                      <a href={project.url} target="_blank" rel="noreferrer">
                        <FaGithub /> Repo
                      </a>
                    )}
                    {project?.homepage && (
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

      <section className="ai-section capability-section">
        <div className="ai-shell capability-layout">
          <div className="ai-section-heading sticky-heading">
            <p>Capability Stack</p>
            <h2>主线是 agent system，不是单点工具。</h2>
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
                <div className="project-chips">
                  {item.projects.map(project => (
                    <a href={getProject(project)?.url || '#/projects'} key={project} target={getProject(project)?.url ? '_blank' : undefined} rel="noreferrer">
                      {project}
                    </a>
                  ))}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="ai-section applications-section">
        <div className="ai-shell">
          <div className="ai-section-heading">
            <p>Application Fields</p>
            <h2>同一套 agent + tool + automation 方法，迁移到不同工作场景。</h2>
          </div>
          <div className="application-grid">
            {applicationFields.map((field, index) => (
              <motion.article
                className="application-card"
                key={field.field}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.42, delay: index * 0.04 }}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{field.field}</h3>
                <p>{field.description}</p>
                <div className="project-chips">
                  {field.projects.map(project => (
                    <a href={getProject(project)?.url || '#/projects'} key={project} target={getProject(project)?.url ? '_blank' : undefined} rel="noreferrer">
                      {project}
                    </a>
                  ))}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="ai-section tool-layer-section">
        <div className="ai-shell tool-layer-layout">
          <div className="ai-section-heading">
            <p>Tool Layer</p>
            <h2>把领域能力封装成 AI 可以调用的接口。</h2>
          </div>
          <div className="tool-layer-map">
            {toolLayer.map((group) => (
              <div className="tool-row" key={group.label}>
                <span>{group.label}</span>
                <div>
                  {group.projects.map(project => (
                    <a href={getProject(project)?.url || '#/projects'} key={project} target={getProject(project)?.url ? '_blank' : undefined} rel="noreferrer">
                      {project}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ai-section log-section" id="build-notes">
        <div className="ai-shell log-layout">
          <div className="ai-section-heading">
            <p>Build Notes</p>
            <h2>记录 agent、MCP、AI coding 和自动化系统的构建过程。</h2>
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
            <h2>Open to conversations around AI agents, tool interfaces, and automation systems.</h2>
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
