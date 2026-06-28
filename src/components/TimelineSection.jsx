import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useProjectsData } from '../hooks/useProjectsData.js'
import { timelineStages } from '../data/timeline.js'
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
      { threshold: [0.25, 0.5, 0.75] }
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
    <section className="tl-section" id="timeline">
      {/* Vertical dial — sticky, aligned with panel content */}
      <aside className="tl-dial-col" aria-label="阶段导航">
        <nav className="tl-dial">
          <span className="tl-dial__page-title">04 · JOURNEY</span>
          <div className="tl-dial__track">
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
