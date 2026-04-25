import { motion } from 'framer-motion'
import TimelineNode from './TimelineNode.jsx'

export default function TimelineStage({ stage, getProject, stageIndex }) {
  const isLeft = stage.side === 'left'
  const industryCol = isLeft ? 'ai-timeline-nodes-left' : 'ai-timeline-nodes-right'
  const projectCol = isLeft ? 'ai-timeline-nodes-right' : 'ai-timeline-nodes-left'

  return (
    <motion.div
      className="ai-timeline-stage"
      data-side={stage.side}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5 }}
    >
      <div className="ai-stage-header">
        <span className="stage-label">{stage.label}</span>
        <h3>{stage.theme}</h3>
        <span className="ai-stage-period">{stage.period}</span>
        <span className="ai-stage-theme">{stage.label} · {stage.theme}</span>
      </div>

      <div className={industryCol}>
        {stage.industryContext && (
          <div className="ai-industry-context">{stage.industryContext}</div>
        )}
        {stage.industryEvents.map((event, i) => (
          <TimelineNode
            key={`industry-${stage.id}-${i}`}
            type="industry"
            data={event}
            index={i}
          />
        ))}
      </div>

      <div className={projectCol}>
        {stage.projects.map((proj, i) => (
          <TimelineNode
            key={`project-${stage.id}-${i}`}
            type="project"
            data={proj}
            getProject={getProject}
            index={i}
          />
        ))}
      </div>

      <div className="ai-stage-insight">{stage.stageInsight}</div>
    </motion.div>
  )
}
