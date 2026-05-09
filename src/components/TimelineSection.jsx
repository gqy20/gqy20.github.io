import { useMemo, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useProjectsData } from '../hooks/useProjectsData.js'
import { timelineStages } from '../data/timeline.js'
import './TimelineSection.css'

/* parse messy date strings: "2025-12-07" / "2024-08→12" / "2025-12" / "2026-02" */
function parseDateValue(s) {
  if (!s) return 0
  const cleaned = String(s).replace(/[→~—].*$/, '').trim()
  const parts = cleaned.split('-').filter(Boolean)
  const [y, m = '01', d = '01'] = parts
  const yyyy = (y || '').padStart(4, '0')
  const mm = (m || '01').padStart(2, '0')
  const dd = (d || '01').padStart(2, '0')
  const t = Date.parse(`${yyyy}-${mm}-${dd}T00:00:00`)
  return Number.isNaN(t) ? 0 : t
}

function formatTickDate(s) {
  if (!s) return ''
  const cleaned = String(s).replace(/[→~—].*$/, '').trim()
  const parts = cleaned.split('-').filter(Boolean)
  if (parts.length >= 2) return `${parts[0]}.${parts[1].padStart(2, '0')}`
  return cleaned
}

export default function TimelineSection() {
  const { data: projectData } = useProjectsData()
  const [activeStage, setActiveStage] = useState(timelineStages[0]?.id)

  const projectsByName = useMemo(() => {
    const projects = projectData?.allProjects || []
    return new Map(projects.map(p => [p.name, p]))
  }, [projectData])

  const getProject = (name) => projectsByName.get(name)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting)
        if (visible.length === 0) return
        const sorted = visible.sort(
          (a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top)
        )
        const id = sorted[0].target.id.replace('stage-', '')
        setActiveStage(id)
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: 0 }
    )
    timelineStages.forEach(stage => {
      const el = document.getElementById(`stage-${stage.id}`)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const handleNavClick = (stageId) => {
    const el = document.getElementById(`stage-${stageId}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="tl-section" id="timeline">
      {/* Sticky mini stage navigator */}
      <nav className="tl-mininav" aria-label="时间线阶段导航">
        <div className="tl-mininav__inner">
          {timelineStages.map((stage, i) => (
            <button
              key={stage.id}
              type="button"
              onClick={() => handleNavClick(stage.id)}
              className={`tl-mininav__item ${activeStage === stage.id ? 'is-active' : ''}`}
            >
              <span className="tl-mininav__num">{String(i + 1).padStart(2, '0')}</span>
              <span className="tl-mininav__dot" />
              <span className="tl-mininav__label">{stage.label}</span>
              <span className="tl-mininav__period">{stage.period}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="tl-shell">
        <div className="tl-track">
          {/* Column headers */}
          <div className="tl-headers">
            <span className="tl-header tl-header--world">AI 世界</span>
            <span className="tl-headers__spacer" />
            <span className="tl-header tl-header--me">我的开发</span>
          </div>

          {/* Central axis */}
          <div className="tl-axis" />

          {timelineStages.map((stage, i) => (
            <TimelineStage
              key={stage.id}
              stage={stage}
              getProject={getProject}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function TimelineStage({ stage, getProject, index }) {
  const items = useMemo(() => {
    const ind = (stage.industryEvents || []).map(e => ({ type: 'industry', date: e.date, data: e }))
    const proj = (stage.projects || []).map(p => ({ type: 'project', date: p.date, data: p }))
    return [...ind, ...proj].sort((a, b) => parseDateValue(a.date) - parseDateValue(b.date))
  }, [stage])

  return (
    <motion.div
      className="tl-stage"
      id={`stage-${stage.id}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: index * 0.08 }}
    >
      {/* Head row: node + stage label centered on axis */}
      <div className="tl-row tl-row--head">
        <span className="tl-row__cell tl-row__cell--left" />
        <div className="tl-node-block">
          <span className="tl-node__num">{String(index + 1).padStart(2, '0')}</span>
          <span className="tl-node__dot" />
          <span className="tl-node__name">{stage.label}</span>
          <span className="tl-node__period">{stage.period}</span>
        </div>
        <span className="tl-row__cell tl-row__cell--right" />
      </div>

      {/* Industry context: full-width on left side */}
      {stage.industryContext && (
        <div className="tl-row tl-row--context">
          <p className="tl-context">{stage.industryContext}</p>
          <span className="tl-row__cell" />
          <span className="tl-row__cell" />
        </div>
      )}

      {/* Time-merged dual-track: each row holds one event OR one project */}
      {items.map((item, i) => (
        <div className="tl-row tl-row--item" key={`${stage.id}-item-${i}`}>
          <div className="tl-col tl-col--world">
            {item.type === 'industry' && (
              <div className="tl-item tl-item--industry">
                <span className="tl-item__date">{item.data.date}</span>
                <h4 className="tl-item__title">{item.data.title}</h4>
                <p className="tl-item__desc">{item.data.description}</p>
              </div>
            )}
          </div>

          <div className="tl-tick">
            <span className="tl-tick__dot" />
            <span className="tl-tick__date">{formatTickDate(item.date)}</span>
          </div>

          <div className="tl-col tl-col--me">
            {item.type === 'project' && (() => {
              const project = getProject(item.data.name)
              const isHero = item.data.isHero
              return (
                <a
                  href={project?.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`tl-item tl-item--project ${isHero ? 'tl-item--hero' : ''} ${item.data.highlight ? 'tl-item--highlight' : ''}`}
                >
                  <div className="tl-item__head">
                    <h4 className="tl-item__title">{item.data.name}</h4>
                    <div className="tl-item__badges">
                      {project?.stars > 0 && <span className="tl-item__stars">{project.stars}★</span>}
                      {isHero && <span className="tl-item__badge--hero">主角</span>}
                    </div>
                  </div>
                  <span className="tl-item__date">{item.data.date}</span>
                  <p className="tl-item__desc">{item.data.description}</p>
                  <div className="tl-item__tags">
                    {(item.data.tags || []).map(tag => (
                      <span key={tag} className="tl-tag">{tag}</span>
                    ))}
                  </div>
                </a>
              )
            })()}
          </div>
        </div>
      ))}

      {/* Insight: right-aligned reflection */}
      {stage.stageInsight && (
        <div className="tl-row tl-row--insight">
          <span className="tl-row__cell" />
          <span className="tl-row__cell" />
          <p className="tl-insight">{stage.stageInsight}</p>
        </div>
      )}
    </motion.div>
  )
}
