import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GODOT_RUNTIME_URL } from '../utils/godotRuntime.js'
import './RunMode.css'

const RUN_SECTIONS = [
  { id: 'about', label: 'ABOUT', detail: 'identity / context' },
  { id: 'stack', label: 'STACK', detail: 'memory / tools' },
  { id: 'work', label: 'WORK', detail: 'verified output' },
]

const WORK_NODE_IDS = ['trumanworld', 'issuelab', 'article-mcp']
const SECTION_DEFAULT_NODE = {
  about: 'context',
  stack: 'memory',
  work: 'issuelab',
}
const NODE_SECTION = {
  context: 'about',
  memory: 'stack',
  tools: 'stack',
  trumanworld: 'work',
  issuelab: 'work',
  'article-mcp': 'work',
}

const FALLBACK_PROJECTS = {
  TrumanWorld: {
    name: 'TrumanWorld',
    description: 'AI 居民拥有记忆、关系和自由意志的社会模拟。',
    url: 'https://github.com/gqy20/TrumanWorld',
    homepage: 'https://truman.gqy25.top/',
    language: 'Python',
    stars: 12,
    issues: 28,
    category: 'AI应用',
    tags: ['AI', '多智能体'],
    license: 'MIT License',
  },
  IssueLab: {
    name: 'IssueLab',
    description: '基于 GitHub Issues 的多智能体科研讨论网络，支持跨仓库数字分身协作。',
    url: 'https://github.com/gqy20/IssueLab',
    language: 'Python',
    stars: 11,
    issues: 71,
    category: '科研工具',
    tags: ['科研', '多智能体'],
    license: 'MIT License',
  },
  'article-mcp': {
    name: 'article-mcp',
    description: '把文献检索与结构化结果接入 Agent 工作流的 MCP 工具。',
    url: 'https://github.com/gqy20/article-mcp',
    homepage: 'https://pypi.org/project/article-mcp/',
    language: 'Python',
    stars: 15,
    issues: 1,
    category: 'MCP工具',
    tags: ['MCP', '文献检索'],
    license: 'MIT License',
  },
}

const SYSTEM_NODES = {
  context: {
    id: 'context',
    index: '00',
    type: 'SYSTEM CONTEXT',
    title: '可验证的 Agent 工作流',
    description: '把任务、资料与约束组织成可追踪的上下文，然后交给记忆和工具层处理。',
    status: 'LOADED',
    route: ['CONTEXT'],
    metrics: [
      { label: 'FOCUS', value: 'Agent systems' },
      { label: 'MODE', value: 'Evidence first' },
      { label: 'OUTPUT', value: 'Public work' },
    ],
    tags: ['Context', 'Constraints', 'Evidence'],
  },
  memory: {
    id: 'memory',
    index: '01',
    type: 'MEMORY LAYER',
    title: '持续维护的工程记忆',
    description: '文章、课程、项目记录与阶段判断共同构成长期记忆，让新的工作可以复用已有上下文。',
    status: 'SYNCED',
    route: ['CONTEXT', 'MEMORY'],
    metrics: [
      { label: 'ARTICLES', value: '4 deep dives' },
      { label: 'COURSE', value: '8 Git lessons' },
      { label: 'STAGES', value: '4 iterations' },
    ],
    tags: ['Writing', 'Courses', 'Timeline'],
  },
  tools: {
    id: 'tools',
    index: '02',
    type: 'TOOL INTERFACE',
    title: '把外部能力接入 Agent',
    description: 'MCP、Claude Agent SDK、Koog 与 LangGraph 负责连接资料、代码、状态和多主体协作。',
    status: 'READY',
    route: ['CONTEXT', 'MEMORY', 'TOOLS'],
    metrics: [
      { label: 'SDK', value: 'Claude Agent' },
      { label: 'PROTOCOL', value: 'MCP / FastMCP' },
      { label: 'STATE', value: 'LangGraph' },
    ],
    tags: ['MCP', 'Agent SDK', 'Koog', 'LangGraph'],
  },
}

const INITIAL_LOGS = [
  { id: 0, stamp: '00:00', stage: 'BOOT', message: 'personal runtime waiting for input', tone: 'muted' },
]

const JOURNEY_STAGES = {
  context: {
    index: '01',
    eyebrow: 'SYSTEM INPUT',
    title: '任务成为可追踪的上下文',
    description: '目标、资料与约束被压缩成一个可传递的 Context Packet。',
  },
  memory: {
    index: '02',
    eyebrow: 'MEMORY LAYER',
    title: '工程记忆开始响应',
    description: '项目、文章与阶段判断被重新召回，为下一步行动补全背景。',
  },
  tools: {
    index: '03',
    eyebrow: 'TOOL INTERFACE',
    title: '外部能力接入 Agent',
    description: 'MCP、代码与状态编排被唤醒，把理解转化为可以执行的步骤。',
  },
  output: {
    index: '04',
    eyebrow: 'VERIFIED OUTPUT',
    title: '上下文抵达真实项目',
    description: 'IssueLab 把多智能体协作沉淀进 GitHub Issues，留下公开、可验证的过程。',
  },
}

