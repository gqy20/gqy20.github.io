import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useProjectsData } from '../hooks/useProjectsData.js'
import TimelineStage from './TimelineStage.jsx'
import { timelineStages } from '../data/timeline.js'

export default function TimelineSection() {
  const { data: projectData } = useProjectsData()

  const projectsByName = useMemo(() => {
    const projects = projectData?.allProjects || []
    return new Map(projects.map(p => [p.name, p]))
  }, [projectData])

  const getProject = (name) => projectsByName.get(name)

  return (
    <section className="ai-section ai-timeline-section" id="timeline">
      <div className="ai-shell">
        <motion.div
          className="ai-section-heading"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.42 }}
        >
          <p>时间线</p>
          <h2>从 AI 消费者到 Agent 社会构建者。</h2>
        </motion.div>

        <div className="ai-timeline-track">
          <div className="ai-timeline-axis" />
          {timelineStages.map((stage, i) => (
            <TimelineStage
              key={stage.id}
              stage={stage}
              getProject={getProject}
              stageIndex={i}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
