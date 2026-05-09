import { useMemo, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useProjectsData } from '../hooks/useProjectsData.js'
import { timelineStages } from '../data/timeline.js'
import './TimelineSection.css'

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

      {/* Dual-track items */}
      <div className="tl-row tl-row--items">
        <div className="tl-col tl-col--world">
          {stage.industryEvents.map((event, i) => (
            <div key={`ind-${i}`} className="tl-item tl-item--industry">
              <span className="tl-item__date">{event.date}</span>
              <h4 className="tl-item__title">{event.title}</h4>
              <p className="tl-item__desc">{event.description}</p>
            </div>
          ))}
        </div>
        <span className="tl-row__cell tl-row__cell--gutter" />
        <div className="tl-col tl-col--me">
          {stage.projects.map((proj, i) => {
            const project = getProject(proj.name)
            const isHero = proj.isHero
            return (
              <a
                key={`proj-${i}`}
                href={project?.url}
                target="_blank"
                rel="noreferrer"
                className={`tl-item tl-item--project ${isHero ? 'tl-item--hero' : ''} ${proj.highlight ? 'tl-item--highlight' : ''}`}
              >
                <div className="tl-item__head">
                  <h4 className="tl-item__title">{proj.name}</h4>
                  <div className="tl-item__badges">
                    {project?.stars > 0 && <span className="tl-item__stars">{project.stars}★</span>}
                    {isHero && <span className="tl-item__badge--hero">主角</span>}
                  </div>
                </div>
                <span className="tl-item__date">{proj.date}</span>
                <p className="tl-item__desc">{proj.description}</p>
                <div className="tl-item__tags">
                  {proj.tags.map(tag => (
                    <span key={tag} className="tl-tag">{tag}</span>
                  ))}
                </div>
              </a>
            )
          })}
        </div>
      </div>

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
