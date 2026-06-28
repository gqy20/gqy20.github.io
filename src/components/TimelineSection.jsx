import { useEffect, useState, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useProjectsData } from '../hooks/useProjectsData.js'
import { timelineStages } from '../data/timeline.js'
import { gsap, SplitText, useGSAP } from '../lib/gsap.js'
import './TimelineSection.css'

/* show featured items if any are flagged, otherwise fall back to first 3 */
function pickFeatured(arr) {
  const flagged = (arr || []).filter(x => x.featured)
  if (flagged.length) return flagged
  return (arr || []).slice(0, 3)
}

export default function TimelineSection() {
  const { data: projectData } = useProjectsData()
  const [activeStage, setActiveStage] = useState(timelineStages[0]?.id)
  const sectionRef = useRef(null)

  // dial 进度条:随时间线滚动连续填充(桌面端;reduced-motion 直接填满)
  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add({
      isDesktop: '(min-width: 761px)',
      isReduce: '(prefers-reduced-motion: reduce)'
    }, ({ conditions }) => {
      const { isDesktop, isReduce } = conditions
      if (!isDesktop) return
      if (isReduce) {
        gsap.set('.tl-dial__progress', { scaleY: 1 })
        return
      }
      gsap.fromTo('.tl-dial__progress',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '.tl-section',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.4
          }
        }
      )

      // 巨型编号景深:随 panel 滚过视口,小→大→小 + 视差位移
      gsap.utils.toArray('.tl-panel__anchor-num').forEach((num) => {
        const panel = num.closest('.tl-panel')
        gsap.fromTo(num,
          { scale: 0.7, opacity: 0.15, y: 60 },
          {
            keyframes: [
              { scale: 1.15, opacity: 0.85, y: 0 },
              { scale: 0.7, opacity: 0.15, y: -60 }
            ],
            ease: 'none',
            scrollTrigger: {
              trigger: panel,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.3
            }
          }
        )
      })

      // insight 金句:行遮罩揭示(进视口时行从下方滑入)
      gsap.utils.toArray('.tl-panel__insight').forEach((insight) => {
        const split = SplitText.create(insight, { type: 'lines', mask: 'lines' })
        gsap.from(split.lines, {
          yPercent: 100,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: insight,
            start: 'top bottom',
            once: true
          }
        })
      })
    })
    return () => mm.revert()
  }, { scope: sectionRef })

  const projectsByName = useMemo(() => {
    const projects = projectData?.allProjects || []
    return new Map(projects.map(p => [p.name, p]))
  }, [projectData])

  const getProject = (name) => projectsByName.get(name)

  /* drive the dial highlight by which panel dominates the viewport */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) {
          setActiveStage(visible[0].target.id.replace('stage-', ''))
        }
      },
      { rootMargin: '-25% 0px -50% 0px', threshold: [0, 0.5, 1] }
    )
    timelineStages.forEach(s => {
      const el = document.getElementById(`stage-${s.id}`)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const handleNavClick = (stageId) => {
    document.getElementById(`stage-${stageId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  /* page-flip 翻页已移除：改为连续滚动（参考 Seiter Design 时间线）*/

  return (
    <section className="tl-section" id="timeline" ref={sectionRef}>
      {/* Vertical dial — sticky, aligned with panel content */}
      <aside className="tl-dial-col" aria-label="阶段导航">
        <nav className="tl-dial">
          <span className="tl-dial__page-title">04 · JOURNEY</span>
          <div className="tl-dial__track">
            <span className="tl-dial__progress" aria-hidden="true" />
            {timelineStages.map((stage, i) => {
              const isActive = activeStage === stage.id
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => handleNavClick(stage.id)}
                  className={`tl-dial__item ${isActive ? 'is-active' : ''}`}
                  aria-current={isActive ? 'true' : undefined}
                >
                  <span className="tl-dial__num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="tl-dial__label">{stage.label}</span>
                </button>
              )
            })}
          </div>
          <span className="tl-dial__footer">
            {timelineStages.findIndex(s => s.id === activeStage) + 1} / {timelineStages.length}
          </span>
          <Link to="/" className="tl-dial__home">← 首页</Link>
        </nav>
      </aside>

      {/* Panels — one per stage, page-flip container */}
      <div className="tl-panels">
        {timelineStages.map((stage, i) => (
          <TimelinePanel
            key={stage.id}
            stage={stage}
            index={i}
            getProject={getProject}
          />
        ))}
      </div>
    </section>
  )
}

function TimelinePanel({ stage, index, getProject }) {
  const events = useMemo(() => pickFeatured(stage.industryEvents), [stage])
  const projects = useMemo(() => pickFeatured(stage.projects), [stage])

  return (
    <motion.article
      className="tl-panel"
      id={`stage-${stage.id}`}
      data-stagenum={String(index + 1).padStart(2, '0')}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-15%' }}
      transition={{ duration: 0.55 }}
    >
      {/* ── Left Anchor ── */}
      <div className="tl-panel__anchor">
        <span className="tl-panel__anchor-num">{String(index + 1).padStart(2, '0')}</span>
        <h2 className="tl-panel__title">{stage.label}</h2>
        <div className="tl-panel__meta">
          <span className="tl-panel__period">{stage.period}</span>
          {stage.theme && <span className="tl-panel__theme">{stage.theme}</span>}
        </div>
        {stage.industryContext && (
          <p className="tl-panel__context">{stage.industryContext}</p>
        )}
      </div>

      {/* ── Right Content (flowing items) ── */}
      <div className="tl-panel__content">
        {events.length > 0 && (
          <>
            <span className="tl-section-label tl-section-label--world">AI 世界</span>
            <div className="tl-items-row">
              {events.map((e, i) => (
                <div key={i} className="tl-event">
                  <span className="tl-event__date">{e.date}</span>
                  <h4 className="tl-event__title">{e.title}</h4>
                  <p className="tl-event__desc">{e.description}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {projects.length > 0 && (
          <>
            <span className="tl-section-label tl-section-label--me">我的开发</span>
            <div className="tl-items-row">
              {projects.map((p, i) => {
                const proj = getProject(p.name)
                const cls = [
                  'tl-project',
                  p.isHero && 'tl-project--hero',
                  p.highlight && 'tl-project--highlight',
                ].filter(Boolean).join(' ')
                return (
                  <a
                    key={i}
                    href={proj?.url || '#'}
                    target={proj?.url ? '_blank' : undefined}
                    rel={proj?.url ? 'noreferrer' : undefined}
                    className={cls}
                  >
                    <div className="tl-project__head">
                      <span className="tl-project__date">{p.date}</span>
                      {proj?.stars > 0 && (
                        <span className="tl-project__stars">{proj.stars}★</span>
                      )}
                      {p.isHero && <span className="tl-project__badge">主角</span>}
                    </div>
                    <h4 className="tl-project__title">{p.name}</h4>
                    <p className="tl-project__desc">{p.description}</p>
                    {p.tags?.length > 0 && (
                      <div className="tl-project__tags">
                        {p.tags.map(t => (
                          <span key={t} className="tl-tag">{t}</span>
                        ))}
                      </div>
                    )}
                  </a>
                )
              })}
            </div>
          </>
        )}

        {stage.stageInsight && (
          <p className="tl-panel__insight">{stage.stageInsight}</p>
        )}
      </div>
    </motion.article>
  )
}
