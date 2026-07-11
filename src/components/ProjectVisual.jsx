import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap.js'

const VISUALS = {
  TrumanWorld: TrumanWorldVisual,
  IssueLab: IssueLabVisual,
  biotools_agent: BioToolsVisual,
  zotero_cli: ZoteroVisual,
}

export default function ProjectVisual({ projectName }) {
  const rootRef = useRef(null)
  const Visual = VISUALS[projectName] || BioToolsVisual

  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add({
      reduce: '(prefers-reduced-motion: reduce)',
      animate: '(prefers-reduced-motion: no-preference)',
    }, ({ conditions }) => {
      if (conditions.reduce) {
        gsap.set('.pv-flow', { strokeDashoffset: 0 })
        gsap.set('.pv-reveal', { opacity: 1, y: 0 })
        gsap.set('.pv-meter', { scaleX: 1 })
        gsap.set('.pv-tick-current', { opacity: 0 })
        gsap.set('.pv-tick-next, .pv-event, .pv-relationship', { opacity: 1 })
        return
      }

      const timeline = gsap.timeline({
        paused: true,
        defaults: { ease: 'power2.out' },
      })

      timeline
        .fromTo('.pv-flow',
          { strokeDashoffset: 1, opacity: 0.42 },
          { strokeDashoffset: 0, opacity: 1, duration: 0.7, stagger: 0.11, ease: 'power2.inOut' })
        .fromTo('.pv-reveal',
          { opacity: 0.68, y: 4 },
          { opacity: 1, y: 0, duration: 0.34, stagger: 0.08 },
          '-=0.55')
        .fromTo('.pv-meter',
          { scaleX: 0, transformOrigin: 'left center' },
          { scaleX: 1, duration: 0.55, stagger: 0.1 },
          '-=0.3')
        .fromTo('.pv-pulse',
          { scale: 0.92, opacity: 0.45, transformOrigin: 'center' },
          { scale: 1.08, opacity: 1, duration: 0.3, stagger: 0.08, yoyo: true, repeat: 1 },
          '-=0.3')

      if (projectName === 'TrumanWorld') {
        timeline
          .set('.pv-tick-next, .pv-event, .pv-relationship', { opacity: 0 }, 0)
          .fromTo('.pv-move',
            { x: -121, y: -55 },
            { x: 0, y: 0, duration: 0.9, ease: 'power2.inOut' },
            '-=0.15')
          .fromTo('.pv-relationship',
            { opacity: 0, strokeDashoffset: 1 },
            { opacity: 1, strokeDashoffset: 0, duration: 0.35, ease: 'power3.out' })
          .to('.pv-tick-current', { opacity: 0, duration: 0.18 }, '<')
          .to('.pv-tick-next', { opacity: 1, duration: 0.18 }, '<')
          .fromTo('.pv-event',
            { opacity: 0, y: 4 },
            { opacity: 1, y: 0, duration: 0.35 })
      }

      const trigger = projectName === 'TrumanWorld'
        ? null
        : ScrollTrigger.create({
            trigger: rootRef.current,
            start: 'clamp(top 88%)',
            end: 'clamp(bottom 8%)',
            onEnter: () => timeline.play(),
            onEnterBack: () => timeline.play(),
            onLeave: () => timeline.pause(),
            onLeaveBack: () => timeline.pause(),
          })

      if (projectName === 'TrumanWorld') timeline.play()

      return () => {
        trigger?.kill()
        timeline.kill()
      }
    })
    return () => mm.revert()
  }, { scope: rootRef, dependencies: [projectName] })

  return (
    <div className={`project-visual project-visual--${projectName.toLowerCase()}`} ref={rootRef} aria-hidden="true">
      <Visual />
    </div>
  )
}

function Frame({ children, label }) {
  return (
    <svg viewBox="0 0 640 300" focusable="false">
      <rect className="pv-frame" x="0.5" y="0.5" width="639" height="299" rx="10" />
      <text className="pv-kicker" x="24" y="30">{label}</text>
      <circle className="pv-status" cx="592" cy="25" r="4" />
      <circle className="pv-status pv-status--dim" cx="608" cy="25" r="4" />
      {children}
    </svg>
  )
}

