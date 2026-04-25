import { motion } from 'framer-motion'
import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa'

export default function TimelineNode({ type = 'project', data, getProject, index = 0 }) {
  const isIndustry = type === 'industry'
  const isHero = data.isHero
  const project = type === 'project' ? getProject?.(data.name) : null

  return (
    <motion.article
      className={`ai-tl-node ${isIndustry ? 'ai-tl-node--industry' : 'ai-tl-node--project'} ${isHero ? 'ai-tl-node--hero' : ''}`}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.42, delay: index * 0.06 }}
    >
      {isIndustry ? (
        <IndustryContent data={data} />
      ) : (
        <ProjectContent data={data} project={project} isHero={isHero} />
      )}
    </motion.article>
  )
}

function IndustryContent({ data }) {
  return (
    <>
      <span className="ai-tl-node-date">{data.date}</span>
      <h4>{data.title}</h4>
      <p className="ai-tl-node-desc">{data.description}</p>
    </>
  )
}

function ProjectContent({ data, project, isHero }) {
  return (
    <>
      <div className="ai-tl-node-header">
        <h4>{data.name}</h4>
        {project?.stars > 0 && (
          <span className="ai-tl-node-stars">{project.stars}</span>
        )}
        {isHero && <span className="ai-tl-node-hero-badge">主角项目</span>}
      </div>
      <span className="ai-tl-node-date">{data.date}</span>
      <p className={`ai-tl-node-desc ${isHero ? 'ai-tl-node-desc--hero' : ''}`}>{data.description}</p>
      {isHero && project && (
        <div className="ai-tl-node-built">
          <strong>构建了</strong>
          {(data.tags || []).map(tag => (
            <em key={tag}>{tag}</em>
          ))}
        </div>
      )}
      {data.tags && !isHero && (
        <div className="ai-tl-node-tags">
          {data.tags.map(tag => (
            <span key={tag} className="ai-tl-tag">{tag}</span>
          ))}
        </div>
      )}
      {(project?.url || project?.homepage) && (
        <div className="experiment-actions">
          {project?.url && (
            <a href={project.url} target="_blank" rel="noreferrer">
              <FaGithub /> GitHub
            </a>
          )}
          {project?.homepage && (
            <a href={project.homepage} target="_blank" rel="noreferrer">
              <FaExternalLinkAlt /> 访问
            </a>
          )}
        </div>
      )}
    </>
  )
}