const PROJECT_TRACES = {
  trumanworld: {
    thesis: '观察一个事件如何穿过记忆、关系与治理规则，最终改变模拟世界的状态。',
    stages: [
      { label: 'WORLD EVENT', title: '事件进入时间线', detail: '新的外部信号被写入共享世界，成为所有居民可感知的事实。' },
      { label: 'AGENT MEMORY', title: '居民读取记忆与关系', detail: '每个 Agent 根据个人记忆、社会关系和当前目标形成不同反应。' },
      { label: 'GOVERNANCE', title: '影响在关系网络传播', detail: '互动受世界规则约束，并继续改变关系、情绪与后续事件。' },
      { label: 'WORLD LEDGER', title: '状态写回世界账本', detail: '事件结果进入可追踪时间线，成为下一轮行动的新上下文。' },
    ],
  },
  issuelab: {
    thesis: '观察一个科研问题如何进入协作区，经过多智能体讨论后留下公开证据。',
    stages: [
      { label: 'GITHUB ISSUE', title: '问题进入协作区', detail: '研究目标、约束和已有证据被封装成可以持续讨论的 Issue。' },
      { label: 'DIGITAL TWINS', title: '三个角色接管问题', detail: '研究、审阅与综合 Agent 分别从不同职责读取同一上下文。' },
      { label: 'DISCUSSION', title: '观点与证据形成线程', detail: 'Agent 互相质询、补充来源，并把分歧保留在公开讨论记录中。' },
      { label: 'VERIFIED THREAD', title: '结论写回 GitHub', detail: '最终判断连同过程证据沉淀为可复查、可继续协作的公开产物。' },
    ],
  },
  'article-mcp': {
    thesis: '观察检索意图如何被转换成工具调用，并返回 Agent 可以继续处理的结构化证据。',
    stages: [
      { label: 'SEARCH INTENT', title: '意图变成检索参数', detail: '主题、时间、来源与数量限制被整理成明确的 MCP 工具输入。' },
      { label: 'MULTI SOURCE', title: '并行连接学术来源', detail: 'Crossref、PubMed 与 OpenAlex 返回不同覆盖范围的候选记录。' },
      { label: 'EVIDENCE FILTER', title: '结果去重并过滤', detail: '标识符、标题和元数据被统一，低相关或重复记录被移除。' },
      { label: 'STRUCTURED RESULT', title: '证据返回 Agent', detail: '标准化文献结果连同来源信息返回工作流，支持后续分析与引用。' },
    ],
  },
}

const PROJECT_EVIDENCE = {
  trumanworld: {
    eyebrow: 'LIVE SYSTEM / DIRECTOR CONSOLE',
    title: '事件可以回放，关系变化有账本',
    summary: 'TrumanWorld 已打通世界快照、事件时间线、Agent 详情与导演干预。这里展示的是仓库中真实运行界面，而不是概念稿。',
    visual: {
      type: 'image',
      src: 'https://raw.githubusercontent.com/gqy20/TrumanWorld/main/docs/images/world-view.jpg',
      alt: 'TrumanWorld 导演控制台的真实世界视图，显示小镇地图、AI 居民位置与状态面板',
      caption: 'WORLD VIEW / docs/images/world-view.jpg',
    },
    facts: [
      { label: 'BACKEND', value: '637 tests' },
      { label: 'FRONTEND', value: '148 tests' },
      { label: 'SCENARIOS', value: '2 worlds' },
    ],
    links: [
      { label: '查看世界视图', href: 'https://github.com/gqy20/TrumanWorld/blob/main/docs/images/world-view.jpg' },
      { label: '查看事件回放', href: 'https://github.com/gqy20/TrumanWorld/blob/main/docs/images/event-timeline.png' },
      { label: '打开导演控制台', href: 'https://truman.gqy25.top/' },
    ],
  },
  issuelab: {
    eyebrow: 'PUBLIC THREAD / ISSUE #188',
    title: '一次文献误报，留下可复查判断',
    summary: 'Issue #188 从摘要缺失和零关键词命中出发，经过 moderator 与 pubmed_observer 独立复核，最终保留一篇、剔除一篇，并提出四项流水线修复建议。',
    visual: {
      type: 'thread',
      items: [
        { role: 'moderator', action: '发现摘要缺失与 0 关键词匹配', tone: 'warn' },
        { role: 'pubmed_observer', action: '使用 NCBI E-utilities 独立验证', tone: 'flow' },
        { role: 'observer', action: '阻止重复触发，等待人工确认', tone: 'muted' },
        { role: 'decision', action: '保留 PMID 42086051，剔除噪声候选', tone: 'accent' },
      ],
    },
    facts: [
      { label: 'ISSUE', value: '#188' },
      { label: 'COMMENTS', value: '5 public' },
      { label: 'OUTCOME', value: '1 kept / 1 dropped' },
    ],
    links: [
      { label: '打开完整讨论', href: 'https://github.com/gqy20/IssueLab/issues/188' },
      { label: '查看独立复核', href: 'https://github.com/gqy20/IssueLab/issues/188#issuecomment-4701168292' },
    ],
  },
  'article-mcp': {
    eyebrow: 'PUBLISHED TOOL / v0.2.2',
    title: '一条命令，连接六类学术来源',
    summary: 'article-mcp 以 FastMCP 提供文献搜索、详情、参考文献、关系分析与期刊质量五个工具，并通过 PyPI 直接分发。',
    visual: {
      type: 'terminal',
      lines: [
        '$ uvx article-mcp',
        '→ search_literature',
        '  keyword: "agent memory retrieval"',
        '  sources: [europe_pmc, pubmed, openalex]',
        '← structured articles + identifiers',
      ],
    },
    facts: [
      { label: 'TOOLS', value: '5 core' },
      { label: 'SOURCES', value: '6 connected' },
      { label: 'RELEASE', value: 'v0.2.2' },
    ],
    links: [
      { label: '查看工具定义', href: 'https://github.com/gqy20/article-mcp#5-个核心工具' },
      { label: '打开 PyPI', href: 'https://pypi.org/project/article-mcp/' },
    ],
  },
}