function TrumanWorldVisual() {
  const locations = [
    { x: 105, y: 86, label: '海滨公寓' },
    { x: 365, y: 88, label: '港务办公室' },
    { x: 242, y: 151, label: '街角咖啡馆', active: true },
    { x: 118, y: 215, label: '小镇广场' },
    { x: 382, y: 215, label: '海湾医院' },
  ]

  return (
    <Frame label="TRUMAN WORLD / LIVE">
      <text className="pv-copy pv-tick-current" x="394" y="29">DAY 1 · TICK 248</text>
      <text className="pv-copy pv-copy--accent pv-tick-next" x="394" y="29">DAY 1 · TICK 249</text>

      <g className="pv-town-roads">
        <path className="pv-flow" pathLength="1" d="M105 86 L242 151 L365 88" />
        <path className="pv-flow" pathLength="1" d="M105 86 L118 215 L242 151 L382 215 L365 88" />
        <path className="pv-flow" pathLength="1" d="M118 215 H382" />
        <path className="pv-flow pv-flow--accent" pathLength="1" d="M105 86 C132 112 184 129 242 151" />
      </g>

      {locations.map(location => (
        <g className="pv-reveal pv-location" key={location.label}>
          <circle className={location.active ? 'pv-location-ring pv-location-ring--active' : 'pv-location-ring'} cx={location.x} cy={location.y} r={location.active ? 29 : 19} />
          {location.active
            ? <rect className="pv-location-core pv-location-core--active" x={location.x - 3} y={location.y - 3} width="6" height="6" rx="1" />
            : <circle className="pv-location-core" cx={location.x} cy={location.y} r="5" />}
          <text className="pv-copy" x={location.x} y={location.y + (location.active ? 43 : 31)} textAnchor="middle">{location.label}</text>
        </g>
      ))}

      <g className="pv-reveal pv-resident pv-move">
        <circle className="pv-resident-ring pv-resident-ring--truman" cx="226" cy="141" r="7" />
        <circle className="pv-resident-core" cx="226" cy="141" r="2.5" />
        <text className="pv-resident-label" x="214" y="133">T</text>
      </g>
      <g className="pv-reveal pv-resident">
        <circle className="pv-resident-ring" cx="260" cy="141" r="7" />
        <circle className="pv-resident-core" cx="260" cy="141" r="2.5" />
        <text className="pv-resident-label" x="267" y="145">M</text>
      </g>
      <g className="pv-reveal pv-resident">
        <circle className="pv-resident-ring pv-resident-ring--cool" cx="350" cy="80" r="7" />
        <circle className="pv-resident-core" cx="350" cy="80" r="2.5" />
        <text className="pv-resident-label" x="338" y="70">L</text>
      </g>
      <g className="pv-reveal pv-resident">
        <circle className="pv-resident-ring pv-resident-ring--cool" cx="132" cy="207" r="7" />
        <circle className="pv-resident-core" cx="132" cy="207" r="2.5" />
        <text className="pv-resident-label" x="138" y="199">B</text>
      </g>

      <path className="pv-relationship" pathLength="1" d="M233 138 C241 127 252 127 253 138" />

      <g className="pv-reveal pv-world-state">
        <rect className="pv-panel" x="480" y="53" width="136" height="184" rx="8" />
        <text className="pv-title" x="498" y="77">WORLD STATE</text>
        <text className="pv-copy" x="498" y="101">CONTINUITY</text>
        <text className="pv-copy" x="596" y="101" textAnchor="end">86</text>
        <rect className="pv-track" x="498" y="109" width="98" height="4" rx="2" />
        <rect className="pv-state-meter pv-meter" x="498" y="109" width="84" height="4" rx="2" />
        <text className="pv-copy" x="498" y="136">SOCIAL ACTIVITY</text>
        <text className="pv-copy" x="596" y="136" textAnchor="end">72</text>
        <rect className="pv-track" x="498" y="144" width="98" height="4" rx="2" />
        <rect className="pv-state-meter pv-state-meter--cool pv-meter" x="498" y="144" width="71" height="4" rx="2" />
        <text className="pv-copy" x="498" y="171">SUSPICION</text>
        <text className="pv-copy pv-copy--accent" x="596" y="171" textAnchor="end">14</text>
        <rect className="pv-track" x="498" y="179" width="98" height="4" rx="2" />
        <rect className="pv-state-meter pv-state-meter--warning pv-meter" x="498" y="179" width="14" height="4" rx="2" />
        <text className="pv-copy" x="498" y="211">3 active · 1 talking</text>
      </g>

      <g className="pv-event">
        <rect className="pv-event-bar" x="30" y="258" width="432" height="26" rx="6" />
        <circle className="pv-status" cx="45" cy="271" r="3" />
        <text className="pv-copy" x="56" y="274">EVENT · Truman met Marlon at the café</text>
      </g>
    </Frame>
  )
}

