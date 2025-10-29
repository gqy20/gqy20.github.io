import { motion } from 'framer-motion'
import './About.css'

const About = () => {
  return (
    <section className="about">
      <div className="container">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          关于我
        </motion.h2>

        <motion.div
          className="about-content"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="about-text">
            <p>
              我是一名在读硕士研究生，对人工智能和科研工具开发充满热情。我致力于开发能够提升学术研究效率的工具，
              特别是在文献分析、数据处理和AI辅助编程方面。
            </p>
            <p>
              目前我的研究重点包括智能文献分析系统、学术论文处理工具，以及AI辅助的代码生成与优化。
              我相信技术能够让学术研究变得更加高效和有趣。
            </p>
          </div>

          <div className="about-stats">
            <motion.div
              className="stat-item"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="stat-number">5</div>
              <div className="stat-label">开源项目</div>
            </motion.div>
            <motion.div
              className="stat-item"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="stat-number">3</div>
              <div className="stat-label">项目获得Star</div>
            </motion.div>
            <motion.div
              className="stat-item"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="stat-number">2</div>
              <div className="stat-label">关注者</div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default About