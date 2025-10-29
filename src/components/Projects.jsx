import { motion } from 'framer-motion'
import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa'
import './Projects.css'

const Projects = () => {
  const projects = [
    {
      title: 'SLAIS',
      description: '智能文献分析与洞察系统 - 基于AI的PDF文献智能分析系统，专为科研人员设计，能够自动提取关键信息、生成深刻洞察并构建结构化报告。',
      tech: ['Python', 'AI', 'PDF处理'],
      url: 'https://github.com/gqy20/SLAIS',
      stars: 1
    },
    {
      title: 'AI Coding',
      description: '用AI辅助编写代码 - 利用人工智能技术辅助程序开发，提高编程效率和代码质量。',
      tech: ['AI', '代码生成', '自动化'],
      url: 'https://github.com/gqy20/ai_coding',
      stars: 1
    },
    {
      title: 'pub2tts',
      description: 'PubMed文献语音播报 - 从PubMed获取文献，将标题、关键词、摘要等内容转成中文并合成语音。',
      tech: ['Python', 'TTS', 'PubMed API'],
      url: 'https://github.com/gqy20/pub2tts',
      stars: 1
    }
  ]

  return (
    <section className="projects">
      <div className="container">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          精选项目
        </motion.h2>

        <div className="projects-grid">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              className="project-card"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
            >
              <div className="project-header">
                <h3 className="project-title">{project.title}</h3>
                <div className="project-links">
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-link"
                  >
                    <FaGithub />
                  </a>
                  {project.stars && (
                    <span className="project-stars">⭐ {project.stars}</span>
                  )}
                </div>
              </div>

              <p className="project-description">{project.description}</p>

              <div className="project-tech">
                {project.tech.map((tech) => (
                  <span key={tech} className="tech-tag">
                    {tech}
                  </span>
                ))}
              </div>

              <motion.a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="project-view-link"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                查看项目 <FaExternalLinkAlt />
              </motion.a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Projects