import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  FaGithub,
  FaExternalLinkAlt,
  FaStar,
  FaCodeBranch,
  FaExclamationTriangle,
  FaSearch,
  FaFilter,
  FaCalendar,
  FaArchive,
  FaSync,
  FaEye
} from 'react-icons/fa'
import Badge from './Badge'
import './Projects.css'
import ProjectDetailModal from './ProjectDetailModal'

const Projects = () => {
  const [projectsData, setProjectsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('updated')
  const [selectedProject, setSelectedProject] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 加载项目数据
  useEffect(() => {
    const loadProjectsData = async () => {
      try {
        setLoading(true)
        // 直接导入JSON文件
        const data = await import('../data/projects.json')
        setProjectsData(data.default)
      } catch (err) {
        setError('加载项目数据失败')
        console.error('Failed to load projects data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadProjectsData()
  }, [])

  // 过滤和排序项目
  const filteredAndSortedProjects = useMemo(() => {
    if (!projectsData) return []

    let projects = [...projectsData.allProjects]

    // 按分类过滤
    if (selectedCategory !== 'all') {
      projects = projects.filter(project => project.category === selectedCategory)
    }

    // 搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      projects = projects.filter(project =>
        project.name.toLowerCase().includes(term) ||
        project.description.toLowerCase().includes(term) ||
        project.language.toLowerCase().includes(term) ||
        project.tags.some(tag => tag.toLowerCase().includes(term))
      )
    }

    // 排序
    projects.sort((a, b) => {
      switch (sortBy) {
        case 'stars':
          return b.stars - a.stars
        case 'name':
          return a.name.localeCompare(b.name)
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt)
        case 'updated':
        default:
          return new Date(b.updatedAt) - new Date(a.updatedAt)
      }
    })

    return projects
  }, [projectsData, selectedCategory, searchTerm, sortBy])

  // 处理项目卡片点击
  const handleProjectClick = (project) => {
    setSelectedProject(project)
    setIsModalOpen(true)
  }

  // 关闭弹窗
  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedProject(null)
  }

  // 键盘事件处理
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isModalOpen])

  if (loading) {
    return (
      <section className="projects">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner">
              <FaSync className="spinner" />
            </div>
            <p>正在加载项目数据...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="projects">
        <div className="container">
          <div className="error-container">
            <FaExclamationTriangle className="error-icon" />
            <h3>加载失败</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              重试
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="projects">
      <div className="container">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          开源项目 ({projectsData.totalProjects})
        </motion.h2>

        <motion.p
          className="projects-intro"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          分享我的开源作品和技术实践，总计获得 <strong>{projectsData.totalStars}</strong> 个星标
        </motion.p>

        {/* 搜索和筛选控件 */}
        <motion.div
          className="projects-controls"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="搜索项目名称、描述或技术栈..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-controls">
            <div className="filter-group">
              <FaFilter className="filter-icon" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                <option value="all">所有分类</option>
                {projectsData.categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="sort-group">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="updated">最近更新</option>
                <option value="stars">星标数</option>
                <option value="created">创建时间</option>
                <option value="name">名称排序</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* 分类统计 */}
        <motion.div
          className="category-stats"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {projectsData.categories.map(category => {
            const count = projectsData.projects[category]?.length || 0
            return (
              <motion.button
                key={category}
                className={`category-chip ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(selectedCategory === category ? 'all' : category)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category} ({count})
              </motion.button>
            )
          })}
        </motion.div>

        {/* 项目网格 */}
        <div className="projects-grid">
          {filteredAndSortedProjects.map((project, index) => (
            <motion.div
              key={project.id}
              className="project-card clickable"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{
                y: -10,
                boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.2)",
                scale: 1.02
              }}
              whileTap={{
                scale: 0.98,
                transition: { duration: 0.1 }
              }}
              onClick={() => handleProjectClick(project)}
              role="button"
              tabIndex={0}
              aria-label={`查看项目 ${project.name} 的详细信息`}
            >
              <div className="project-header">
                <div className="project-title-group">
                  <h3 className="project-title">{project.name}</h3>
                  {project.isArchived && (
                    <span className="archive-badge">
                      <FaArchive /> 已归档
                    </span>
                  )}
                </div>

                <div className="project-links">
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-link github-link"
                    title="查看GitHub仓库"
                  >
                    <FaGithub />
                  </a>
                </div>
              </div>

              <p className="project-description">{project.description}</p>

              <div className="project-meta">
                <div className="project-stats">
                  {project.stars > 0 && (
                    <span className="stat">
                      <FaStar className="star-icon" /> {project.stars}
                    </span>
                  )}
                  {project.forks > 0 && (
                    <span className="stat">
                      <FaCodeBranch /> {project.forks}
                    </span>
                  )}
                  {project.issues > 0 && (
                    <span className="stat">
                      <FaExclamationTriangle /> {project.issues}
                    </span>
                  )}
                </div>

                <span className="project-language">
                  {project.language || 'Unknown'}
                </span>
              </div>

              <div className="project-tags">
                <Badge variant="secondary" className="category-badge">
                  {project.category}
                </Badge>
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="tech-badge">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="project-footer">
                <span className="update-time">
                  <FaCalendar /> 更新于 {new Date(project.updatedAt).toLocaleDateString('zh-CN')}
                </span>

                <div className="project-actions">
                  <motion.a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-view-link github-link"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaGithub /> 源码
                  </motion.a>

                  <motion.button
                    className="project-detail-btn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleProjectClick(project)
                    }}
                  >
                    <FaEye /> 详情
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 无结果提示 */}
        {filteredAndSortedProjects.length === 0 && (
          <motion.div
            className="no-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <FaSearch className="no-results-icon" />
            <h3>没有找到匹配的项目</h3>
            <p>尝试调整搜索关键词或筛选条件</p>
          </motion.div>
        )}

        {/* 数据更新时间 */}
        <motion.div
          className="data-footer"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p>
            数据最后更新: {new Date(projectsData.lastUpdated).toLocaleString('zh-CN')}
          </p>
        </motion.div>

        {/* 项目详情弹窗 */}
        <ProjectDetailModal
          project={selectedProject}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      </div>
    </section>
  )
}

export default Projects