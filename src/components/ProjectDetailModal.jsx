import { motion, AnimatePresence } from 'framer-motion'
import {
  FaGithub,
  FaExternalLinkAlt,
  FaTimes,
  FaStar,
  FaCodeBranch,
  FaExclamationTriangle,
  FaCalendar,
  FaArchive,
  FaRegFileCode,
  FaTag,
  FaLink,
  FaUser
} from 'react-icons/fa'
import Badge from './Badge'
import Button from './Button'
import './ProjectDetailModal.css'

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
            {/* 头部区域 */}
            <div className="modal-header">
              <div className="modal-title-section">
                <h2 className="modal-title">{project.name}</h2>
                {project.isArchived && (
                  <span className="archive-badge">
                    <FaArchive /> 已归档
                  </span>
                )}
              </div>

              <Button
                variant="ghost"
                className="modal-close-btn"
                onClick={onClose}
                aria-label="关闭详情"
                size="icon"
              >
                <FaTimes />
              </Button>
            </div>

            {/* 项目描述 */}
            <div className="modal-description">
              <p>{project.description}</p>
            </div>

            {/* 快速操作区域 */}
            <div className="modal-actions">
              <motion.a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="action-btn primary-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaGithub /> 查看源码
              </motion.a>

              {project.homepage && (
                <motion.a
                  href={project.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-btn secondary-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaExternalLinkAlt /> 访问项目
                </motion.a>
              )}
            </div>

            {/* 项目统计信息 */}
            <div className="modal-stats">
              <div className="stats-grid">
                {project.stars > 0 && (
                  <div className="stat-item">
                    <FaStar className="stat-icon star" />
                    <div>
                      <div className="stat-value">{project.stars}</div>
                      <div className="stat-label">Stars</div>
                    </div>
                  </div>
                )}

                {project.forks > 0 && (
                  <div className="stat-item">
                    <FaCodeBranch className="stat-icon fork" />
                    <div>
                      <div className="stat-value">{project.forks}</div>
                      <div className="stat-label">Forks</div>
                    </div>
                  </div>
                )}

                {project.issues > 0 && (
                  <div className="stat-item">
                    <FaExclamationTriangle className="stat-icon issue" />
                    <div>
                      <div className="stat-value">{project.issues}</div>
                      <div className="stat-label">Issues</div>
                    </div>
                  </div>
                )}

                <div className="stat-item">
                  <FaRegFileCode className="stat-icon size" />
                  <div>
                    <div className="stat-value">{project.size}KB</div>
                    <div className="stat-label">大小</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 项目元信息 */}
            <div className="modal-meta">
              <div className="meta-grid">
                <div className="meta-item">
                  <FaTag className="meta-icon" />
                  <div>
                    <div className="meta-label">分类</div>
                    <div className="meta-value">{project.category}</div>
                  </div>
                </div>

                <div className="meta-item">
                  <FaRegFileCode className="meta-icon" />
                  <div>
                    <div className="meta-label">主要语言</div>
                    <div className="meta-value">{project.language || 'Unknown'}</div>
                  </div>
                </div>

                <div className="meta-item">
                  <FaCalendar className="meta-icon" />
                  <div>
                    <div className="meta-label">创建时间</div>
                    <div className="meta-value">
                      {new Date(project.createdAt).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                </div>

                <div className="meta-item">
                  <FaCalendar className="meta-icon" />
                  <div>
                    <div className="meta-label">最后更新</div>
                    <div className="meta-value">
                      {new Date(project.updatedAt).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 技术标签 */}
            {project.tags && project.tags.length > 0 && (
              <div className="modal-tags">
                <div className="tags-header">
                  <FaTag className="tags-icon" />
                  <h3>技术标签</h3>
                </div>
                <div className="tags-list">
                  {project.tags.map((tag, index) => (
                    <motion.div
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Badge variant="outline" className="modal-tech-badge">
                        {tag}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* 项目主题 */}
            {project.topics && project.topics.length > 0 && (
              <div className="modal-topics">
                <div className="topics-header">
                  <FaLink className="topics-icon" />
                  <h3>GitHub Topics</h3>
                </div>
                <div className="topics-list">
                  {project.topics.map((topic, index) => (
                    <motion.a
                      key={topic}
                      href={`https://github.com/topics/${topic}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="topic-link"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 5 }}
                    >
                      {topic}
                    </motion.a>
                  ))}
                </div>
              </div>
            )}

            {/* 许可证信息 */}
            {project.license && (
              <div className="modal-license">
                <div className="license-info">
                  <FaLink className="license-icon" />
                  <span>许可证: {project.license}</span>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ProjectDetailModal