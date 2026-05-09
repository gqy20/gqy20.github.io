import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useProjectsData } from '../hooks/useProjectsData.js'
import { timelineStages } from '../data/timeline.js'
import './TimelineSection.css'

export default function TimelineSection() {
  const { data: projectData } = useProjectsData()

  const projectsByName = useMemo(() => {
    const projects = projectData?.allProjects || []
    return new Map(projects.map(p => [p.name, p]))
  }, [projectData])

  const getProject = (name) => projectsByName.get(name)

  return (
    <section className="tl-section" id="timeline">
      <div className="tl-shell">
        <div className="tl-track">
          {/* Column headers */}
          <div className="tl-headers">
            <span className="tl-header tl-header--world">AI 世界</span>
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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: index * 0.08 }}
    >
      {/* Node on axis */}
      <div className="tl-node">
        <span className="tl-node__num">{String(index + 1).padStart(2, '0')}</span>
        <span className="tl-node__dot" />
      </div>

      {/* Stage label */}
      <div className="tl-stage-label">
        <span className="tl-stage-label__name">{stage.label}</span>
        <span className="tl-stage-label__period">{stage.period}</span>
      </div>

      {/* Industry context as first left item */}
      {stage.industryContext && (
        <div className="tl-context-row">
          <p className="tl-context">{stage.industryContext}</p>
          <div className="tl-context-spacer" />
        </div>
      )}

      {/* Dual-track rows */}
      <div className="tl-rows">
        {/* Left: Industry events */}
        <div className="tl-col tl-col--world">
          {stage.industryEvents.map((event, i) => (
            <div key={`ind-${i}`} className="tl-item tl-item--industry">
              <span className="tl-item__date">{event.date}</span>
              <h4 className="tl-item__title">{event.title}</h4>
              <p className="tl-item__desc">{event.description}</p>
            </div>
          ))}
        </div>

        {/* Right: Projects */}
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

      {/* Stage insight */}
      {stage.stageInsight && (
        <div className="tl-insight-row">
          <div className="tl-insight-spacer" />
          <p className="tl-insight">{stage.stageInsight}</p>
        </div>
      )}
    </motion.div>
  )
}
