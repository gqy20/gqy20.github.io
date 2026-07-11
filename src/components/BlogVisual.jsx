import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap.js'
import './BlogVisual.css'

const VISUALS = {
  '260629_agent_sdk_patterns': AgentPatternsVisual,
  '260628_git_claude_hooks': HooksVisual,
  '260627_rag_kb_survey': RagVisual
}

export default function BlogVisual({ postId, className = '' }) {
  const rootRef = useRef(null)
  const Visual = VISUALS[postId] || AgentPatternsVisual

  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add({
      reduce: '(prefers-reduced-motion: reduce)',
      animate: '(prefers-reduced-motion: no-preference)'
    }, ({ conditions }) => {
      if (conditions.reduce) return

      const timeline = gsap.timeline({
        paused: true,
        repeat: -1,
        repeatDelay: 0.8,
        defaults: { ease: 'power2.out' }
      })

      timeline
        .set('.bv-scene', { opacity: 1 }, 0)
        .set('.bv-draw', { strokeDashoffset: 1, opacity: 0.24 }, 0)
        .set('.bv-pop', { opacity: 0.28, y: 3 }, 0)
        .to('.bv-draw', { strokeDashoffset: 0, opacity: 1, duration: 1.4, stagger: 0.12 }, 0.25)
        .to('.bv-pop', { opacity: 1, y: 0, duration: 0.42, stagger: 0.1 }, 0.55)

      if (postId === '260629_agent_sdk_patterns') {
        timeline
          .set('.bv-agent-cap', { opacity: 0.24, scale: 0.78, transformOrigin: 'center' }, 0)
          .set('.bv-tool-node, .bv-agent-result', { opacity: 0.22, x: 8 }, 0)
          .set('.bv-trace-dot', { opacity: 0, x: 0, y: 0 }, 0)
          .fromTo('.bv-goal-packet', { x: -42, opacity: 0 }, { x: 0, opacity: 1, duration: 1.05 }, 1.25)
          .to('.bv-agent-core', { scale: 1.08, duration: 0.32, yoyo: true, repeat: 1, transformOrigin: 'center' }, 2.2)
          .to('.bv-agent-cap', { opacity: 1, scale: 1, duration: 0.36, stagger: 0.24 }, 2.65)
          .to('.bv-tool-node', { opacity: 1, x: 0, duration: 0.38, stagger: 0.24 }, 4.15)
          .to('.bv-agent-result', { opacity: 1, x: 0, duration: 0.55 }, 5.35)
          .to('.bv-trace-dot', { opacity: 1, duration: 0.15 }, 1.9)
          .to('.bv-trace-dot', {
            duration: 4.7,
            ease: 'none',
            keyframes: [
              { x: 44, y: 0 },
              { x: 57, y: -26 },
              { x: 78, y: -35 },
              { x: 103, y: -24 },
              { x: 122, y: 0 },
              { x: 150, y: 0 },
              { x: 192, y: 14 }
            ]
          }, 2.05)
          .to('.bv-trace-dot', { opacity: 0, duration: 0.35 }, 6.75)
      } else if (postId === '260628_git_claude_hooks') {
        timeline
          .set('.bv-hook-packet', { x: -92, opacity: 0 }, 0)
          .set('.bv-hook-gate', { rotation: -18, transformOrigin: 'center' }, 0)
          .to('.bv-hook-packet', { x: 0, opacity: 1, duration: 1.4 }, 1.15)
          .to('.bv-hook-gate', { rotation: 0, duration: 0.34, ease: 'power3.out' }, 2.45)
          .to('.bv-hook-signal', { opacity: 1, scale: 1.18, duration: 0.3, yoyo: true, repeat: 1, transformOrigin: 'center' }, 2.65)
          .to('.bv-hook-packet', { x: 104, duration: 1.35, ease: 'power2.inOut' }, 3.35)
          .to('.bv-agent-event', { opacity: 1, x: 0, duration: 0.42, stagger: 0.3 }, 4.45)
          .to('.bv-observe-line', { scaleX: 1, duration: 1.2, transformOrigin: 'left center' }, 5.75)
      } else {
        timeline
          .set('.bv-rag-chunk', { opacity: 0.24, x: -18 }, 0)
          .set('.bv-rag-query', { x: -74, opacity: 0 }, 0)
          .set('.bv-vector-dot', { opacity: 0.22, scale: 0.5, transformOrigin: 'center' }, 0)
          .to('.bv-rag-chunk', { opacity: 1, x: 0, duration: 0.38, stagger: 0.2 }, 1.05)
          .to('.bv-vector-dot', { opacity: 1, scale: 1, duration: 0.28, stagger: 0.1 }, 2.2)
          .to('.bv-rag-query', { x: 0, opacity: 1, duration: 1.1, ease: 'power2.inOut' }, 3.25)
          .to('.bv-retrieved', { scale: 1.18, duration: 0.3, stagger: 0.18, yoyo: true, repeat: 1, transformOrigin: 'center' }, 4.35)
          .fromTo('.bv-answer', { opacity: 0.2, y: 5 }, { opacity: 1, y: 0, duration: 0.6 }, 5.35)
          .fromTo('.bv-hallucination', { scaleX: 1 }, { scaleX: 0.22, duration: 1.4, transformOrigin: 'left center' }, 5.7)
          .to('.bv-citation', { opacity: 1, duration: 0.4, stagger: 0.18 }, 6.5)
      }

      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) timeline.play()
        else timeline.pause()
      }, { threshold: 0.18 })

      observer.observe(rootRef.current)
      return () => {
        observer.disconnect()
        timeline.kill()
      }
    })
    return () => mm.revert()
  }, { scope: rootRef, dependencies: [postId] })

  return (
    <div className={`blog-visual ${className}`.trim()} ref={rootRef} aria-hidden="true">
      <Visual />
    </div>
  )
}