function IssueLabVisual() {
  return (
    <Frame label="ISSUE / REVIEW FLOW">
      <g className="pv-reveal">
        <rect className="pv-panel" x="30" y="66" width="156" height="164" rx="7" />
        <text className="pv-title" x="47" y="90">ISSUE #42</text>
        <rect className="pv-line" x="47" y="105" width="112" height="4" rx="2" />
        <rect className="pv-line" x="47" y="117" width="84" height="4" rx="2" />
        <text className="pv-copy pv-copy--accent" x="47" y="153">/review</text>
        <text className="pv-copy" x="47" y="178">@reviewer_a</text>
        <text className="pv-copy" x="47" y="196">@reviewer_b</text>
        <text className="pv-copy" x="47" y="214">@summarizer</text>
      </g>
      <path className="pv-flow pv-flow--accent" pathLength="1" d="M186 148 H246" />
      <path className="pv-flow" pathLength="1" d="M298 148 C340 148 334 87 382 87" />
      <path className="pv-flow" pathLength="1" d="M298 148 H382" />
      <path className="pv-flow" pathLength="1" d="M298 148 C340 148 334 209 382 209" />
      <g className="pv-reveal">
        <rect className="pv-panel pv-panel--accent" x="246" y="118" width="52" height="60" rx="8" />
        <text className="pv-title" x="272" y="144" textAnchor="middle">GH</text>
        <text className="pv-copy" x="272" y="162" textAnchor="middle">ACTION</text>
      </g>
      {[[382, 62, 'REVIEW +'], [382, 123, 'CRITIQUE'], [382, 184, 'SUMMARY']].map(([x, y, text]) => (
        <g className="pv-reveal" key={text}>
          <rect className="pv-panel" x={x} y={y} width="118" height="50" rx="7" />
          <circle className="pv-pulse pv-dot" cx={x + 18} cy={y + 18} r="5" />
          <text className="pv-title" x={x + 32} y={y + 21}>{text}</text>
          <rect className="pv-line pv-meter" x={x + 16} y={y + 34} width="83" height="3" rx="1.5" />
        </g>
      ))}
      <path className="pv-flow pv-flow--accent" pathLength="1" d="M500 87 C554 87 552 148 602 148 M500 148 H602 M500 209 C554 209 552 148 602 148" />
      <circle className="pv-pulse pv-node" cx="602" cy="148" r="10" />
      <text className="pv-copy" x="558" y="176">POST COMMENT</text>
    </Frame>
  )
}

