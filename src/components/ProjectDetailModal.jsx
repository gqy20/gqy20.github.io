import { motion, AnimatePresence } from 'framer-motion'
import {
  FaGithub,
  FaExternalLinkAlt,
  FaTimes,
  FaStar,
  FaCodeBranch,
  FaArchive,
  FaRegFileCode,
  FaTag
} from 'react-icons/fa'
import Badge from './Badge'
import Button from './Button'
import './ProjectDetailModal.css'
import { getExternalLinkIcon, normalizeDescription, getLinkText } from '../utils/projectUtils'

const ProjectDetailModal = ({ project, isOpen, onClose }) => {
  if (!project) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      onClose()
    }
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
          onKeyDown={handleKeyPress}
          tabIndex={0}
        >
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{
              duration: 0.3,
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
          >
            {/* 极简卡片式布局 - 一次展示所有重要信息 */}
            <div className="modal-card">
              {/* 头部：标题、语言、操作按钮 */}
              <div className="card-header">
                <div className="header-left">
                  <h2 className="card-title">
                    {project.name}
                    {project.isArchived && (
                      <span className="archive-badge">
                        <FaArchive /> 已归档
                      </span>
                    )}
                  </h2>
                  <div className="card-language">
                    <FaRegFileCode className="language-icon" />
                    <span>{project.language || 'Unknown'}</span>
                  </div>
                </div>
                <div className="header-actions">
                  <motion.a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="github-btn"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="查看源码"
                  >
                    <FaGithub />
                  </motion.a>
                  <motion.button
                    className="card-close-btn"
                    onClick={onClose}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    title="关闭"
                  >
                    <FaTimes />
                  </motion.button>
                </div>
              </div>

              {/* 项目描述 - 完整显示，不截断 */}
              <div className="card-description">
                <p>{project.description || `${project.name} - 一个专注于创新和技术实践的项目`}</p>
              </div>

              {/* 核心数据：Stars、Forks、分类 */}
              <div className="card-metrics">
                <div className="metrics-list">
                  {project.stars > 0 && (
                    <div className="metric-item">
                      <FaStar className="metric-icon star" />
                      <span className="metric-value">{project.stars}</span>
                    </div>
                  )}
                  {project.forks > 0 && (
                    <div className="metric-item">
                      <FaCodeBranch className="metric-icon fork" />
                      <span className="metric-value">{project.forks}</span>
                    </div>
                  )}
                  {project.category && (
                    <div className="metric-item category">
                      <FaTag className="metric-icon" />
                      <span className="metric-label">{project.category}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 技术栈 - 突出显示 */}
              {project.tags && project.tags.length > 0 && (
                <div className="card-technologies">
                  <div className="tech-label">技术栈</div>
                  <div className="tech-list">
                    {project.tags.map((tag, index) => (
                      <Badge key={tag} variant="outline" className="tech-badge">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* 项目主页链接（如果有的话） */}
              {project.homepage && (
                <div className="card-demo-link">
                  <motion.a
                    href={project.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="demo-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    title="访问项目主页"
                  >
                    {(() => {
                      const iconType = getExternalLinkIcon(project.homepage)
                      if (iconType === 'pypi') {
                        return (
                          <>
                            <img
                              src="https://pypi.org/static/images/logo-small.8998e9d1.svg"
                              alt="PyPI"
                              className="pypi-logo"
                              style={{ width: '20px', height: '20px' }}
                            />
                            <span>{getLinkText(project.homepage)}</span>
                          </>
                        )
                      }
                      return (
                        <>
                          <FaExternalLinkAlt />
                          <span>{getLinkText(project.homepage)}</span>
                        </>
                      )
                    })()}
                  </motion.a>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ProjectDetailModal