function Frame({ label, children }) {
  return (
    <svg viewBox="0 0 320 180" focusable="false">
      <g className="bv-scene">
        <rect className="bv-frame" x="0.5" y="0.5" width="319" height="179" rx="9" />
        <text className="bv-kicker" x="16" y="22">{label}</text>
        <circle className="bv-status" cx="292" cy="18" r="3" />
        <circle className="bv-status bv-status--dim" cx="304" cy="18" r="3" />
        {children}
      </g>
    </svg>
  )
}

function AgentPatternsVisual() {
  return (
    <Frame label="AGENT CAPABILITY LOOP">
      <path className="bv-line bv-draw" pathLength="1" d="M71 91 H116 M184 91 H224" />
      <path className="bv-line bv-line--accent bv-draw" pathLength="1" d="M150 59 C118 59 108 72 108 91 C108 117 124 128 150 128 C179 128 193 113 193 91 C193 70 180 59 150 59" />
      <path className="bv-line bv-draw" pathLength="1" d="M136 68 L116 50 M166 66 L186 49 M135 114 L116 133 M167 114 L187 133" />

      <g className="bv-goal-packet">
        <rect className="bv-panel bv-panel--accent" x="18" y="68" width="53" height="46" rx="6" />
        <text className="bv-title" x="44.5" y="84" textAnchor="middle">GOAL</text>
        <text className="bv-copy" x="44.5" y="96" textAnchor="middle">intent</text>
        <text className="bv-copy" x="44.5" y="105" textAnchor="middle">context</text>
      </g>

      <g className="bv-agent-core">
        <circle className="bv-agent-core-fill" cx="150" cy="91" r="29" />
        <text className="bv-title" x="150" y="89" textAnchor="middle">AGENT</text>
        <text className="bv-copy" x="150" y="101" textAnchor="middle">reason · act</text>
      </g>

      <g className="bv-agent-cap">
        <rect className="bv-cap-node" x="91" y="37" width="48" height="22" rx="5" />
        <text className="bv-node-label" x="115" y="51" textAnchor="middle">PLAN</text>
      </g>
      <g className="bv-agent-cap">
        <rect className="bv-cap-node" x="162" y="36" width="51" height="22" rx="5" />
        <text className="bv-node-label" x="187.5" y="50" textAnchor="middle">MEMORY</text>
      </g>
      <g className="bv-agent-cap">
        <rect className="bv-cap-node" x="88" y="124" width="55" height="22" rx="5" />
        <text className="bv-node-label" x="115.5" y="138" textAnchor="middle">SCHEMA</text>
      </g>
      <g className="bv-agent-cap">
        <rect className="bv-cap-node" x="163" y="124" width="48" height="22" rx="5" />
        <text className="bv-node-label" x="187" y="138" textAnchor="middle">EVENT</text>
      </g>

      <g className="bv-tool-node">
        <rect className="bv-panel" x="224" y="49" width="39" height="20" rx="4" />
        <text className="bv-node-label" x="243.5" y="62" textAnchor="middle">MCP</text>
      </g>
      <g className="bv-tool-node">
        <rect className="bv-panel" x="270" y="49" width="34" height="20" rx="4" />
        <text className="bv-node-label" x="287" y="62" textAnchor="middle">CLI</text>
      </g>
      <g className="bv-tool-node">
        <rect className="bv-panel" x="224" y="76" width="39" height="20" rx="4" />
        <text className="bv-node-label" x="243.5" y="89" textAnchor="middle">WEB</text>
      </g>
      <g className="bv-tool-node">
        <rect className="bv-panel" x="270" y="76" width="34" height="20" rx="4" />
        <text className="bv-node-label" x="287" y="89" textAnchor="middle">API</text>
      </g>
      <g className="bv-agent-result">
        <rect className="bv-result-panel" x="224" y="108" width="80" height="38" rx="5" />
        <text className="bv-title" x="264" y="123" textAnchor="middle">RESULT</text>
        <text className="bv-copy" x="264" y="135" textAnchor="middle">structured · traced</text>
      </g>
      <circle className="bv-trace-dot" cx="72" cy="91" r="3" />
    </Frame>
  )
}

