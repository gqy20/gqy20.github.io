import { useMemo } from 'react'
import { useProjectsData } from '../hooks/useProjectsData.js'
import { motion } from 'framer-motion'
import { FaArrowRight } from 'react-icons/fa'
import './Hero.css'

const heroVariants = {
  container: { animate: { transition: { staggerChildren: 0.08 } } },
  fadeUp: {
    initial: { opacity: 0, y: 22 },
    animate: {
      opacity: 1, y: 0,
      transition: { duration: 0.55, ease: [0.33, 1, 0.68, 1] }
    }
  },
  fadeUpScale: {
    initial: { opacity: 0, y: 22, scale: 1.02 },
    animate: {
      opacity: 1, y: 0, scale: 1,
      transition: { duration: 0.6, ease: [0.33, 1, 0.68, 1] }
    }
  },
  slideUp: {
    initial: { opacity: 0, y: 16 },
    animate: {
      opacity: 1, y: 0,
      transition: { duration: 0.5, ease: [0.33, 1, 0.68, 1] }
    }
  }
}

const Hero = () => {
  const { data: projectData, loading: projectsLoading } = useProjectsData()

  const stats = useMemo(() => ({
    repositories: projectData?.totalRepositories ?? projectData?.totalProjects ?? 0,
    projects: projectData?.totalProjects ?? 0
  }), [projectData])

  const loading = projectsLoading

  return (
    <main className="ai-home">
      <section className="ai-hero">
        <div className="ai-shell ai-hero-editorial">
          <motion.div
            className="ai-hero-editorial__content"
            variants={heroVariants.container}
            initial="initial"
            animate="animate"
          >
            <motion.div className="hero-identity" variants={heroVariants.fadeUp}>
              <span className="hero-avatar">QY</span>
              <p className="ai-kicker">Qingyu Ge / AI Agent / 自动化</p>
            </motion.div>

            <motion.h1 className="ai-hero-title" variants={heroVariants.fadeUpScale}>
              让 AI 从回答问题，走向<span className="hl-accent">完成工作</span>。
            </motion.h1>

            <motion.p className="ai-lede" variants={heroVariants.fadeUp}>
              构建能理解任务、调用工具、持续迭代的智能体系统，
              从 AI 消费者到 Agent 社会构建者，一年四个阶段。
            </motion.p>

            <motion.div className="ai-actions" variants={heroVariants.fadeUp}>
              <a href="#/journey" className="ai-button ai-button-primary">
                查看完整旅程 <FaArrowRight />
              </a>
              <a href="#/projects" className="ai-link">
                浏览全部项目 <FaArrowRight />
              </a>
            </motion.div>

            <motion.div className="hero-stats-bar" variants={heroVariants.slideUp}>
              <div className="hero-stat">
                <strong className="hero-stat__value">{loading ? '...' : stats.repositories}</strong>
                <span className="hero-stat__label">公开仓库</span>
              </div>
              <div className="hero-stat-divider" />
              <a href="#/projects" className="hero-stat" aria-label="浏览全部展示项目">
                <strong className="hero-stat__value">{loading ? '...' : stats.projects}</strong>
                <span className="hero-stat__label">展示项目</span>
              </a>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <strong className="hero-stat__value">4</strong>
                <span className="hero-stat__label">演进阶段</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}

export default Hero