function parseRuntimeMessage(data) {
  if (typeof data !== 'string') return data
  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}

function getRuntimeSupportIssue() {
  if (typeof window === 'undefined' || window.isSecureContext === undefined) return null
  if (!window.isSecureContext) return 'secure-context'
  if (typeof window.WebAssembly === 'undefined') return 'webassembly'

  const canvas = document.createElement('canvas')
  if (!canvas.getContext('webgl2')) return 'webgl2'
  return null
}

function getErrorCopy(reason) {
  if (reason === 'secure-context') return 'Godot Web 需要 HTTPS 安全环境。localhost 可直接运行，局域网 IP 请使用 HTTPS。'
  if (reason === 'webassembly') return '当前浏览器未启用 WebAssembly，无法启动运行拓扑。'
  if (reason === 'webgl2') return '当前浏览器或显卡未提供 WebGL 2，无法绘制运行拓扑。'
  return '运行时仍未响应。可以继续等待，或刷新页面后重试。'
}

function buildProjectNode(project, id, index) {
  return {
    ...project,
    id,
    index,
    type: 'VERIFIED OUTPUT',
    title: project.name,
    description: project.description?.replaceAll('——', '，') || '项目说明正在同步。',
    status: 'RUNNING',
    route: ['CONTEXT', 'MEMORY', 'TOOLS', project.name],
    metrics: [
      { label: 'STARS', value: String(project.stars ?? 0) },
      { label: 'LANGUAGE', value: project.language || 'Unknown' },
      { label: 'ISSUES', value: String(project.issues ?? 0) },
    ],
    tags: project.tags?.length ? project.tags : [project.category].filter(Boolean),
  }
}

function EvidencePanel({ node, shareState, onClose, onShare }) {
  const closeButtonRef = useRef(null)
  const [imageFailed, setImageFailed] = useState(false)
  const evidence = PROJECT_EVIDENCE[node.id]

  useEffect(() => {
    setImageFailed(false)
    closeButtonRef.current?.focus()
  }, [node.id])

  if (!evidence) return null

  return (
    <article className="run-mode__evidence" aria-labelledby={`run-evidence-${node.id}`}>
      <header className="run-mode__evidence-head">
        <div>
          <span>{evidence.eyebrow}</span>
          <h3 id={`run-evidence-${node.id}`}>{evidence.title}</h3>
        </div>
        <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="关闭真实证据档案">×</button>
      </header>

      <div className="run-mode__evidence-body">
        <div className={`run-mode__evidence-visual is-${evidence.visual.type}`}>
          {evidence.visual.type === 'image' && !imageFailed && (
            <figure>
              <img src={evidence.visual.src} alt={evidence.visual.alt} onError={() => setImageFailed(true)} />
              <figcaption>{evidence.visual.caption}</figcaption>
            </figure>
          )}
          {evidence.visual.type === 'image' && imageFailed && (
            <div className="run-mode__evidence-image-fallback" role="status">
              <span>REMOTE ARTIFACT UNAVAILABLE</span>
              <p>真实界面暂时无法载入，可以通过右侧“查看世界视图”直接打开原始文件。</p>
            </div>
          )}
          {evidence.visual.type === 'thread' && (
            <ol aria-label="Issue 188 公开讨论摘要">
              {evidence.visual.items.map((item, index) => (
                <li key={item.role} className={`is-${item.tone}`}>
                  <span>0{index + 1}</span>
                  <div><strong>@{item.role}</strong><p>{item.action}</p></div>
                </li>
              ))}
            </ol>
          )}
          {evidence.visual.type === 'terminal' && (
            <pre aria-label="article-mcp 运行示例"><code>{evidence.visual.lines.join('\n')}</code></pre>
          )}
        </div>

        <div className="run-mode__evidence-content">
          <p>{evidence.summary}</p>
          <dl>
            {evidence.facts.map(fact => (
              <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>
            ))}
          </dl>
          <nav aria-label={`${node.title} 真实证据链接`}>
            {evidence.links.map(link => (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
                {link.label}<span aria-hidden="true">↗</span>
              </a>
            ))}
          </nav>
          <button type="button" className="run-mode__evidence-share" onClick={() => onShare(node.id)}>
            <span aria-hidden="true">⌁</span>
            {shareState === 'copied' ? '体验链接已复制' : shareState === 'error' ? '复制失败，请重试' : '分享这个运行体验'}
          </button>
        </div>
      </div>
    </article>
  )
}

