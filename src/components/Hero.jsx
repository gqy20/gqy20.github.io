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
  { id: 'now',       num: '02', label: 'NOW' },
  { id: 'stages',    num: '03', label: 'STAGES' },
  { id: 'work',      num: '04', label: 'WORK' },
  { id: 'writing',   num: '05', label: 'WRITING' },
  { id: 'elsewhere', num: '06', label: 'ELSEWHERE' },
]

const NOW_PROJECTS = ['TrumanWorld', 'article-mcp', 'IssueLab']

const SELECTED_WORK = [
  'TrumanWorld', 'article-mcp', 'IssueLab',
  'SLAIS', 'zotero_cli', 'TrendPluse',
]

const NOW_DESC = {
  'TrumanWorld': '一个 AI 不知道自己是 AI 的小镇，居民拥有自由意志',
  'article-mcp': '一行命令把 PubMed 接进 Claude，文献检索的 MCP',
  'IssueLab':    '让数字分身在 GitHub Issues 中协作的多智能体网络',
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
    name: 'Agent 构建者',
    range: '2025.12 → 2026.02',
    desc: '让 AI 自己写代码、规划、产出',
    keyOutputs: ['cc-insights', 'gearbox', 'mind', 'justdo'],
    learned: 'Agent 不是「会用工具的 LLM」，而是「会管理自己上下文的进程」。',
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
          <p className="home-role">AI Agent 构建者 · MCP 工具作者</p>
          <p className="home-lede">
            从调用 API，到让 Agent 自己思考——<br />
            我用一年走完了 4 个阶段。
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
            我是 <strong>葛庆宇</strong>，一名从生物信息学背景转向 AI Agent 工程的开发者。
            过去一年，我做了 <em>{loading ? '38' : projectData?.totalProjects}</em> 个开源项目，
            收获 <em>{loading ? '72' : projectData?.totalStars}</em> 颗 stars，
            完成了从「调用 API 的消费者」到「构建 Agent 社会的架构师」的跃迁。
          </p>
          <p>
            我相信工具最终会构建工具，Agent 最终会孕育 Agent。
            这个主页是我的工程笔记，也是对这一年的复盘。
          </p>
        </SectionShell>

        <SectionShell id="now" num="02" label="NOW" delay={0.1}>
          <p className="home-section__lede">现在我在做的 3 件事——也是接下来几个月的重点。</p>
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

        <SectionShell id="stages" num="03" label="STAGES" delay={0.15}>
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

        <SectionShell id="work" num="04" label="WORK" delay={0.2}>
          <p className="home-section__lede">从 38 个项目里挑出最能讲清楚我在做什么的 6 个。</p>
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

        <SectionShell id="writing" num="05" label="WRITING" delay={0.25}>
          <p className="home-section__lede">用文字回过头来梳理这一年里学到的东西。</p>
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

        <SectionShell id="elsewhere" num="06" label="ELSEWHERE" delay={0.3}>
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
