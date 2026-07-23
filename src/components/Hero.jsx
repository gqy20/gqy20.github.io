import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { gsap, SplitText, useGSAP } from '../lib/gsap.js'
import { useProjectsData } from '../hooks/useProjectsData.js'
import blogIndex from '../data/blog/index.json'
import { SOCIAL_LINKS } from '../data/social.js'
import { timelineStages } from '../data/timeline.js'
import { GIT_COURSE } from '../data/gitCourse.js'
import LanguageIcon from './LanguageIcon.jsx'
import AgentWorkflow from './AgentWorkflow.jsx'
import GitCourseGraph from './GitCourseGraph.jsx'
import RunMode from './RunMode.jsx'
import './Hero.css'

const SECTIONS = [
  { id: 'about',     num: '01', label: 'ABOUT' },
  { id: 'stack',     num: '02', label: 'STACK' },
  { id: 'now',       num: '03', label: 'NOW' },
  { id: 'work',      num: '04', label: 'WORK' },
  { id: 'course',    num: '05', label: 'COURSE' },
  { id: 'stages',    num: '06', label: 'STAGES' },
  { id: 'writing',   num: '07', label: 'WRITING' },
  { id: 'elsewhere', num: '08', label: 'ELSEWHERE' },
]

const PAGE_LINKS = [
  { href: '#/projects', label: 'PROJECTS' },
  { href: '#/courses/git', label: 'COURSES' },
  { href: '#/blog',    label: 'BLOG' },
  { href: '#/journey', label: 'JOURNEY' },
]

const NOW_PROJECTS = ['TrumanWorld', 'biotools_agent', 'IssueLab']

const SELECTED_WORK = [
  'TrumanWorld', 'article-mcp', 'IssueLab',
  'Aura', 'zotero_cli', 'cc-insights',
]

// 项目数据快照:与 src/data/projects.json 同步,用于 loading / fallback 占位,
// 避免数据未加载时闪现过时的旧数字。projects.json 增长后记得同步这里。
const STATS_SNAPSHOT = {
  totalProjects: 43,
  totalStars: 83,
}

const NOW_DESC = {
  'TrumanWorld': 'AI 居民拥有记忆、关系和自由意志的社会模拟',
  'biotools_agent': '基于 Claude Agent SDK 的生物信息学仓库分析 Agent',
  'IssueLab':    '让数字分身在 GitHub Issues 中协作的多智能体网络',
}

const AGENT_STACK = [
  {
    name: 'Claude Agent SDK',
    role: '可执行的 Python Agent 工作流',
    detail: '14 个项目覆盖 SDK 0.1.18 到 0.2.110 的完整迭代，并在 TrendPluse 中形成生产级重试、超时、指标和结构化输出模式。',
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

function ModelScopeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M2.667 5.333V8H0v5.333h2.667v-2.666H.5V8.5h2.166v2.166h2.666V8H8V5.333Zm0 8v5.334H8V16H5.333v-2.667Zm13.333-8V8h2.667v2.667h2.666V8.5H23.5v2.166h-2.166v2.666H24V8h-2.667V5.333Zm5.333 8h-2.666V16H16v2.667h5.333zM8 10.667v2.666h2.667v-2.666zm2.667 2.666V16h2.666v-2.667zm2.666 0H16v-2.666h-2.667z" />
    </svg>
  )
}

function isExternal(url) {
  return url.startsWith('http') || url.startsWith('mailto:')
}

