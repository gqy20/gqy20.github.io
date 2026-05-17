import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FaGithub, FaEnvelope, FaGlobe } from 'react-icons/fa'
import { SiGitee, SiBilibili } from 'react-icons/si'
import { useProjectsData } from '../hooks/useProjectsData.js'
import blogIndex from '../data/blog/index.json'
import LanguageIcon from './LanguageIcon.jsx'
import './Hero.css'

const SECTIONS = [
  { id: 'about',     num: '01', label: 'ABOUT' },
  { id: 'stack',     num: '02', label: 'STACK' },
  { id: 'now',       num: '03', label: 'NOW' },
  { id: 'work',      num: '04', label: 'WORK' },
  { id: 'stages',    num: '05', label: 'STAGES' },
  { id: 'writing',   num: '06', label: 'WRITING' },
  { id: 'elsewhere', num: '07', label: 'ELSEWHERE' },
]

const PAGE_LINKS = [
  { href: '#/projects', label: 'PROJECTS' },
  { href: '#/blog',    label: 'BLOG' },
  { href: '#/journey', label: 'JOURNEY' },
]

const NOW_PROJECTS = ['TrumanWorld', 'biotools_agent', 'IssueLab']

const SELECTED_WORK = [
  'TrumanWorld', 'article-mcp', 'IssueLab',
  'biotools_agent', 'zotero_cli', 'TrendPluse',
]

const NOW_DESC = {
  'TrumanWorld': 'AI 居民拥有记忆、关系和自由意志的社会模拟',
  'article-mcp': '一行命令把 PubMed 接进 Claude，文献检索的 MCP',
  'biotools_agent': '基于 Claude Agent SDK 的生物信息学仓库分析 Agent',
  'IssueLab':    '让数字分身在 GitHub Issues 中协作的多智能体网络',
}

const AGENT_STACK = [
  {
    name: 'Claude Agent SDK',
    role: '可执行的 Python Agent 工作流',
    detail: '5 个项目覆盖 0.1.18 到 0.1.69，并在 TrendPluse 中形成生产级重试、超时、指标和结构化输出模式。',
    projects: ['IssueLab', 'rss2cubox', 'manim-agent', 'mind', 'biotools_agent'],
  },
  {
    name: 'Koog',
    role: 'Android 端 Agent 运行时',
    detail: '在 Aura 中接入 Koog 0.8.0，构建可流式对话、可调用本地工具、带记忆和关系状态的 Android AI 陪伴应用。',
    projects: ['Aura'],
  },
  {
    name: 'LangGraph',
    role: '多主体状态编排与世界演化',
    detail: '支撑 TrumanWorld 的记忆、关系、规则治理、事件时间线和多 Agent 协同。',
    projects: ['TrumanWorld'],
  },
  {
    name: 'MCP / FastMCP',
    role: '把外部能力包装成 Agent 工具',
    detail: '把文献、网页、生物数据和领域分析能力接入 Agent 的上下文与行动链路。',
    projects: ['article-mcp', 'crawl-mcp', 'genome-mcp', 'protein-mcp'],
  },
  {
    name: 'Agno',
    role: '领域多 Agent 流水线原型',
    detail: '在 gene-family-agent 中用于农学基因家族分析多智能体原型，随后完整迁移到 Claude Agent SDK。',
    projects: ['gene-family-agent'],
  },
  {
    name: 'Claude Code Skills / Plugins',
    role: '扩展 AI 编程工作台',
    detail: '围绕 Claude Code 做技能、插件和使用数据分析，让开发流程本身变成可增强对象。',
    projects: ['Skills_demo', 'cc_plugins', 'cc-insights'],
  },
  {
    name: 'GitHub Issues',
    role: '可追踪的多 Agent 协作空间',
    detail: '把讨论、分歧、观点演化和最终结论沉淀在 Issues 中，而不是只保留一次性答案。',
    projects: ['IssueLab'],
  },
]

const STACK_PROJECT_LINKS = {
  Aura: 'https://github.com/gqy20/Aura',
  'gene-family-agent': 'https://github.com/gqy20/gene-family-agent',
}

