import { AnimatePresence, motion } from 'framer-motion'
import {
  FaArchive,
  FaCodeBranch,
  FaExternalLinkAlt,
  FaGithub,
  FaStar,
  FaTimes
} from 'react-icons/fa'
import './ProjectDetailModal.css'
import { getLinkText } from '../utils/projectUtils'

const ProjectDetailModal = ({ project, isOpen, onClose }) => {
  if (!project) return null

  const narrative = project.narrative

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleBackdropClick}
        >
          <motion.article
            className="project-modal"
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 18 }}
            transition={{ duration: 0.25 }}
          >
            <header className="project-modal-header">
              <div>
                <p>{project.portfolioTrack?.label || project.category}</p>
                <h2>{project.name}</h2>
                {project.isArchived && <span className="archive-note"><FaArchive /> 已归档</span>}
              </div>
              <button type="button" className="modal-close" onClick={onClose} aria-label="关闭详情">
                <FaTimes />
              </button>
            </header>

            <section className="project-modal-story">
              <h3>{narrative.title}</h3>
              <p>{narrative.summary}</p>
            </section>

            <div className="story-grid">
              <section>
                <span>问题</span>
                <p>{narrative.problem}</p>
              </section>
              <section>
                <span>AI 角色</span>
                <p>{narrative.aiRole}</p>
              </section>
            </div>

            <section className="built-section">
              <span>我构建了</span>
              <div>
                {narrative.built.map(item => <em key={item}>{item}</em>)}
              </div>
            </section>

            <section className="project-facts">
              <div><strong>{project.language || 'Unknown'}</strong><span>主要语言</span></div>
              <div><strong><FaStar /> {project.stars || 0}</strong><span>Stars</span></div>
              <div><strong><FaCodeBranch /> {project.forks || 0}</strong><span>Forks</span></div>
            </section>

            {project.tags?.length > 0 && (
              <section className="built-section muted">
                <span>技术标签</span>
                <div>
                  {project.tags.map(tag => <em key={tag}>{tag}</em>)}
                </div>
              </section>
            )}

            <footer className="project-modal-actions">
              <a href={project.url} target="_blank" rel="noopener noreferrer">
                <FaGithub /> GitHub
              </a>
              {project.homepage && (
                <a href={project.homepage} target="_blank" rel="noopener noreferrer">
                  <FaExternalLinkAlt /> {getLinkText(project.homepage)}
                </a>
              )}
            </footer>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ProjectDetailModal
