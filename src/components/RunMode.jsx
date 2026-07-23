import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './RunMode.css'

const RUN_SECTIONS = [
  { id: 'about', label: 'ABOUT', detail: 'identity / context' },
  { id: 'stack', label: 'STACK', detail: 'memory / tools' },
  { id: 'work', label: 'WORK', detail: 'verified output' },
]

const RUNTIME_URL = '/runtime/home/index.html?embed=1'
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

function RuntimeInspector({ node, projectNodes, runtimeState, pathState, onSelect, onRunPath }) {
  const isProject = node.type === 'VERIFIED OUTPUT'

  return (
    <aside className="run-mode__inspector" aria-label="节点详情" aria-live="polite">
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
        className="run-mode__path-action"
        disabled={runtimeState !== 'ready' || pathState === 'running'}
        onClick={() => onRunPath(node.id)}
      >
        <span aria-hidden="true">▶</span>
        <span>
          <strong>{pathState === 'running' ? 'RUNNING PATH' : 'RUN THIS PATH'}</strong>
          <small>{pathState === 'running' ? '上下文正在通过运行拓扑' : '让上下文沿当前节点链路运行'}</small>
        </span>
      </button>

      {isProject && (
        <div className="run-mode__project-links">
          <a href={node.url} target="_blank" rel="noopener noreferrer">查看 GitHub <span aria-hidden="true">↗</span></a>
          {node.homepage && <a href={node.homepage} target="_blank" rel="noopener noreferrer">打开项目 <span aria-hidden="true">↗</span></a>}
        </div>
      )}

      <div className="run-mode__outputs">
        <p>CONNECTED OUTPUTS</p>
        <div>
          {projectNodes.map(project => (
            <button
              key={project.id}
              type="button"
              className={project.id === node.id ? 'is-selected' : ''}
              aria-pressed={project.id === node.id}
              onClick={() => onSelect(project.id)}
            >
              <span>{project.title}</span>
              <small>{project.metrics[0].value}★</small>
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

export default function RunMode({ open, onClose, projects = [] }) {
  const iframeRef = useRef(null)
  const exitButtonRef = useRef(null)
  const returnFocusRef = useRef(null)
  const openRef = useRef(open)
  const runtimeStateRef = useRef('loading')
  const pathStateRef = useRef('idle')
  const logIdRef = useRef(0)
  const slowTimeoutRef = useRef(null)
  const hardTimeoutRef = useRef(null)
  const [hasOpened, setHasOpened] = useState(open)
  const [runtimeState, setRuntimeState] = useState('loading')
  const [runtimeError, setRuntimeError] = useState(null)
  const [activeSection, setActiveSection] = useState('about')
  const [selectedNode, setSelectedNode] = useState('context')
  const [pathState, setPathState] = useState('idle')
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

  useEffect(() => {
    openRef.current = open
    if (open) setHasOpened(true)
  }, [open])

  useEffect(() => {
    runtimeStateRef.current = runtimeState
  }, [runtimeState])

  useEffect(() => {
    pathStateRef.current = pathState
  }, [pathState])

  useEffect(() => {
    if (!hasOpened) return undefined

    const handleMessage = (event) => {
      if (event.source !== iframeRef.current?.contentWindow) return
      const payload = parseRuntimeMessage(event.data)
      if (!payload?.type?.startsWith('gqy:run:')) return

      if (payload.type === 'gqy:run:ready') {
        window.clearTimeout(slowTimeoutRef.current)
        window.clearTimeout(hardTimeoutRef.current)
        setRuntimeState('ready')
        setRuntimeError(null)
        appendLog('RUNTIME', 'Godot 4.7 topology connected', 'success')
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        postToRuntime({ type: 'gqy:run:preferences', reducedMotion })
        postToRuntime({ type: 'gqy:run:select', node: selectedNode })
        postToRuntime({ type: 'gqy:run:visibility', visible: openRef.current })
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
  }, [appendLog, hasOpened, nodes, onClose, postToRuntime, selectedNode])

  useEffect(() => {
    if (!open) return undefined

    returnFocusRef.current = document.activeElement
    document.body.classList.add('run-mode-open')
    exitButtonRef.current?.focus()
    postToRuntime({ type: 'gqy:run:visibility', visible: true })

    if (runtimeStateRef.current !== 'ready') {
      const supportIssue = getRuntimeSupportIssue()
      if (supportIssue) {
        setRuntimeState('error')
        setRuntimeError(supportIssue)
      } else {
        setRuntimeState('loading')
        slowTimeoutRef.current = window.setTimeout(() => {
          setRuntimeState(state => state === 'loading' ? 'slow' : state)
        }, 12000)
        hardTimeoutRef.current = window.setTimeout(() => {
          setRuntimeState(state => state === 'ready' ? state : 'error')
          setRuntimeError('timeout')
        }, 45000)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.clearTimeout(slowTimeoutRef.current)
      window.clearTimeout(hardTimeoutRef.current)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.classList.remove('run-mode-open')
      postToRuntime({ type: 'gqy:run:visibility', visible: false })
      returnFocusRef.current?.focus?.()
    }
  }, [open, onClose, postToRuntime])

  if (!open && !hasOpened) return null

  const handleSectionChange = (section) => {
    const node = SECTION_DEFAULT_NODE[section]
    setActiveSection(section)
    setSelectedNode(node)
    setPathState('idle')
    postToRuntime({ type: 'gqy:run:navigate', section })
  }

  const handleSelectNode = (node) => {
    if (!nodes[node]) return
    setSelectedNode(node)
    setActiveSection(NODE_SECTION[node] || 'about')
    setPathState('idle')
    postToRuntime({ type: 'gqy:run:select', node })
  }

  const handleRunPath = (node) => {
    setPathState('running')
    pathStateRef.current = 'running'
    setLogs([{ id: ++logIdRef.current, stamp: '00:00', stage: 'CONTEXT', message: 'new context packet dispatched', tone: 'success' }])
    postToRuntime({ type: 'gqy:run:path', node })
  }

  const loaderCopy = runtimeState === 'error'
    ? getErrorCopy(runtimeError)
    : runtimeState === 'slow'
      ? '首次运行需要下载并编译 WebAssembly，当前仍在继续…'
      : '正在装载上下文、记忆与工具接口…'

  return (
    <div
      className={`run-mode ${open ? 'is-open' : 'is-closed'}`}
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
            <div className="run-mode__loader-line"><span /></div>
            <p>{loaderCopy}</p>
          </div>

          <iframe
            ref={iframeRef}
            className={`run-mode__frame ${runtimeState === 'ready' ? 'is-ready' : ''}`}
            src={RUNTIME_URL}
            title="葛庆宇的 Agent 运行拓扑"
            allow="fullscreen"
          />

          <div className="run-mode__world-label" aria-hidden="true">
            <span>LIVE TOPOLOGY</span>
            <span>CLICK A NODE TO INSPECT</span>
          </div>
        </section>

        <RuntimeInspector
          node={selected}
          projectNodes={projectNodes}
          runtimeState={runtimeState}
          pathState={pathState}
          onSelect={handleSelectNode}
          onRunPath={handleRunPath}
        />

        <ExecutionLog logs={logs} activeSection={activeSection} runtimeState={runtimeState} />
      </main>
    </div>
  )
}

export { getRuntimeSupportIssue, parseRuntimeMessage }
