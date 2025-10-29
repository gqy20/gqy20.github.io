import { motion } from 'framer-motion'
import { FaGithub, FaCalendar, FaClock, FaTag } from 'react-icons/fa'
import './Blog.css'

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "使用React构建炫酷个人网站",
      excerpt: "分享从零开始构建现代React个人网站的经验，包括动画效果、响应式设计和GitHub Pages部署。",
      date: "2025-10-29",
      readTime: "5分钟",
      tags: ["React", "前端", "个人网站"],
      githubUrl: "#"
    },
    {
      id: 2,
      title: "GitHub Actions自动化部署实践",
      excerpt: "详细介绍如何配置GitHub Actions实现React项目的自动化部署，避免手动操作的烦恼。",
      date: "2025-10-29",
      readTime: "8分钟",
      tags: ["GitHub Actions", "CI/CD", "自动化"],
      githubUrl: "#"
    },
    {
      id: 3,
      title: "AI辅助科研工具开发心得",
      excerpt: "分享开发AI驱动的科研工具过程中的思考、挑战和解决方案，以及如何提升研究效率。",
      date: "2025-10-28",
      readTime: "10分钟",
      tags: ["AI", "科研工具", "Python"],
      githubUrl: "#"
    }
  ]

  return (
    <section className="blog">
      <div className="container">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          技术博客
        </motion.h2>

        <motion.p
          className="blog-intro"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          分享开发过程中的技术思考、项目经验和学习心得
        </motion.p>

        <div className="blog-grid">
          {blogPosts.map((post, index) => (
            <motion.article
              key={post.id}
              className="blog-card"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
            >
              <div className="blog-header">
                <div className="blog-meta">
                  <span className="blog-date">
                    <FaCalendar /> {post.date}
                  </span>
                  <span className="blog-read-time">
                    <FaClock /> {post.readTime}
                  </span>
                </div>
                <h3 className="blog-title">{post.title}</h3>
              </div>

              <p className="blog-excerpt">{post.excerpt}</p>

              <div className="blog-tags">
                {post.tags.map((tag) => (
                  <span key={tag} className="blog-tag">
                    <FaTag /> {tag}
                  </span>
                ))}
              </div>

              <motion.a
                href={post.githubUrl}
                className="blog-link"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                阅读全文 →
              </motion.a>
            </motion.article>
          ))}
        </div>

        <motion.div
          className="blog-footer"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p>更多技术文章正在编写中...</p>
        </motion.div>
      </div>
    </section>
  )
}

export default Blog