function HooksVisual() {
  return (
    <Frame label="LIFECYCLE CONTRACT">
      <text className="bv-section bv-pop" x="28" y="52">GIT</text>
      <text className="bv-section bv-pop" x="244" y="52">AGENT</text>
      <path className="bv-line bv-draw" pathLength="1" d="M28 88 H292" />
      <g className="bv-pop">
        <circle className="bv-node" cx="42" cy="88" r="10" />
        <text className="bv-copy" x="42" y="112" textAnchor="middle">commit</text>
        <circle className="bv-node" cx="92" cy="88" r="10" />
        <text className="bv-copy" x="92" y="112" textAnchor="middle">push</text>
      </g>
      <g className="bv-hook-gate">
        <rect className="bv-gate" x="143" y="58" width="34" height="60" rx="6" />
        <text className="bv-title" x="160" y="84" textAnchor="middle">HOOK</text>
        <circle className="bv-hook-signal" cx="160" cy="99" r="4" />
      </g>
      <g className="bv-hook-packet">
        <circle className="bv-packet" cx="124" cy="88" r="6" />
      </g>
      <g className="bv-agent-event" transform="translate(8 0)" opacity="0.25">
        <rect className="bv-panel" x="204" y="66" width="30" height="18" rx="4" />
        <text className="bv-copy" x="219" y="78" textAnchor="middle">PRE</text>
      </g>
      <g className="bv-agent-event" transform="translate(8 0)" opacity="0.25">
        <rect className="bv-panel" x="242" y="66" width="34" height="18" rx="4" />
        <text className="bv-copy" x="259" y="78" textAnchor="middle">TOOL</text>
      </g>
      <g className="bv-agent-event" transform="translate(8 0)" opacity="0.25">
        <rect className="bv-panel" x="222" y="96" width="38" height="18" rx="4" />
        <text className="bv-copy" x="241" y="108" textAnchor="middle">POST</text>
      </g>
      <rect className="bv-track" x="28" y="143" width="264" height="4" rx="2" />
      <rect className="bv-observe-line" x="28" y="143" width="264" height="4" rx="2" />
      <text className="bv-copy" x="28" y="163">OBSERVE · INTERCEPT · GOVERN</text>
    </Frame>
  )
}

function RagVisual() {
  return (
    <Frame label="RAG / GROUNDED ANSWER">
      <g className="bv-pop">
        <rect className="bv-panel" x="22" y="45" width="72" height="94" rx="6" />
        <text className="bv-title" x="34" y="61">DOCUMENT</text>
        {[0, 1, 2, 3].map(index => (
          <rect className="bv-rag-chunk" key={index} x="34" y={72 + index * 14} width={index === 3 ? 36 : 48} height="7" rx="2" />
        ))}
      </g>
      <path className="bv-line bv-draw" pathLength="1" d="M94 92 H132 M191 92 H222" />
      <g>
        <circle className="bv-node" cx="161" cy="92" r="32" />
        {[[149, 81], [163, 75], [176, 86], [151, 101], [169, 105]].map(([x, y], index) => (
          <circle className={`bv-vector-dot ${index < 2 ? 'bv-retrieved' : ''}`} key={`${x}-${y}`} cx={x} cy={y} r={index < 2 ? 4 : 3} />
        ))}
        <text className="bv-copy" x="161" y="132" textAnchor="middle">VECTOR + GRAPH</text>
      </g>
      <g className="bv-rag-query">
        <rect className="bv-panel bv-panel--accent" x="108" y="45" width="58" height="19" rx="4" />
        <text className="bv-copy" x="137" y="58" textAnchor="middle">QUERY</text>
      </g>
      <g className="bv-answer">
        <rect className="bv-panel" x="222" y="45" width="76" height="94" rx="6" />
        <text className="bv-title" x="234" y="62">ANSWER</text>
        <rect className="bv-answer-line" x="234" y="74" width="50" height="5" rx="2" />
        <rect className="bv-answer-line" x="234" y="86" width="42" height="5" rx="2" />
        <rect className="bv-answer-line" x="234" y="98" width="47" height="5" rx="2" />
        <text className="bv-citation" x="234" y="119" opacity="0.25">[1] parent chunk</text>
        <text className="bv-citation" x="234" y="130" opacity="0.25">[2] source graph</text>
      </g>
      <text className="bv-copy" x="22" y="160">HALLUCINATION</text>
      <rect className="bv-track" x="108" y="153" width="190" height="6" rx="3" />
      <rect className="bv-hallucination" x="108" y="153" width="190" height="6" rx="3" />
    </Frame>
  )
}