const STAGES_DATA = [
  {
    num: '01',
    name: 'AI 消费者',
    range: '2025.04 → 2025.06',
    desc: '调用 API · 写脚本 · 看官方文档',
    keyOutputs: ['pub2tts', 'ai_coding', 'SLAIS'],
    learned: '把现成的 LLM 当成万能锤，能解决问题但很快就到天花板。',
  },
  {
    num: '02',
    name: 'MCP 采用者',
    range: '2025.07 → 2025.11',
    desc: '把现有工作包装成 LLM 可调用的工具',
    keyOutputs: ['article-mcp · 14★', 'genome-mcp', 'protein-mcp'],
    learned: '工具协议比工具本身更值钱——一个好接口能让别人的 Agent 直接用上你的工作。',
  },
  {
    num: '03',
    name: 'Agent 工程实践者',
    range: '2025.12 → 2026.02',
    desc: '用 Claude Agent SDK、Skills 和自动化流程构建可运行的 Agent',
    keyOutputs: ['mind', 'biotools_agent', 'manim-agent', 'rss2cubox'],
    learned: 'Agent 不是「会用工具的 LLM」，而是「会管理上下文、调用工具并留下过程的进程」。',
  },
  {
    num: '04',
    name: 'Agent 社会构建者',
    range: '2026.03 → 现在',
    desc: '让多个 Agent 协作、涌现、进化',
    keyOutputs: ['TrumanWorld', 'IssueLab', 'manim-agent'],
    learned: '当 Agent 之间能形成稳定的协作结构，新能力就开始涌现——这才是有意思的部分。',
  },
]

const SOCIAL_LINKS = [
  { name: 'GitHub',     url: 'https://github.com/gqy20',                  icon: FaGithub,      label: 'github.com/gqy20' },
  { name: 'Gitee',      url: 'https://gitee.com/gqy20',                   icon: SiGitee,       label: 'gitee.com/gqy20' },
  { name: 'Bilibili',   url: 'https://space.bilibili.com/500302320',      icon: SiBilibili,    label: 'space.bilibili.com/500302320' },
  { name: 'ModelScope', url: 'https://modelscope.cn/user/gqy20',          icon: 'modelscope',  label: 'modelscope.cn/user/gqy20' },
  { name: 'Email',      url: 'mailto:qingyu_ge@foxmail.com',              icon: FaEnvelope,    label: 'qingyu_ge@foxmail.com' },
  { name: 'Site',       url: 'https://home.gqy20.top/',                   icon: FaGlobe,       label: 'home.gqy20.top' },
]

function ModelScopeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2L3 7.5v9L12 22l9-5.5v-9L12 2zm0 2.5l6 3.5-6 3.5-6-3.5 6-3.5zm-7 5.2l6 3.5v6.6l-6-3.5v-6.6zm8 10.1v-6.6l6-3.5v6.6l-6 3.5z" />
    </svg>
  )
}

function isExternal(url) {
  return url.startsWith('http') || url.startsWith('mailto:')
}

