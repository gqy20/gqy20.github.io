import { useEffect, useRef, useState } from 'react'

export default function AgentWorkflow() {
  const rootRef = useRef(null)
  const timelineRef = useRef(null)
  const contextRef = useRef(null)
  const mountedRef = useRef(false)
  const preparingRef = useRef(false)
  const [isPreparing, setIsPreparing] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(() => (
    typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ))

  useEffect(() => {
    mountedRef.current = true
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduceMotion(media.matches)
    media.addEventListener('change', update)
    return () => {
      mountedRef.current = false
      media.removeEventListener('change', update)
      timelineRef.current?.kill()
      contextRef.current?.revert()
    }
  }, [])

  useEffect(() => {
    if (!reduceMotion) return
    timelineRef.current?.kill()
    contextRef.current?.revert()
    timelineRef.current = null
    contextRef.current = null

    const root = rootRef.current
    root?.setAttribute('data-running', 'false')
    root?.querySelector('.agent-workflow__agent-status')?.replaceChildren('READY')
    root?.querySelectorAll('.agent-workflow__tool-status').forEach(node => node.replaceChildren('DONE'))
    root?.querySelector('.agent-workflow__result-status')?.replaceChildren('VERIFIED')
  }, [reduceMotion])

  const replay = async () => {
    if (reduceMotion || preparingRef.current) return
    preparingRef.current = true
    setIsPreparing(true)

    try {
      const { gsap } = await import('gsap')
      const root = rootRef.current
      if (
        !mountedRef.current
        || !root
        || window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) return

      timelineRef.current?.kill()
      contextRef.current?.revert()

      contextRef.current = gsap.context(() => {
        const select = gsap.utils.selector(root)
        const edges = select('.agent-workflow__edge')
        const nodes = select('.agent-workflow__node')

        root.querySelector('.agent-workflow__agent-status')?.replaceChildren('WAIT')
        root.querySelectorAll('.agent-workflow__tool-status').forEach(node => node.replaceChildren('IDLE'))
        root.querySelector('.agent-workflow__result-status')?.replaceChildren('WAIT')

        gsap.set(edges, { strokeDashoffset: 1, opacity: 0.24 })
        gsap.set(nodes, { opacity: 0.42, scale: 0.975, transformOrigin: 'center' })
        gsap.set('.agent-workflow__packet, .agent-workflow__scan', { autoAlpha: 0 })
        gsap.set('.agent-workflow__result-mark, .agent-workflow__evidence', { opacity: 0 })
        gsap.set('.agent-workflow__tool-meter', { scaleX: 0, transformOrigin: 'left' })
        gsap.set('.agent-workflow__document-line', { opacity: 0.28 })

        const setText = (selector, value) => {
          root.querySelector(selector)?.replaceChildren(value)
        }
        const setAllText = (selector, value) => {
          root.querySelectorAll(selector).forEach(node => node.replaceChildren(value))
        }

        const timeline = gsap.timeline({
          paused: true,
          defaults: { duration: 0.36, ease: 'power3.out' },
          onStart: () => root.setAttribute('data-running', 'true'),
          onComplete: () => root.setAttribute('data-running', 'false'),
        })

        timeline
        .addLabel('ingest')
        .to('.agent-workflow__node--input', { opacity: 1, scale: 1 }, 'ingest')
        .set('.agent-workflow__scan', { autoAlpha: 1, attr: { y: 112 } }, 'ingest+=0.1')
        .to('.agent-workflow__scan', { attr: { y: 153 }, duration: 0.65, ease: 'power1.inOut' }, 'ingest+=0.1')
        .to('.agent-workflow__document-line', { opacity: 1, stagger: 0.08, duration: 0.22 }, 'ingest+=0.2')
        .set('.agent-workflow__scan', { autoAlpha: 0 }, 'ingest+=0.76')
        .to('.agent-workflow__edge--input', { strokeDashoffset: 0, opacity: 1, duration: 0.46 }, 'ingest+=0.72')
        .set('.agent-workflow__packet--input', { autoAlpha: 1, x: 0 }, 'ingest+=0.76')
        .to('.agent-workflow__packet--input', { x: 91, duration: 0.52, ease: 'power2.inOut' }, 'ingest+=0.76')
        .set('.agent-workflow__packet--input', { autoAlpha: 0 })

        .addLabel('reason')
        .to('.agent-workflow__node--agent', { opacity: 1, scale: 1 }, 'reason')
        .call(() => setText('.agent-workflow__agent-status', 'READ'), null, 'reason')
        .to('.agent-workflow__agent-ring', { rotation: 90, svgOrigin: '290 118', duration: 0.42 }, 'reason')
        .call(() => setText('.agent-workflow__agent-status', 'PLAN'), null, 'reason+=0.42')
        .to('.agent-workflow__agent-ring', { rotation: 190, svgOrigin: '290 118', duration: 0.42 }, 'reason+=0.42')
        .call(() => setText('.agent-workflow__agent-status', 'CALL'), null, 'reason+=0.84')

        .addLabel('dispatch', 'reason+=0.82')
        .to('.agent-workflow__edge--tool', {
          strokeDashoffset: 0,
          opacity: 1,
          stagger: 0.09,
          duration: 0.48,
          ease: 'power2.inOut',
        }, 'dispatch')
        .set('.agent-workflow__packet--out', { autoAlpha: 1, x: 0, y: 0 }, 'dispatch+=0.08')
        .to('.agent-workflow__packet--out', {
          x: 136,
          y: index => [-74, 0, 74][index],
          stagger: 0.09,
          duration: 0.58,
          ease: 'power2.inOut',
        }, 'dispatch+=0.08')
        .set('.agent-workflow__packet--out', { autoAlpha: 0 })
        .to('.agent-workflow__node--tool', { opacity: 1, scale: 1, stagger: 0.08, duration: 0.28 }, 'dispatch+=0.42')
        .call(() => setAllText('.agent-workflow__tool-status', 'RUN'), null, 'dispatch+=0.48')
        .to('.agent-workflow__tool-meter', { scaleX: 1, stagger: 0.08, duration: 0.4, transformOrigin: 'left' }, 'dispatch+=0.55')
        .call(() => setAllText('.agent-workflow__tool-status', 'DONE'), null, 'dispatch+=0.98')

        .addLabel('verify', 'dispatch+=0.94')
        .to('.agent-workflow__edge--result', {
          strokeDashoffset: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.4,
          ease: 'power2.inOut',
        }, 'verify')
        .set('.agent-workflow__packet--return', { autoAlpha: 1, x: 0, y: 0 }, 'verify+=0.04')
        .to('.agent-workflow__packet--return', {
          x: 85,
          y: index => [74, 0, -74][index],
          stagger: 0.08,
          duration: 0.52,
          ease: 'power2.inOut',
        }, 'verify+=0.04')
        .set('.agent-workflow__packet--return', { autoAlpha: 0 })
        .to('.agent-workflow__node--result', { opacity: 1, scale: 1, duration: 0.34 }, 'verify+=0.42')
        .call(() => setText('.agent-workflow__result-status', 'VERIFYING'), null, 'verify+=0.42')
        .to('.agent-workflow__evidence', { opacity: 1, stagger: 0.08, duration: 0.22 }, 'verify+=0.55')
        .call(() => setText('.agent-workflow__result-status', 'VERIFIED'), null, 'verify+=0.88')
        .to('.agent-workflow__result-mark', { opacity: 1, duration: 0.24 }, 'verify+=0.88')
        .call(() => setText('.agent-workflow__agent-status', 'READY'), null, 'verify+=0.9')

        timelineRef.current = timeline
        timeline.play(0)
      }, root)
    } finally {
      preparingRef.current = false
      if (mountedRef.current) setIsPreparing(false)
    }
  }

  return (
    <figure className="agent-workflow" ref={rootRef} data-running="false">
      <div className="agent-workflow__copy">
        <p className="agent-workflow__label">SYSTEM FLOW</p>
        <h3>把一次回答变成可验证的工作流</h3>
        <p>Agent 负责理解任务与编排步骤，工具层连接代码、知识库和 MCP，最终输出带有过程依据的结果。</p>
      </div>

      <div className="agent-workflow__stage" tabIndex="0" aria-label="Agent 工作流动画，窄屏下可横向滚动">
        {!reduceMotion && (
          <button
            type="button"
            className="agent-workflow__replay"
            onClick={replay}
            disabled={isPreparing}
            aria-busy={isPreparing}
            aria-label={isPreparing ? '正在加载工作流动画' : '播放工作流动画'}
            title={isPreparing ? '正在加载工作流动画' : '播放工作流动画'}
          >
            <span aria-hidden="true">↻</span>
          </button>
        )}
        <svg viewBox="0 0 760 270" role="img" aria-labelledby="agent-workflow-title agent-workflow-desc">
          <title id="agent-workflow-title">Agent 可验证工作流</title>
          <desc id="agent-workflow-desc">任务输入经过扫描后交给 Agent，Agent 规划并调用 MCP、代码和知识库，三类证据返回后生成验证结果。</desc>

          <g fill="none">
            <path className="agent-workflow__edge agent-workflow__edge--input" pathLength="1" d="M145 135 H236" />
            <path className="agent-workflow__edge agent-workflow__edge--tool" pathLength="1" d="M344 135 C386 135 386 61 430 61" />
            <path className="agent-workflow__edge agent-workflow__edge--tool" pathLength="1" d="M344 135 H430" />
            <path className="agent-workflow__edge agent-workflow__edge--tool" pathLength="1" d="M344 135 C386 135 386 209 430 209" />
            <path className="agent-workflow__edge agent-workflow__edge--result" pathLength="1" d="M530 61 C572 61 572 135 615 135" />
            <path className="agent-workflow__edge agent-workflow__edge--result" pathLength="1" d="M530 135 H615" />
            <path className="agent-workflow__edge agent-workflow__edge--result" pathLength="1" d="M530 209 C572 209 572 135 615 135" />
          </g>

          <g className="agent-workflow__packets" aria-hidden="true">
            <circle className="agent-workflow__packet agent-workflow__packet--input" cx="145" cy="135" r="3.5" />
            <circle className="agent-workflow__packet agent-workflow__packet--out" cx="344" cy="135" r="3.5" />
            <circle className="agent-workflow__packet agent-workflow__packet--out" cx="344" cy="135" r="3.5" />
            <circle className="agent-workflow__packet agent-workflow__packet--out" cx="344" cy="135" r="3.5" />
            <circle className="agent-workflow__packet agent-workflow__packet--return" cx="530" cy="61" r="3.5" />
            <circle className="agent-workflow__packet agent-workflow__packet--return" cx="530" cy="135" r="3.5" />
            <circle className="agent-workflow__packet agent-workflow__packet--return" cx="530" cy="209" r="3.5" />
          </g>

          <g className="agent-workflow__node agent-workflow__node--input">
            <rect x="35" y="101" width="110" height="68" rx="8" />
            <path className="agent-workflow__document" d="M55 115 H77 L84 122 V157 H55 Z M77 115 V122 H84" />
            <path className="agent-workflow__document-line" d="M62 132 H77 M62 139 H77 M62 146 H72" />
            <rect className="agent-workflow__scan" x="52" y="112" width="35" height="2" rx="1" />
            <text x="112" y="130" textAnchor="middle">INPUT</text>
            <text className="agent-workflow__node-note" x="112" y="150" textAnchor="middle">任务 / 资料</text>
          </g>

          <g className="agent-workflow__node agent-workflow__node--agent agent-workflow__node--primary">
            <rect x="236" y="92" width="108" height="86" rx="8" />
            <circle className="agent-workflow__agent-core" cx="290" cy="118" r="7" />
            <circle className="agent-workflow__agent-ring" cx="290" cy="118" r="12" />
            <text x="290" y="145" textAnchor="middle">AGENT</text>
            <text className="agent-workflow__node-note agent-workflow__agent-status" x="290" y="164" textAnchor="middle">READY</text>
          </g>

          {[
            { y: 33, name: 'MCP' },
            { y: 107, name: 'CODE' },
            { y: 181, name: 'KNOWLEDGE' },
          ].map(tool => (
            <g key={tool.name} className="agent-workflow__node agent-workflow__node--tool">
              <rect x="430" y={tool.y} width="100" height="56" rx="8" />
              <text x="480" y={tool.y + 24} textAnchor="middle">{tool.name}</text>
              <text className="agent-workflow__node-note agent-workflow__tool-status" x="480" y={tool.y + 42} textAnchor="middle">DONE</text>
              <rect className="agent-workflow__tool-meter" x="443" y={tool.y + 49} width="74" height="2" rx="1" />
            </g>
          ))}

          <g className="agent-workflow__node agent-workflow__node--result">
            <rect x="615" y="92" width="110" height="86" rx="8" />
            <text x="670" y="119" textAnchor="middle">RESULT</text>
            <text className="agent-workflow__node-note agent-workflow__result-status" x="670" y="139" textAnchor="middle">VERIFIED</text>
            <g className="agent-workflow__evidence">
              <rect x="636" y="150" width="24" height="3" rx="1.5" />
              <rect x="664" y="150" width="14" height="3" rx="1.5" />
              <rect x="682" y="150" width="20" height="3" rx="1.5" />
            </g>
            <path className="agent-workflow__result-mark" d="M697 113 l5 5 10 -12" />
          </g>
        </svg>
        <p className="agent-workflow__scroll-hint" aria-hidden="true">横向滑动查看完整流程 →</p>
        <div className="agent-workflow__legend" aria-hidden="true"><span>01 理解</span><span>02 调用</span><span>03 验证</span></div>
      </div>
    </figure>
  )
}
