import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaGithub, FaEnvelope, FaStar } from 'react-icons/fa'
import './Hero.css'

const Hero = () => {
  const [projectStats, setProjectStats] = useState({
    totalProjects: 13,
    totalStars: 20
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProjectData = async () => {
      try {
        const data = await import('../data/projects.json')
        setProjectStats({
          totalProjects: data.default.totalProjects,
          totalStars: data.default.totalStars
        })
      } catch (error) {
        console.error('Failed to load project data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProjectData()
  }, [])
  return (
    <section className="hero">
      <div className="hero-container">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="hero-avatar"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <img
              src="https://avatars.githubusercontent.com/u/150650455?v=4"
              alt="Qingyu Ge"
              className="avatar-img"
            />
            <div className="avatar-glow"></div>
          </motion.div>

          <motion.h1
            className="hero-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            你好，我是 <span className="highlight">Qingyu Ge</span>
          </motion.h1>

          <motion.div
            className="hero-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span className="typing-text">AI科研工具开发者</span>
            <span className="separator">|</span>
            <span className="typing-text">在读硕士生</span>
          </motion.div>

          <motion.p
            className="hero-description"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            专注于开发AI驱动的科研工具，让学术研究更加高效和有趣
          </motion.p>

          {/* 简化的成就展示 */}
          <motion.div
            className="hero-achievements"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <div className="achievement-badge">
              <FaStar className="achievement-icon" />
              <span className="achievement-text">
                {loading ? '...' : `${projectStats.totalProjects}+ 开源项目`}
              </span>
            </div>
            <div className="achievement-badge">
              <FaStar className="achievement-icon" />
              <span className="achievement-text">
                {loading ? '...' : `${projectStats.totalStars}+ 项目Stars`}
              </span>
            </div>
          </motion.div>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <motion.a
              href="#/projects"
              className="btn btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              查看项目
            </motion.a>
            <motion.a
              href="https://github.com/gqy20"
              target="_blank"
              className="btn btn-github"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaGithub /> GitHub
            </motion.a>
            <motion.a
              href="mailto:qingyu_ge@foxmail.com"
              className="btn btn-contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaEnvelope /> 联系我
            </motion.a>
          </motion.div>
        </motion.div>
        </div>
    </section>
  )
}

export default Hero