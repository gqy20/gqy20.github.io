import { motion } from 'framer-motion'
import { FaGithub, FaEnvelope, FaArrowDown } from 'react-icons/fa'
import './Hero.css'

const Hero = () => {
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
            transition={{ delay: 0.5 }}
          >
            你好，我是 <span className="highlight">Qingyu Ge</span>
          </motion.h1>

          <motion.div
            className="hero-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <span className="typing-text">在读硕士生</span>
            <span className="separator">·</span>
            <span className="typing-text">AI辅助科研工具开发者</span>
          </motion.div>

          <motion.p
            className="hero-description"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            专注于开发AI驱动的科研工具，让学术研究变得更加高效和有趣
          </motion.p>

          {/* 整合的关于我部分 */}
          <motion.div
            className="hero-about"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <div className="about-stats">
              <motion.div
                className="stat-item"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="stat-number">5+</div>
                <div className="stat-label">开源项目</div>
              </motion.div>
              <motion.div
                className="stat-item"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="stat-number">3</div>
                <div className="stat-label">项目Star</div>
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

            <motion.p className="about-text">
              我是一名在读硕士研究生，对人工智能和科研工具开发充满热情。我致力于开发能够提升学术研究效率的工具，特别是在文献分析、数据处理和AI辅助编程方面。
            </motion.p>
          </motion.div>

          <motion.div
            className="hero-buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
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
              href="#/blog"
              className="btn btn-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              📖 技术博客
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
          </motion.div>

          {/* 整合的联系部分 */}
          <motion.div
            className="hero-contact"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <div className="contact-links">
              <motion.a
                href="https://github.com/gqy20"
                target="_blank"
                className="contact-link github-link"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="contact-icon">
                  <FaGithub />
                </div>
                <div className="contact-info">
                  <div className="contact-label">GitHub</div>
                  <div className="contact-description">查看我的开源项目</div>
                </div>
              </motion.a>

              <motion.a
                href="mailto:qingyu_ge@foxmail.com"
                className="contact-link email-link"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="contact-icon">
                  <FaEnvelope />
                </div>
                <div className="contact-info">
                  <div className="contact-label">邮箱</div>
                  <div className="contact-description">qingyu_ge@foxmail.com</div>
                </div>
              </motion.a>
            </div>

            <motion.p className="contact-text">
              期待与你的交流与合作！
            </motion.p>
          </motion.div>
        </motion.div>

        <motion.div
          className="scroll-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <FaArrowDown />
        </motion.div>
      </div>
    </section>
  )
}

export default Hero