export default function Hero() {
  const { data: projectData, loading } = useProjectsData()
  const [activeSection, setActiveSection] = useState('about')
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [isRunModeOpen, setIsRunModeOpen] = useState(false)
  const runTriggerRef = useRef(null)
  const openRunMode = useCallback(() => setIsRunModeOpen(true), [])
  const closeRunMode = useCallback(() => {
    setIsRunModeOpen(false)
    window.requestAnimationFrame(() => runTriggerRef.current?.focus())
  }, [])

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

  const rootRef = useRef(null)

  // 名字标题:逐字上浮入场(mount 时执行一次)
  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add({
      isReduce: '(prefers-reduced-motion: reduce)',
      isNormal: '(prefers-reduced-motion: no-preference)'
    }, ({ conditions }) => {
      const { isReduce: reduce } = conditions
      const zh = SplitText.create('.home-name__zh', { type: 'chars' })
      const en = SplitText.create('.home-name__en', { type: 'chars' })
      gsap.from(
        [...zh.chars, ...en.chars],
        reduce
          ? { duration: 0 }
          : { yPercent: 60, opacity: 0, duration: 0.6, ease: 'back.out(1.5)', stagger: 0.05 }
      )
    })
    return () => mm.revert()
  }, { scope: rootRef })

  // 统计数字:从 0 计数(数据加载完成后触发)
  useGSAP(() => {
    if (loading) return
    const mm = gsap.matchMedia()
    mm.add({
      isReduce: '(prefers-reduced-motion: reduce)',
      isNormal: '(prefers-reduced-motion: no-preference)'
    }, ({ conditions }) => {
      const { isReduce: reduce } = conditions
      gsap.from(
        '.js-stat',
        reduce
          ? { duration: 0 }
          : { textContent: 0, duration: 1.6, ease: 'power2.out', snap: { textContent: 1 }, stagger: 0.18 }
      )
    })
    return () => mm.revert()
  }, { scope: rootRef, dependencies: [loading] })

  // 各 section 标题(ABOUT/STACK/...):逐字入场(进视口时)
  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add({
      isReduce: '(prefers-reduced-motion: reduce)',
      isNormal: '(prefers-reduced-motion: no-preference)'
    }, ({ conditions }) => {
      const { isReduce: reduce } = conditions
      gsap.utils.toArray('.home-section__title').forEach((label) => {
        const split = SplitText.create(label, { type: 'chars' })
        gsap.from(
          split.chars,
          reduce
            ? { duration: 0 }
            : { yPercent: 60, opacity: 0, duration: 0.5, ease: 'back.out(1.5)', stagger: 0.04, scrollTrigger: { trigger: label, start: 'top 85%', once: true } }
        )
      })
    })
    return () => mm.revert()
  }, { scope: rootRef })

  const handleNavClick = (e, id) => {
    e.preventDefault()
    setIsMobileNavOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const activeSectionData = SECTIONS.find(section => section.id === activeSection) ?? SECTIONS[0]

  const getStackProjectUrl = (project) => {
    return projectsByName[project]?.url || null
  }

  return (
    <div className="home" ref={rootRef}>
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
          <button
            ref={runTriggerRef}
            type="button"
            className="home-run-trigger"
            aria-haspopup="dialog"
            onClick={openRunMode}
          >
            <span className="home-run-trigger__read">READ</span>
            <span aria-hidden="true">/</span>
            <span className="home-run-trigger__run"><i aria-hidden="true" /> RUN</span>
            <span className="home-run-trigger__action">运行这个主页</span>
          </button>
        </div>

        <button
          type="button"
          className="home-nav-toggle"
          aria-expanded={isMobileNavOpen}
          aria-controls="home-section-nav"
          onClick={() => setIsMobileNavOpen(open => !open)}
        >
          <span>{activeSectionData.num} / {String(SECTIONS.length).padStart(2, '0')}</span>
          <span className="home-nav-toggle__label">{activeSectionData.label}</span>
          <span className="home-nav-toggle__action">{isMobileNavOpen ? '关闭' : '章节'}</span>
        </button>

        <nav
          id="home-section-nav"
          className={`home-nav ${isMobileNavOpen ? 'is-open' : ''}`}
          aria-label="主要章节"
        >
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
            <em className="js-stat">{loading ? STATS_SNAPSHOT.totalProjects : projectData?.totalProjects}</em> 个开源项目，
            收获 <em className="js-stat">{loading ? STATS_SNAPSHOT.totalStars : projectData?.totalStars}</em> 颗 stars。
          </p>
          <p>
            我关心的不是一次性的 AI 回答，而是 Agent 如何稳定地使用工具、处理上下文，
            并在真实任务中留下可验证的过程。这个主页记录这些项目、实验和阶段性判断。
          </p>
          <p>
            其中 <em>14</em> 个 Python 项目基于 Claude Agent SDK 构建，
            覆盖了 SDK 从 0.1.18 到 0.2.110 的迭代周期——
            <a href="#/blog/260629_agent_sdk_patterns">复盘沉淀出的 9 个模式</a>。
          </p>
        </SectionShell>

        <SectionShell id="stack" num="02" label="STACK" delay={0.1}>
          <p className="home-section__lede">
            我不是只使用单一 Agent 框架，而是按系统层次组合运行时、状态编排、工具接口、开发环境和协作空间。
          </p>
          <AgentWorkflow />
          <div className="home-stack-grid">
            {AGENT_STACK.map(item => (
              <article key={item.name} className="stack-card">
                <div className="stack-card__head">
                  <h3 className="stack-card__name">{item.name}</h3>
                  <span className="stack-card__role">{item.role}</span>
                </div>
                <p className="stack-card__detail">{item.detail}</p>
                {item.projects.length > 0 && (
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
                )}
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
          <p className="home-section__lede">这些项目对应我对 Agent 系统的几个判断：工具接口、知识工作、Claude Agent SDK、自动化流程、多智能体协作和移动端情感交互。</p>
          <div className="home-work-grid">
            {SELECTED_WORK.map(name => {
              const p = projectsByName[name]
              if (!p) return null
              return <WorkCard key={name} project={p} />
            })}
          </div>
          <p className="home-work-more">
            <a href="#/projects">查看全部 {projectData?.totalProjects ?? STATS_SNAPSHOT.totalProjects} 个项目 →</a>
          </p>
        </SectionShell>

        <SectionShell id="course" num="05" label="COURSE" delay={0.23}>
          <a href="#/courses/git" className="home-course-feature">
            <div className="home-course-feature__visual" aria-hidden="true">
              <GitCourseGraph compact />
            </div>
            <div className="home-course-feature__copy">
              <span className="home-course-feature__label">{GIT_COURSE.episodes.length} 集 · {GIT_COURSE.totalDuration} · 4K</span>
              <h3>看得见的 Git</h3>
              <p>从对象、暂存区和 commit 开始，一路画到 branch、HEAD、merge、rebase 与撤销。</p>
              <span className="home-course-feature__link">进入课程 →</span>
            </div>
          </a>
        </SectionShell>

        <SectionShell id="stages" num="06" label="STAGES" delay={0.25}>
          <p className="home-section__lede">一年时间，四个阶段。每个阶段都有一次思维方式的更新。</p>
          <ol className="home-stages">
            {timelineStages.map((stage, i) => (
              <li key={stage.id} className="home-stage">
                <div className="home-stage__head">
                  <span className="home-stage__num">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="home-stage__name">{stage.label}</h3>
                  <span className="home-stage__range">{stage.period}</span>
                </div>
                <p className="home-stage__desc">{stage.theme}</p>
                <p className="home-stage__outputs">
                  <span className="home-stage__outputs-label">关键产出</span>
                  {stage.projects.slice(0, 3).map((p, i2) => (
                    <span key={p.name} className="home-stage__output">
                      {i2 > 0 && <span className="home-stage__sep">·</span>}
                      {p.name}
                    </span>
                  ))}
                </p>
                <p className="home-stage__learned">{stage.stageInsight}</p>
              </li>
            ))}
          </ol>
        </SectionShell>

        <SectionShell id="writing" num="07" label="WRITING" delay={0.3}>
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

        <SectionShell id="elsewhere" num="08" label="ELSEWHERE" delay={0.35}>
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
            <span>Built with React + Framer Motion + GSAP</span>
            <span>·</span>
            <span>Last updated 2026.07</span>
          </footer>
        </SectionShell>
      </main>
      <RunMode open={isRunModeOpen} onClose={closeRunMode} projects={projectData?.allProjects} />
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
      <span className="work-card__marker" aria-hidden="true" />
      <div className="work-card__head">
        <h3 className="work-card__name">{project.name}</h3>
        {project.stars > 0 && <span className="work-card__stars">{project.stars}★</span>}
      </div>
      <p className="work-card__desc">{project.description}</p>
      <div className="work-card__meta">
        <span className="work-card__lang"><LanguageIcon language={project.language} /></span>
        <span className="work-card__category">{project.category}</span>
        <span className="work-card__arrow" aria-hidden="true">↗</span>
      </div>
    </a>
  )
}
