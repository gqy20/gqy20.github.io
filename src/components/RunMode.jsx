import { useEffect, useRef, useState } from 'react'
import './RunMode.css'

const RUN_SECTIONS = [
  { id: 'about', label: 'ABOUT', detail: 'identity / context' },
  { id: 'stack', label: 'STACK', detail: 'memory / tools' },
  { id: 'work', label: 'WORK', detail: 'verified output' },
]

const RUNTIME_URL = '/runtime/home/index.html?embed=1'

function parseRuntimeMessage(data) {
  if (typeof data !== 'string') return data
  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}

export default function RunMode({ open, onClose }) {
  const iframeRef = useRef(null)
  const exitButtonRef = useRef(null)
  const returnFocusRef = useRef(null)
  const [runtimeState, setRuntimeState] = useState('loading')
  const [activeSection, setActiveSection] = useState('about')

  useEffect(() => {
    if (!open) return undefined

    returnFocusRef.current = document.activeElement
    document.body.classList.add('run-mode-open')
    exitButtonRef.current?.focus()

    const timeout = window.setTimeout(() => {
      setRuntimeState(state => state === 'loading' ? 'error' : state)
    }, 15000)

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    const handleMessage = (event) => {
      if (event.source !== iframeRef.current?.contentWindow) return
      const payload = parseRuntimeMessage(event.data)
      if (!payload?.type?.startsWith('gqy:run:')) return

      if (payload.type === 'gqy:run:ready') {
        window.clearTimeout(timeout)
        setRuntimeState('ready')
      }

      if (payload.type === 'gqy:run:active' && payload.section) {
        setActiveSection(payload.section)
      }

      if (payload.type === 'gqy:run:exit') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('message', handleMessage)

    return () => {
      window.clearTimeout(timeout)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('message', handleMessage)
      document.body.classList.remove('run-mode-open')
      returnFocusRef.current?.focus?.()
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) {
      setRuntimeState('loading')
      setActiveSection('about')
    }
  }, [open])

  if (!open) return null

  const sendToRuntime = (payload) => {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify(payload), window.location.origin)
  }

  const handleSectionChange = (section) => {
    setActiveSection(section)
    sendToRuntime({ type: 'gqy:run:navigate', section })
  }

  const handleRuntimeReady = () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    sendToRuntime({ type: 'gqy:run:preferences', reducedMotion })
  }

  return (
    <div
      className="run-mode"
      role="dialog"
      aria-modal="true"
      aria-labelledby="run-mode-title"
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
          <span>{runtimeState === 'ready' ? 'GODOT RUNTIME ACTIVE' : runtimeState === 'error' ? 'RUNTIME UNAVAILABLE' : 'COMPILING WORLD'}</span>
        </div>

        <button
          ref={exitButtonRef}
          type="button"
          className="run-mode__exit"
          onClick={onClose}
        >
          <span aria-hidden="true">↪</span>
          退出运行
          <kbd>ESC</kbd>
        </button>
      </aside>

      <main className="run-mode__stage">
        <div className={`run-mode__loader is-${runtimeState}`} aria-hidden={runtimeState === 'ready'}>
          <div className="run-mode__loader-line">
            <span />
          </div>
          <p>{runtimeState === 'error' ? 'Godot Web 导出尚未就绪，请重新执行导出脚本。' : '正在装载上下文、记忆与工具接口…'}</p>
        </div>

        <iframe
          ref={iframeRef}
          className={`run-mode__frame ${runtimeState === 'ready' ? 'is-ready' : ''}`}
          src={RUNTIME_URL}
          title="葛庆宇的 Agent 运行拓扑"
          onLoad={handleRuntimeReady}
          allow="fullscreen"
        />

        <footer className="run-mode__hint">
          <span aria-hidden="true" />
          <p><strong>{activeSection.toUpperCase()}</strong> 点击模块，观察上下文如何流动</p>
          <p className="run-mode__hint-tech">GODOT 4.7 · WEBGL 2 · SINGLE THREAD</p>
        </footer>
      </main>
    </div>
  )
}

export { parseRuntimeMessage }
