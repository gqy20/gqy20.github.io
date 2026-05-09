import { motion } from 'framer-motion'
import TimelineNode from './TimelineNode.jsx'

export default function TimelineStage({ stage, getProject, index }) {
  return (
    <motion.div
      className="tl-stage"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <div className="tl-stage__node" />

      <div className="tl-stage__body">
        <header className="tl-stage__head">
          <span className="tl-stage__num">{String(index + 1).padStart(2, '0')}</span>
          <div className="tl-stage__title-block">
            <h3 className="tl-stage__name">{stage.label}</h3>
            <span className="tl-stage__theme">{stage.theme}</span>
          </div>
          <span className="tl-stage__period">{stage.period}</span>
        </header>

        {stage.industryContext && (
          <p className="tl-stage__context">{stage.industryContext}</p>
        )}

        <div className="tl-stage__columns">
          <div className="tl-stage__col">
            <h4 className="tl-col-heading">行业事件</h4>
            {stage.industryEvents.map((event, i) => (
              <TimelineNode
                key={`industry-${stage.id}-${i}`}
                type="industry"
                data={event}
                index={i}
              />
            ))}
          </div>

          <div className="tl-stage__col">
            <h4 className="tl-col-heading">我的项目</h4>
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
        </div>

        {stage.stageInsight && (
          <p className="tl-stage__insight">{stage.stageInsight}</p>
        )}
      </div>
    </motion.div>
  )
}