function BioToolsVisual() {
  return (
    <Frame label="REPOSITORY ANALYSIS">
      <g className="pv-reveal">
        <rect className="pv-panel" x="28" y="60" width="174" height="188" rx="7" />
        <text className="pv-title" x="45" y="84">REPOSITORY</text>
        {['src/', 'tests/', 'pyproject.toml', 'uv.lock', 'README.md'].map((text, index) => (
          <g key={text}>
            <rect className="pv-file" x="46" y={101 + index * 26} width="12" height="14" rx="2" />
            <text className="pv-copy" x="68" y={112 + index * 26}>{text}</text>
          </g>
        ))}
      </g>
      <path className="pv-flow pv-flow--accent" pathLength="1" d="M202 154 H252" />
      <g className="pv-reveal">
        <circle className="pv-ring" cx="285" cy="154" r="31" />
        <circle className="pv-pulse pv-dot" cx="285" cy="154" r="8" />
        <text className="pv-copy" x="285" y="199" textAnchor="middle">AGENT SDK</text>
      </g>
      <path className="pv-flow" pathLength="1" d="M316 154 H354" />
      {[
        ['DEPENDENCY', 66, 0.84],
        ['SECURITY', 121, 0.68],
        ['ARCHITECTURE', 176, 0.92],
      ].map(([text, y, width]) => (
        <g className="pv-reveal" key={text}>
          <rect className="pv-panel" x="354" y={y} width="148" height="43" rx="7" />
          <text className="pv-title" x="370" y={y + 18}>{text}</text>
          <rect className="pv-track" x="370" y={y + 27} width="112" height="4" rx="2" />
          <rect className="pv-line pv-meter" x="370" y={y + 27} width={112 * width} height="4" rx="2" />
        </g>
      ))}
      <path className="pv-flow pv-flow--accent" pathLength="1" d="M502 154 H542" />
      <g className="pv-reveal">
        <path className="pv-report" d="M542 76 H606 V226 H522 V96 Z" />
        <path className="pv-report-fold" d="M522 96 H542 V76" />
        <text className="pv-title" x="540" y="120">REPORT</text>
        <rect className="pv-line" x="540" y="136" width="48" height="4" rx="2" />
        <rect className="pv-line" x="540" y="149" width="54" height="4" rx="2" />
        <rect className="pv-line" x="540" y="162" width="39" height="4" rx="2" />
        <text className="pv-copy pv-copy--accent" x="540" y="198">JSON / HTML</text>
      </g>
    </Frame>
  )
}

function ZoteroVisual() {
  return (
    <Frame label="ZOT / HYBRID MODE">
      <g className="pv-reveal">
        <rect className="pv-terminal" x="26" y="62" width="204" height="174" rx="7" />
        <circle className="pv-terminal-dot" cx="43" cy="78" r="3" />
        <circle className="pv-terminal-dot pv-terminal-dot--dim" cx="55" cy="78" r="3" />
        <text className="pv-copy pv-copy--light" x="43" y="110">$ zot find "CRISPR"</text>
        <text className="pv-copy pv-copy--accent" x="43" y="132">--fulltext --json</text>
        <text className="pv-copy pv-copy--light pv-reveal" x="43" y="166">12 items · local</text>
        <text className="pv-copy pv-copy--light pv-reveal" x="43" y="185">3 PDFs · 18 annotations</text>
      </g>
      <path className="pv-flow pv-flow--accent" pathLength="1" d="M230 149 H276" />
      <g className="pv-reveal">
        <rect className="pv-panel pv-panel--accent" x="276" y="107" width="108" height="84" rx="8" />
        <text className="pv-title" x="330" y="135" textAnchor="middle">HYBRID</text>
        <text className="pv-copy" x="330" y="157" textAnchor="middle">LOCAL FIRST</text>
        <text className="pv-copy" x="330" y="174" textAnchor="middle">WEB FALLBACK</text>
      </g>
      <path className="pv-flow" pathLength="1" d="M384 149 C418 149 414 94 450 94" />
      <path className="pv-flow" pathLength="1" d="M384 149 C418 149 414 206 450 206" />
      <g className="pv-reveal">
        <rect className="pv-panel" x="450" y="67" width="78" height="54" rx="7" />
        <text className="pv-title" x="489" y="91" textAnchor="middle">PDF</text>
        <rect className="pv-highlight" x="467" y="101" width="44" height="5" rx="2" />
      </g>
      <g className="pv-reveal">
        <rect className="pv-panel" x="450" y="179" width="78" height="54" rx="7" />
        <text className="pv-title" x="489" y="203" textAnchor="middle">ZOTERO</text>
        <text className="pv-copy" x="489" y="219" textAnchor="middle">SQLite</text>
      </g>
      <path className="pv-flow pv-flow--accent" pathLength="1" d="M528 94 C548 94 540 137 552 143 M528 206 C548 206 540 163 552 157" />
      <g className="pv-reveal">
        <rect className="pv-panel pv-panel--accent" x="552" y="126" width="66" height="48" rx="7" />
        <text className="pv-title" x="585" y="147" textAnchor="middle">EXPORT</text>
        <text className="pv-copy" x="585" y="162" textAnchor="middle">BIBTEX</text>
      </g>
    </Frame>
  )
}
