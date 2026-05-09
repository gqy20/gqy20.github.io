import { motion } from 'framer-motion'
import { FaGithub, FaExternalLinkAlt, FaStar } from 'react-icons/fa'

export default function TimelineNode({ type = 'project', data, getProject, index = 0 }) {
  const isIndustry = type === 'industry'
  const isHero = data.isHero
  const project = type === 'project' ? getProject?.(data.name) : null

  return (
    <motion.article
      className={`tl-node ${isIndustry ? 'tl-node--industry' : 'tl-node--project'} ${isHero ? 'tl-node--hero' : ''}`}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.42, delay: index * 0.05 }}
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
      <span className="tl-node__date">{data.date}</span>
      <h4 className="tl-node__title">{data.title}</h4>
      <p className="tl-node__desc">{data.description}</p>
    </>
  )
}

function ProjectContent({ data, project, isHero }) {
  return (
    <>
      <div className="tl-node__header">
        <h4 className="tl-node__title">{data.name}</h4>
        <div className="tl-node__badges">
          {project?.stars > 0 && (
            <span className="tl-node__stars"><FaStar /> {project.stars}</span>
          )}
          {isHero && <span className="tl-node__hero-badge">主角</span>}
          {data.highlight && !isHero && <span className="tl-node__highlight-badge">★</span>}
        </div>
      </div>
      <span className="tl-node__date">{data.date}</span>
      <p className={`tl-node__desc ${isHero ? 'tl-node__desc--hero' : ''}`}>{data.description}</p>
      {data.tags && (
        <div className="tl-node__tags">
          {data.tags.map(tag => (
            <span key={tag} className="tl-tag">{tag}</span>
          ))}
        </div>
      )}
      {(project?.url || project?.homepage) && (
        <div className="tl-node__actions">
          {project?.url && (
            <a href={project.url} target="_blank" rel="noreferrer" className="tl-node__link">
              <FaGithub /> GitHub
            </a>
          )}
          {project?.homepage && (
            <a href={project.homepage} target="_blank" rel="noreferrer" className="tl-node__link">
              <FaExternalLinkAlt /> 访问
            </a>
          )}
        </div>
      )}
    </>
  )
}
