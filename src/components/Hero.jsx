import { motion } from 'framer-motion'
import { FaGithub, FaEnvelope, FaArrowDown } from 'react-icons/fa'
import TypeAnimation from 'react-type-animation'
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
            Hi, 我是 <span className="highlight">Qingyu Ge</span>
          </motion.h1>

          <motion.div
            className="hero-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <TypeAnimation
              sequence={[
                '在读硕士生',
                2000,
                'AI辅助科研工具开发者',
                2000,
                '技术创新爱好者',
                2000,
                '开源贡献者',
                2000,
                '在读硕士生',
              ]}
              wrapper="span"
              cursor={true}
              repeat={Infinity}
              deletionSpeed={50}
            />
          </motion.div>

          <motion.p
            className="hero-description"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            专注于开发各种科研工具，利用人工智能技术提升学术研究效率
          </motion.p>

          <motion.div
            className="hero-buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <motion.a
              href="#projects"
              className="btn btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              查看项目
            </motion.a>
            <motion.a
              href="https://github.com/gqy20"
              target="_blank"
              className="btn btn-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaGithub /> GitHub
            </motion.a>
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