export default function Hero() {
  const { data: projectData, loading } = useProjectsData()
  const [activeSection, setActiveSection] = useState('about')

  const projectsByName = useMemo(() => {
    if (!projectData?.allProjects) return {}
    return Object.fromEntries(projectData.allProjects.map(p => [p.name, p]))
  }, [projectData])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) setActiveSection(e.target.id)
        })
      },
      { rootMargin: '-30% 0px -60% 0px' }
    )
    document.querySelectorAll('.home-section').forEach(s => observer.observe(s))
    return () => observer.disconnect()
  }, [loading])

  const handleNavClick = (e, id) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const getStackProjectUrl = (project) => {
    return projectsByName[project]?.url || STACK_PROJECT_LINKS[project] || null
  }

  return (
    <div className="home">
      <motion.aside
        className="home-sidebar"
        initial={{ x: -16, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
      >
        <div className="home-identity">
          <h1 className="home-name">
            <span className="home-name__zh">葛庆宇</span>
            <span className="home-name__en">Qingyu Ge</span>
          </h1>
          <p className="home-role">AI Agent 工程实践者 · MCP / Claude Agent SDK 工具作者</p>
          <p className="home-lede">
            构建能检索资料、调用工具、管理上下文，<br />
            并进入真实工作流的 Agent 系统。
          </p>
        </div>

        <nav className="home-nav" aria-label="主要章节">
          {SECTIONS.map(s => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`home-nav__link ${activeSection === s.id ? 'is-active' : ''}`}
              onClick={(e) => handleNavClick(e, s.id)}
            >
              <span className="home-nav__bar" />
              <span className="home-nav__num">{s.num}</span>
              <span className="home-nav__label">{s.label}</span>
            </a>
          ))}
        </nav>

        <nav className="home-pages" aria-label="页面导航">
          {PAGE_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="home-page-link"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="home-socials">
          {SOCIAL_LINKS.map(link => {
            const Icon = link.icon === 'modelscope' ? ModelScopeIcon : link.icon
            return (
              <a
                key={link.name}
                href={link.url}
                className="home-social"
                target={isExternal(link.url) ? '_blank' : undefined}
                rel={isExternal(link.url) ? 'noopener noreferrer' : undefined}
                aria-label={link.name}
                title={link.name}
              >
                <Icon />
              </a>
            )
          })}
        </div>
      </motion.aside>

      <main className="home-main">
        <SectionShell id="about" num="01" label="ABOUT" delay={0.05}>
          <p>
            我是 <strong>葛庆宇</strong>，从生物信息学背景转向 AI Agent 工程。
            过去一年，我围绕文献检索、MCP 工具、Claude Agent SDK、多智能体协作和自动化工作流做了
            <em>{loading ? '38' : projectData?.totalProjects}</em> 个开源项目，
            收获 <em>{loading ? '72' : projectData?.totalStars}</em> 颗 stars。
          </p>
          <p>
            我关心的不是一次性的 AI 回答，而是 Agent 如何稳定地使用工具、处理上下文，
            并在真实任务中留下可验证的过程。这个主页记录这些项目、实验和阶段性判断。
          </p>
          <p>
            其中 <em>5</em> 个 Python 项目基于 Claude Agent SDK 构建：
            IssueLab、rss2cubox、manim-agent、mind 和 biotools_agent，
            覆盖了 SDK 从 0.1.18 到 0.1.69 的迭代周期。
          </p>
        </SectionShell>

        <SectionShell id="stack" num="02" label="STACK" delay={0.1}>
          <p className="home-section__lede">
            我不是只使用单一 Agent 框架，而是按系统层次组合运行时、状态编排、工具接口、开发环境和协作空间。
          </p>
          <div className="home-stack-grid">
            {AGENT_STACK.map(item => (
              <article key={item.name} className="stack-card">
                <div className="stack-card__head">
                  <h3 className="stack-card__name">{item.name}</h3>
                  <span className="stack-card__role">{item.role}</span>
                </div>
                <p className="stack-card__detail">{item.detail}</p>
                <p className="stack-card__projects">
                  {item.projects.map(project => {
                    const url = getStackProjectUrl(project)
                    if (!url) return <span key={project}>{project}</span>
                    return (
                      <a
                        key={project}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {project}
                      </a>
                    )
                  })}
                </p>
              </article>
            ))}
          </div>
        </SectionShell>

        <SectionShell id="now" num="03" label="NOW" delay={0.15}>
          <p className="home-section__lede">当前重点：长期记忆、多智能体协作、科研工具接口，以及 Claude Agent SDK 的工程化应用。</p>
          <ul className="home-now-list">
            {NOW_PROJECTS.map(name => {
              const p = projectsByName[name]
              if (!p) return null
              return (
                <li key={name}>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="home-now-item">
                    <span className="home-now-item__name">{p.name}</span>
                    <span className="home-now-item__meta">
                      {p.stars > 0 && <span className="home-now-item__stars">{p.stars}★</span>}
                      <span className="home-now-item__lang"><LanguageIcon language={p.language} /></span>
                    </span>
                    <span className="home-now-item__desc">{NOW_DESC[name] || p.description}</span>
                  </a>
                </li>
              )
            })}
          </ul>
        </SectionShell>

        <SectionShell id="work" num="04" label="WORK" delay={0.2}>
          <p className="home-section__lede">这些项目对应我对 Agent 系统的几个判断：工具接口、知识工作、Claude Agent SDK、自动化流程和多智能体协作。</p>
          <div className="home-work-grid">
            {SELECTED_WORK.map(name => {
              const p = projectsByName[name]
              if (!p) return null
              return <WorkCard key={name} project={p} />
            })}
          </div>
          <p className="home-work-more">
            <a href="#/projects">查看全部 {projectData?.totalProjects ?? 38} 个项目 →</a>
          </p>
        </SectionShell>

        <SectionShell id="stages" num="05" label="STAGES" delay={0.25}>
          <p className="home-section__lede">一年时间，四个阶段。每个阶段都有一次思维方式的更新。</p>
          <ol className="home-stages">
            {STAGES_DATA.map(stage => (
              <li key={stage.num} className="home-stage">
                <div className="home-stage__head">
                  <span className="home-stage__num">{stage.num}</span>
                  <h3 className="home-stage__name">{stage.name}</h3>
                  <span className="home-stage__range">{stage.range}</span>
                </div>
                <p className="home-stage__desc">{stage.desc}</p>
                <p className="home-stage__outputs">
                  <span className="home-stage__outputs-label">关键产出</span>
                  {stage.keyOutputs.map((out, i) => (
                    <span key={out} className="home-stage__output">
                      {i > 0 && <span className="home-stage__sep">·</span>}
                      {out}
                    </span>
                  ))}
                </p>
                <p className="home-stage__learned">{stage.learned}</p>
              </li>
            ))}
          </ol>
        </SectionShell>

        <SectionShell id="writing" num="06" label="WRITING" delay={0.3}>
          <p className="home-section__lede">一些关于 Agent、工具接口和 AI 编程工作流的复盘。</p>
          <ul className="home-writing-list">
            {blogIndex.posts.map(post => (
              <li key={post.id}>
                <a href={`#/blog/${post.slug}`} className="home-writing-item">
                  <span className="home-writing-item__date">{post.date.replace(/-/g, '.')}</span>
                  <span className="home-writing-item__title">{post.title}</span>
                  <span className="home-writing-item__time">{post.readTime}</span>
                </a>
              </li>
            ))}
          </ul>
        </SectionShell>

        <SectionShell id="elsewhere" num="07" label="ELSEWHERE" delay={0.35}>
          <p className="home-section__lede">你能在哪里找到我。</p>
          <ul className="home-elsewhere-list">
            {SOCIAL_LINKS.map(link => (
              <li key={link.name}>
                <a
                  href={link.url}
                  target={isExternal(link.url) ? '_blank' : undefined}
                  rel={isExternal(link.url) ? 'noopener noreferrer' : undefined}
                  className="home-elsewhere-item"
                >
                  <span className="home-elsewhere-item__name">{link.name}</span>
                  <span className="home-elsewhere-item__url">{link.label}</span>
                </a>
              </li>
            ))}
          </ul>

          <footer className="home-footer">
            <span>Built with React + Framer Motion</span>
            <span>·</span>
            <span>Last updated 2026.05</span>
          </footer>
        </SectionShell>
      </main>
    </div>
  )
}

function SectionShell({ id, num, label, delay, children }) {
  return (
    <motion.section
      id={id}
      className="home-section"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay, ease: [0.33, 1, 0.68, 1] }}
    >
      <header className="home-section__head">
        <span className="home-section__num">{num}</span>
        <span className="home-section__title">{label}</span>
        <span className="home-section__rule" />
      </header>
      <div className="home-section__body">{children}</div>
    </motion.section>
  )
}

function WorkCard({ project }) {
  return (
    <a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className="work-card"
    >
      <div className="work-card__head">
        <h3 className="work-card__name">{project.name}</h3>
        {project.stars > 0 && <span className="work-card__stars">{project.stars}★</span>}
      </div>
      <p className="work-card__desc">{project.description}</p>
      <div className="work-card__meta">
        <span className="work-card__lang"><LanguageIcon language={project.language} /></span>
        <span className="work-card__category">{project.category}</span>
      </div>
    </a>
  )
}
