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

const leadSystem = {
  name: 'TrumanWorld',
  label: '主角项目',
  title: '一个有记忆的 AI 小镇',
  description: '居民会记住经历、规划行动、形成关系。观察者只能改变环境，不能直接操控想法。',
  built: ['记忆循环', '计划流程', '角色互动', 'Web 界面']
}

const storySystems = [
  {
    name: 'TrumanWorld',
    label: '多智能体世界',
    title: '让智能体拥有记忆和日常',
    description: '从单次对话走向持续生活：角色会记住、计划、互动，并在环境变化中演化。',
    built: ['memory', 'planning', 'simulation']
  },
  {
    name: 'zotero_cli',
    label: '真实工具调用',
    title: '让智能体操作文献库',
    description: 'Claude Code 和 Codex 可以直接检索 Zotero、阅读 PDF、管理标注并生成引用。',
    built: ['Go CLI', 'Zotero', 'PDF workflow']
  },
  {
    name: 'TrendPluse',
    label: '自动化情报',
    title: '捕捉 AI 生态趋势',
    description: '从 GitHub 动态中追踪 AI 编程和智能体生态，用模型生成结构化洞察。',
    built: ['data pipeline', 'LLM analysis', 'reports']
  }
]

const capabilities = [
  {
    title: '智能体架构',
    description: '设计记忆、角色、计划、协作和反馈机制。',
    projects: ['TrumanWorld', 'IssueLab', 'mind']
  },
  {
    title: '工具接口',
    description: '用 MCP、CLI、API 把外部能力接入模型。',
    projects: ['article-mcp', 'crawl-mcp', 'zotero_cli']
  },
  {
    title: '工作流自动化',
    description: '把一次提示词实验变成可重复运行的系统。',
    projects: ['TrendPluse', 'minimax-studio', 'rss2cubox']
  },
  {
    title: 'AI 开发工具',
    description: '分析、扩展和优化 AI coding 工作流。',
    projects: ['cc-insights', 'Skills_demo', 'cc_plugins']
  }
]

const scenes = [
  ['知识工作', '文献检索、PDF 阅读、标注管理和报告生成。'],
  ['开发效率', 'AI coding 数据分析、插件扩展和技能工作流。'],
  ['信息分析', '从 RSS、GitHub 和领域数据中提取趋势信号。'],
  ['创作自动化', '把动画、配音、音乐和视频流程串成工具链。']
]

const moreSystems = [
  'IssueLab',
  'manim-agent',
  'article-mcp',
  'crawl-mcp',
  'genome-mcp',
  'protein-mcp',
  'cc-insights',
  'minimax-studio'
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
            </p>
            <div className="ai-actions">
              <a href="#systems" className="ai-button ai-button-primary">
                查看代表系统 <FaArrowRight />
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
                ['工具调用接口', 'MCP、CLI、API 与真实数据'],
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
                <strong>{storySystems.length}</strong>
                <span>代表系统</span>
              </div>
            </div>
          </motion.aside>
        </div>
      </section>

      <section className="ai-section lead-section" id="systems">
        <div className="ai-shell lead-layout">
          <div className="ai-section-heading">
            <p>主故事</p>
            <h2>{leadSystem.title}</h2>
          </div>
          <motion.article
            className="lead-card"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.42 }}
          >
            <span>{leadSystem.label}</span>
            <h3>{leadSystem.name}</h3>
            <p>{leadSystem.description}</p>
            <div className="built-line">
              <strong>我构建了</strong>
              {leadSystem.built.map(item => <em key={item}>{item}</em>)}
            </div>
            <div className="experiment-actions">
              {getProject(leadSystem.name)?.url && (
                <a href={getProject(leadSystem.name).url} target="_blank" rel="noreferrer">
                  <FaGithub /> GitHub
                </a>
              )}
              {getProject(leadSystem.name)?.homepage && (
                <a href={getProject(leadSystem.name).homepage} target="_blank" rel="noreferrer">
                  <FaExternalLinkAlt /> 访问
                </a>
              )}
            </div>
          </motion.article>
        </div>
      </section>

      <section className="ai-section systems-section">
        <div className="ai-shell">
          <div className="ai-section-heading heading-row">
            <div>
              <p>代表系统</p>
              <h2>三个项目，串起我的 AI 构建方向。</h2>
            </div>
            <a href="#/projects" className="text-link">
              全部项目 <FaArrowRight />
            </a>
          </div>

          <div className="system-grid story-grid">
            {storySystems.map((system, index) => {
              const project = getProject(system.name)
              return (
                <motion.article
                  className="system-card story-card"
                  key={system.name}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.42, delay: index * 0.05 }}
                >
                  <div className="system-topline">
                    <span>{system.label}</span>
                  </div>
                  <h3>{system.name}</h3>
                  <h4>{system.title}</h4>
                  <p>{system.description}</p>
                  <div className="built-line compact">
                    {system.built.map(item => <em key={item}>{item}</em>)}
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

      <section className="ai-section capability-section">
        <div className="ai-shell capability-layout">
          <div className="ai-section-heading sticky-heading">
            <p>能力</p>
            <h2>我能做什么。</h2>
          </div>
          <div className="capability-list">
            {capabilities.map((item, index) => (
              <motion.article
                className="capability-item"
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.42, delay: index * 0.05 }}
              >
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

      <section className="ai-section scenes-section">
        <div className="ai-shell">
          <div className="ai-section-heading">
            <p>场景</p>
            <h2>可以落地在哪里。</h2>
          </div>
          <div className="scene-grid">
            {scenes.map(([title, description], index) => (
              <motion.article
                className="scene-card"
                key={title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.42, delay: index * 0.04 }}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="ai-section more-section">
        <div className="ai-shell more-layout">
          <div className="ai-section-heading">
            <p>更多实验</p>
            <h2>围绕智能体、工具接口和自动化继续扩展。</h2>
          </div>
          <div className="tool-layer-map">
            {moreSystems.map(project => (
              <a href={getProject(project)?.url || '#/projects'} key={project} target={getProject(project)?.url ? '_blank' : undefined} rel="noreferrer">
                {project}
              </a>
            ))}
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