function RuntimeInspector({ node, projectNodes, runtimeState, pathState, projectRun, visitedProjects, onSelect, onRunPath }) {
  const inspectorRef = useRef(null)
  const isProject = node.type === 'VERIFIED OUTPUT'
  const trace = PROJECT_TRACES[node.id]
  const isCurrentRun = projectRun.node === node.id
  const isRunning = isCurrentRun && projectRun.status === 'running'
  const isVisited = visitedProjects.includes(node.id)
  const visibleStage = isCurrentRun ? projectRun.stage : isVisited ? 3 : -1
  const actionLabel = isRunning
    ? 'RUNNING PROJECT'
    : isProject
      ? isVisited ? 'REPLAY PROJECT' : 'ENTER PROJECT'
      : pathState === 'running' ? 'RUNNING PATH' : 'RUN THIS PATH'

  useEffect(() => {
    if (inspectorRef.current) inspectorRef.current.scrollTop = 0
  }, [node.id])

  return (
    <aside ref={inspectorRef} className="run-mode__inspector" aria-label="节点详情" aria-live="polite">
      <header className="run-mode__inspector-head">
        <span>{node.type}</span>
        <span>{node.index} / 05</span>
      </header>

      <div className="run-mode__inspector-title">
        <div>
          <span className="run-mode__node-status"><i aria-hidden="true" /> {node.status}</span>
          <h3>{node.title}</h3>
        </div>
        <span className="run-mode__node-mark" aria-hidden="true">{node.index}</span>
      </div>

      <p className="run-mode__inspector-copy">{node.description}</p>

      <div className="run-mode__route" aria-label={`运行路径：${node.route.join(' 到 ')}`}>
        {node.route.map((step, index) => (
          <span key={step}>
            {index > 0 && <i aria-hidden="true">→</i>}
            <b>{step}</b>
          </span>
        ))}
      </div>

      <dl className="run-mode__metrics">
        {node.metrics.map(metric => (
          <div key={metric.label}>
            <dt>{metric.label}</dt>
            <dd>{metric.value}</dd>
          </div>
        ))}
      </dl>

      <div className="run-mode__tags" aria-label="相关技术">
        {node.tags.map(tag => <span key={tag}>{tag}</span>)}
      </div>

      <button
        type="button"
        className={`run-mode__path-action ${isProject ? 'is-project-action' : ''}`}
        disabled={runtimeState !== 'ready' || pathState === 'running'}
        onClick={() => onRunPath(node.id)}
      >
        <span aria-hidden="true">▶</span>
        <span>
          <strong>{actionLabel}</strong>
          <small>{isRunning ? '项目证据正在生成' : isProject ? '进入这个项目的真实工作流' : pathState === 'running' ? '上下文正在通过运行拓扑' : '让上下文沿当前节点链路运行'}</small>
        </span>
      </button>

      {trace && (
        <section className={`run-mode__dossier ${isRunning ? 'is-running' : ''}`} aria-label={`${node.title} 运行档案`}>
          <header>
            <div>
              <span>PROJECT TRACE</span>
              <p>{trace.thesis}</p>
            </div>
            <strong>{String(Math.max(visibleStage + 1, 0)).padStart(2, '0')} / 04</strong>
          </header>
          <ol>
            {trace.stages.map((stage, index) => (
              <li
                key={stage.label}
                className={`${index < visibleStage ? 'is-complete' : ''} ${index === visibleStage ? 'is-active' : ''}`}
              >
                <i aria-hidden="true">{index < visibleStage ? '✓' : `0${index + 1}`}</i>
                <div>
                  <span>{stage.label}</span>
                  <strong>{stage.title}</strong>
                  <p>{stage.detail}</p>
                </div>
              </li>
            ))}
          </ol>
          {isVisited && !isRunning && (
            <div className="run-mode__dossier-proof">
              <span aria-hidden="true">■</span>
              <p><strong>TRACE VERIFIED</strong>这条工作流已完成，可以重播或进入源码继续检查。</p>
            </div>
          )}
        </section>
      )}

      {isProject && (
        <div className="run-mode__project-links">
          <a href={node.url} target="_blank" rel="noopener noreferrer">查看 GitHub <span aria-hidden="true">↗</span></a>
          {node.homepage && <a href={node.homepage} target="_blank" rel="noopener noreferrer">打开项目 <span aria-hidden="true">↗</span></a>}
        </div>
      )}

      <div className="run-mode__outputs">
        <p>CONNECTED OUTPUTS <span>{visitedProjects.length} / {projectNodes.length} VERIFIED</span></p>
        <div>
          {projectNodes.map(project => (
            <button
              key={project.id}
              type="button"
              className={project.id === node.id ? 'is-selected' : ''}
              aria-pressed={project.id === node.id}
              onClick={() => onSelect(project.id)}
            >
              <span>{visitedProjects.includes(project.id) && <i aria-hidden="true">✓</i>}{project.title}</span>
              <small>{visitedProjects.includes(project.id) ? 'SEEN' : `${project.metrics[0].value}★`}</small>
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}

function ExecutionLog({ logs, activeSection, runtimeState }) {
  return (
    <footer className="run-mode__console">
      <div className="run-mode__console-label">
        <span>EXECUTION LOG</span>
        <small>{runtimeState === 'ready' ? 'STREAM ONLINE' : 'AWAITING RUNTIME'}</small>
      </div>
      <ol role="log" aria-live="polite">
        {logs.map(log => (
          <li key={log.id} className={`is-${log.tone || 'default'}`}>
            <time>{log.stamp}</time>
            <strong>{log.stage}</strong>
            <span>{log.message}</span>
          </li>
        ))}
      </ol>
      <div className="run-mode__console-state">
        <i aria-hidden="true" />
        <span>{activeSection.toUpperCase()}</span>
      </div>
    </footer>
  )
}

function JourneyOverlay({ stage, onSkip }) {
  const content = JOURNEY_STAGES[stage] || JOURNEY_STAGES.context
  const stageIndex = Object.keys(JOURNEY_STAGES).indexOf(stage)

  return (
    <div className="run-mode__journey" aria-live="polite">
      <div key={stage} className="run-mode__journey-copy">
        <span className="run-mode__journey-index">{content.index} / 04</span>
        <p>{content.eyebrow}</p>
        <h3>{content.title}</h3>
        <span>{content.description}</span>
      </div>

      <div className="run-mode__journey-progress" aria-label={`引导进度：第 ${stageIndex + 1} 阶段，共 4 阶段`}>
        {Object.keys(JOURNEY_STAGES).map((stageName, index) => (
          <i key={stageName} className={index <= stageIndex ? 'is-active' : ''} />
        ))}
      </div>

      <button type="button" className="run-mode__journey-skip" onClick={onSkip}>
        跳过引导 <span aria-hidden="true">→</span>
      </button>
    </div>
  )
}

export default function RunMode({ open, onClose, projects = [], initialProject = null }) {
  const iframeRef = useRef(null)
  const exitButtonRef = useRef(null)
  const evidenceTriggerRef = useRef(null)
  const returnFocusRef = useRef(null)
  const openRef = useRef(open)
  const runtimeStateRef = useRef('loading')
  const pathStateRef = useRef('idle')
  const logIdRef = useRef(0)
  const completionAnnouncedRef = useRef(false)
  const initialProjectRef = useRef(WORK_NODE_IDS.includes(initialProject) ? initialProject : null)
  const slowTimeoutRef = useRef(null)
  const hardTimeoutRef = useRef(null)
  const [hasOpened, setHasOpened] = useState(open)
  const [canMountRuntime, setCanMountRuntime] = useState(() => open && !getRuntimeSupportIssue())
  const [runtimeAttempt, setRuntimeAttempt] = useState(0)
  const [runtimeState, setRuntimeState] = useState('loading')
  const [runtimeError, setRuntimeError] = useState(null)
  const [experienceMode, setExperienceMode] = useState('loading')
  const [journeyStage, setJourneyStage] = useState('context')
  const [activeSection, setActiveSection] = useState('about')
  const [selectedNode, setSelectedNode] = useState('context')
  const [pathState, setPathState] = useState('idle')
  const [projectRun, setProjectRun] = useState({ node: null, status: 'idle', stage: -1 })
  const [visitedProjects, setVisitedProjects] = useState([])
  const [evidenceNode, setEvidenceNode] = useState(null)
  const [shareState, setShareState] = useState('idle')
  const [logs, setLogs] = useState(INITIAL_LOGS)

  const appendLog = useCallback((stage, message, tone = 'default') => {
    const id = ++logIdRef.current
    const stamp = `00:${String(id).padStart(2, '0')}`
    setLogs(current => [...current, { id, stamp, stage, message, tone }].slice(-4))
  }, [])

  const projectNodes = useMemo(() => {
    const projectMap = Object.fromEntries(projects.map(project => [project.name, project]))
    return [
      buildProjectNode(projectMap.TrumanWorld || FALLBACK_PROJECTS.TrumanWorld, 'trumanworld', '03'),
      buildProjectNode(projectMap.IssueLab || FALLBACK_PROJECTS.IssueLab, 'issuelab', '04'),
      buildProjectNode(projectMap['article-mcp'] || FALLBACK_PROJECTS['article-mcp'], 'article-mcp', '05'),
    ]
  }, [projects])

  const nodes = useMemo(() => ({
    ...SYSTEM_NODES,
    ...Object.fromEntries(projectNodes.map(node => [node.id, node])),
  }), [projectNodes])

  const selected = nodes[selectedNode] || SYSTEM_NODES.context

  const postToRuntime = useCallback((payload) => {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify(payload), window.location.origin)
  }, [])

  const clearRuntimeTimeouts = useCallback(() => {
    window.clearTimeout(slowTimeoutRef.current)
    window.clearTimeout(hardTimeoutRef.current)
  }, [])

  const startRuntimeLoad = useCallback(() => {
    clearRuntimeTimeouts()
    const supportIssue = getRuntimeSupportIssue()
    if (supportIssue) {
      setCanMountRuntime(false)
      setRuntimeState('error')
      runtimeStateRef.current = 'error'
      setRuntimeError(supportIssue)
      return false
    }

    setCanMountRuntime(true)
    setRuntimeState('loading')
    runtimeStateRef.current = 'loading'
    setExperienceMode('loading')
    setRuntimeError(null)
    slowTimeoutRef.current = window.setTimeout(() => {
      setRuntimeState(state => state === 'loading' ? 'slow' : state)
    }, 12000)
    hardTimeoutRef.current = window.setTimeout(() => {
      setRuntimeState(state => state === 'ready' ? state : 'error')
      setRuntimeError('timeout')
    }, 45000)
    return true
  }, [clearRuntimeTimeouts])

  useEffect(() => {
    openRef.current = open
    if (open) {
      setHasOpened(true)
      if (runtimeStateRef.current !== 'ready') startRuntimeLoad()
    }
  }, [open, startRuntimeLoad])

  useEffect(() => {
    runtimeStateRef.current = runtimeState
  }, [runtimeState])

  useEffect(() => {
    pathStateRef.current = pathState
  }, [pathState])

  useEffect(() => {
    if (visitedProjects.length !== WORK_NODE_IDS.length || completionAnnouncedRef.current) return
    completionAnnouncedRef.current = true
    appendLog('SYSTEM MAP', 'three project workflows verified', 'success')
  }, [appendLog, visitedProjects.length])

  useEffect(() => {
    if (!hasOpened) return undefined

    const handleMessage = (event) => {
      if (event.source !== iframeRef.current?.contentWindow) return
      const payload = parseRuntimeMessage(event.data)
      if (!payload?.type?.startsWith('gqy:run:')) return

      if (payload.type === 'gqy:run:ready') {
        clearRuntimeTimeouts()
        setRuntimeState('ready')
        setRuntimeError(null)
        appendLog('RUNTIME', 'Godot 4.7 topology connected', 'success')
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        postToRuntime({ type: 'gqy:run:preferences', reducedMotion })
        postToRuntime({ type: 'gqy:run:visibility', visible: openRef.current })
        const directProject = initialProjectRef.current
        if (directProject && nodes[directProject]) {
          setExperienceMode('explore')
          setSelectedNode(directProject)
          setActiveSection('work')
          setPathState('running')
          pathStateRef.current = 'running'
          setProjectRun({ node: directProject, status: 'running', stage: 0 })
          setLogs([{ id: ++logIdRef.current, stamp: '00:00', stage: 'DEEPLINK', message: `${nodes[directProject].title} runtime entered`, tone: 'success' }])
          postToRuntime({ type: 'gqy:run:project-run', node: directProject })
        } else {
          setExperienceMode('guided')
          setJourneyStage('context')
          postToRuntime({ type: 'gqy:run:journey', node: 'issuelab' })
        }
      }

      if (payload.type === 'gqy:run:journey-stage' && JOURNEY_STAGES[payload.stage]) {
        setJourneyStage(payload.stage)
        const section = payload.stage === 'context' ? 'about' : payload.stage === 'output' ? 'work' : 'stack'
        setActiveSection(section)
        const stageCopy = JOURNEY_STAGES[payload.stage]
        appendLog(stageCopy.eyebrow, stageCopy.title)
      }

      if (payload.type === 'gqy:run:journey-complete') {
        const node = nodes[payload.node] ? payload.node : 'issuelab'
        setSelectedNode(node)
        setActiveSection('work')
        setExperienceMode('explore')
        setProjectRun({ node, status: 'idle', stage: -1 })
        appendLog('RESOLVED', `${nodes[node]?.title || 'IssueLab'} evidence ready`, 'success')
      }

      if (payload.type === 'gqy:run:project-stage' && PROJECT_TRACES[payload.node]) {
        const stage = Math.max(0, Math.min(Number(payload.stage) || 0, 3))
        const traceStage = PROJECT_TRACES[payload.node].stages[stage]
        setSelectedNode(payload.node)
        setActiveSection('work')
        setPathState('running')
        pathStateRef.current = 'running'
        setProjectRun({ node: payload.node, status: 'running', stage })
        setEvidenceNode(null)
        setShareState('idle')
        appendLog(traceStage.label, traceStage.title)
      }

      if (payload.type === 'gqy:run:project-complete' && PROJECT_TRACES[payload.node]) {
        setSelectedNode(payload.node)
        setActiveSection('work')
        setPathState('complete')
        pathStateRef.current = 'complete'
        setProjectRun({ node: payload.node, status: 'complete', stage: 3 })
        setVisitedProjects(current => current.includes(payload.node) ? current : [...current, payload.node])
        setEvidenceNode(payload.node)
        setShareState('idle')
        appendLog('VERIFIED', `${nodes[payload.node]?.title || 'project'} left an inspectable trace`, 'success')
      }

      if (payload.type === 'gqy:run:active' && payload.section && pathStateRef.current === 'running') {
        setActiveSection(payload.section)
        const stageCopy = {
          about: ['CONTEXT', 'task and constraints loaded'],
          stack: ['STACK', 'memory matched, tool interface ready'],
          work: ['OUTPUT', 'verified project resolved'],
        }[payload.section]
        if (stageCopy) appendLog(stageCopy[0], stageCopy[1])
      }

      if (payload.type === 'gqy:run:select' && nodes[payload.node]) {
        setSelectedNode(payload.node)
        setActiveSection(NODE_SECTION[payload.node] || 'about')
        setPathState('idle')
        pathStateRef.current = 'idle'
        setProjectRun(current => current.node === payload.node ? current : { node: payload.node, status: 'idle', stage: -1 })
        setEvidenceNode(null)
        setShareState('idle')
        appendLog('SELECT', `${nodes[payload.node].title} locked in inspector`)
      }

      if (payload.type === 'gqy:run:path-complete') {
        setPathState('complete')
        pathStateRef.current = 'complete'
        appendLog('RESOLVED', `${nodes[payload.node]?.title || 'output'} path completed`, 'success')
      }

      if (payload.type === 'gqy:run:exit' && openRef.current) onClose()
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [appendLog, clearRuntimeTimeouts, hasOpened, nodes, onClose, postToRuntime])

  useEffect(() => {
    if (!open) return undefined

    returnFocusRef.current = document.activeElement
    document.body.classList.add('run-mode-open')
    exitButtonRef.current?.focus()
    postToRuntime({ type: 'gqy:run:visibility', visible: true })

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return
      if (evidenceNode) {
        setEvidenceNode(null)
        window.requestAnimationFrame(() => evidenceTriggerRef.current?.focus())
      } else {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      clearRuntimeTimeouts()
      document.removeEventListener('keydown', handleKeyDown)
      document.body.classList.remove('run-mode-open')
      postToRuntime({ type: 'gqy:run:visibility', visible: false })
      returnFocusRef.current?.focus?.()
    }
  }, [clearRuntimeTimeouts, evidenceNode, open, onClose, postToRuntime])

  if (!open && !hasOpened) return null

  const handleSectionChange = (section) => {
    const node = SECTION_DEFAULT_NODE[section]
    setActiveSection(section)
    setSelectedNode(node)
    setPathState('idle')
    setProjectRun({ node, status: 'idle', stage: -1 })
    setEvidenceNode(null)
    setShareState('idle')
    postToRuntime({ type: 'gqy:run:navigate', section })
  }

  const handleSelectNode = (node) => {
    if (!nodes[node]) return
    setSelectedNode(node)
    setActiveSection(NODE_SECTION[node] || 'about')
    setPathState('idle')
    pathStateRef.current = 'idle'
    setProjectRun(current => current.node === node ? current : { node, status: 'idle', stage: -1 })
    setEvidenceNode(null)
    setShareState('idle')
    postToRuntime({ type: 'gqy:run:select', node })
  }

  const handleRunPath = (node) => {
    setPathState('running')
    pathStateRef.current = 'running'
    if (WORK_NODE_IDS.includes(node)) {
      setProjectRun({ node, status: 'running', stage: 0 })
      setEvidenceNode(null)
      setShareState('idle')
      setLogs([{ id: ++logIdRef.current, stamp: '00:00', stage: 'PROJECT', message: `${nodes[node].title} runtime entered`, tone: 'success' }])
      postToRuntime({ type: 'gqy:run:project-run', node })
      return
    }
    setLogs([{ id: ++logIdRef.current, stamp: '00:00', stage: 'CONTEXT', message: 'new context packet dispatched', tone: 'success' }])
    postToRuntime({ type: 'gqy:run:path', node })
  }

  const handleRetryRuntime = () => {
    if (!startRuntimeLoad()) return
    setRuntimeAttempt(attempt => attempt + 1)
    appendLog('RETRY', 'reloading Godot Web runtime')
  }

  const handleSkipJourney = () => {
    setJourneyStage('output')
    setSelectedNode('issuelab')
    setActiveSection('work')
    setExperienceMode('explore')
    setProjectRun({ node: 'issuelab', status: 'idle', stage: -1 })
    postToRuntime({ type: 'gqy:run:journey-skip', node: 'issuelab' })
    appendLog('SKIP', 'guided journey skipped; exploration unlocked')
  }

  const handleShareEvidence = async (node) => {
    const url = new URL(window.location.href)
    url.searchParams.set('run', node)
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard unavailable')
      await navigator.clipboard.writeText(url.toString())
      setShareState('copied')
      window.setTimeout(() => setShareState('idle'), 2200)
    } catch {
      setShareState('error')
    }
  }

  const handleCloseEvidence = () => {
    setEvidenceNode(null)
    window.requestAnimationFrame(() => evidenceTriggerRef.current?.focus())
  }

  const loaderCopy = runtimeState === 'error'
    ? getErrorCopy(runtimeError)
    : runtimeState === 'slow'
      ? '首次运行需要下载并编译 WebAssembly，当前仍在继续…'
      : '正在装载上下文、记忆与工具接口…'

  const systemComplete = visitedProjects.length === WORK_NODE_IDS.length

  return (
    <div
      className={`run-mode is-${experienceMode} ${projectRun.status === 'running' ? 'is-project-running' : ''} ${systemComplete ? 'is-system-complete' : ''} ${open ? 'is-open' : 'is-closed'}`}
      role={open ? 'dialog' : undefined}
      aria-modal={open ? 'true' : undefined}
      aria-labelledby={open ? 'run-mode-title' : undefined}
      aria-hidden={!open}
      inert={!open}
    >
      <aside className="run-mode__sidebar">
        <header className="run-mode__identity">
          <h2 id="run-mode-title">
            <span>葛庆宇</span>
            <small>Qingyu Ge</small>
          </h2>
          <p>Agent systems that carry context into verifiable work.</p>
        </header>

        <div className="run-mode__switch" aria-label="主页状态">
          <button type="button" onClick={onClose}>READ</button>
          <span className="run-mode__switch-active" aria-current="true">
            <i aria-hidden="true" /> RUN
          </span>
        </div>

        <nav className="run-mode__nav" aria-label="运行模块">
          {RUN_SECTIONS.map((section, index) => (
            <button
              key={section.id}
              type="button"
              className={activeSection === section.id ? 'is-active' : ''}
              aria-pressed={activeSection === section.id}
              onClick={() => handleSectionChange(section.id)}
            >
              <span className="run-mode__nav-index">0{index + 1}</span>
              <span>
                <strong>{section.label}</strong>
                <small>{section.detail}</small>
              </span>
            </button>
          ))}
        </nav>

        <div className="run-mode__runtime-status" aria-live="polite">
          <span className={`run-mode__status-dot is-${runtimeState}`} aria-hidden="true" />
          <span>{runtimeState === 'ready' ? 'GODOT RUNTIME ACTIVE' : runtimeState === 'slow' ? 'COMPILING RUNTIME' : runtimeState === 'error' ? 'RUNTIME UNAVAILABLE' : 'INITIALIZING RUNTIME'}</span>
        </div>

        <button ref={exitButtonRef} type="button" className="run-mode__exit" onClick={onClose}>
          <span aria-hidden="true">↪</span>
          退出运行
          <kbd>ESC</kbd>
        </button>
      </aside>

      <main className="run-mode__stage">
        <section className="run-mode__world" aria-label="Agent 运行拓扑">
          <div className={`run-mode__loader is-${runtimeState}`} aria-hidden={runtimeState === 'ready'}>
            <div className="run-mode__loader-preview" aria-hidden="true">
              <span>CONTEXT</span>
              <i />
              <span>MEMORY</span>
              <i />
              <span>TOOLS</span>
            </div>
            <div className="run-mode__loader-line"><span /></div>
            <p>{loaderCopy}</p>
            {runtimeState === 'error' && (
              <button type="button" className="run-mode__retry" onClick={handleRetryRuntime}>
                重新加载运行时
              </button>
            )}
          </div>

          {canMountRuntime && (
            <iframe
              key={runtimeAttempt}
              ref={iframeRef}
              className={`run-mode__frame ${runtimeState === 'ready' ? 'is-ready' : ''}`}
              src={`${GODOT_RUNTIME_URL}&attempt=${runtimeAttempt}`}
              title="葛庆宇的 Agent 运行拓扑"
              allow="fullscreen"
            />
          )}

          <div className="run-mode__world-label" aria-hidden="true">
            <span>{projectRun.status === 'running' ? 'PROJECT RUNTIME' : projectRun.status === 'complete' ? 'PROJECT EVIDENCE' : 'LIVE TOPOLOGY'}</span>
            <span>{projectRun.status === 'running' ? 'GENERATING EVIDENCE TRACE' : projectRun.status === 'complete' ? 'TRACE VERIFIED' : 'CLICK A NODE TO INSPECT'}</span>
          </div>

          {evidenceNode === selected.id && projectRun.status === 'complete' && (
            <EvidencePanel
              node={selected}
              shareState={shareState}
              onClose={handleCloseEvidence}
              onShare={handleShareEvidence}
            />
          )}

          {projectRun.status === 'complete' && PROJECT_EVIDENCE[selected.id] && evidenceNode !== selected.id && (
            <button ref={evidenceTriggerRef} type="button" className="run-mode__evidence-open" onClick={() => setEvidenceNode(selected.id)}>
              <span>VERIFIED ARTIFACT</span>
              打开真实证据 <i aria-hidden="true">↗</i>
            </button>
          )}

          {systemComplete && experienceMode === 'explore' && projectRun.status !== 'running' && !evidenceNode && (
            <div className="run-mode__world-completion" role="status">
              <span>SYSTEM MAP COMPLETE</span>
              <strong>3 条工作流，1 个方法</strong>
              <p>上下文已经穿过世界模拟、科研协作与文献工具，并留下三个可检查的结果。</p>
            </div>
          )}

          {runtimeState === 'ready' && experienceMode === 'guided' && (
            <JourneyOverlay stage={journeyStage} onSkip={handleSkipJourney} />
          )}
        </section>

        <RuntimeInspector
          node={selected}
          projectNodes={projectNodes}
          runtimeState={runtimeState}
          pathState={pathState}
          projectRun={projectRun}
          visitedProjects={visitedProjects}
          onSelect={handleSelectNode}
          onRunPath={handleRunPath}
        />

        <ExecutionLog logs={logs} activeSection={activeSection} runtimeState={runtimeState} />
      </main>
    </div>
  )
}

export { getRuntimeSupportIssue, parseRuntimeMessage }
