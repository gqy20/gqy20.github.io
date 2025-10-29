import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaCalendar, FaClock, FaTag, FaUser, FaFolder } from 'react-icons/fa'
import './Blog.css'

const Blog = () => {
  const [blogData, setBlogData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadBlogData = async () => {
      try {
        setLoading(true)
        const data = await import('../data/blog/index.json')
        setBlogData(data.default)
      } catch (err) {
        setError('加载博客数据失败')
        console.error('Failed to load blog data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadBlogData()
  }, [])

  if (loading) {
    return (
      <section className="blog">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>正在加载博客文章...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="blog">
        <div className="container">
          <div className="error-container">
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
    <section className="blog">
      <div className="container">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          技术博客 ({blogData?.totalPosts || 0})
        </motion.h2>

        <motion.p
          className="blog-intro"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          分享开发过程中的技术思考、项目经验和学习心得，涵盖前端开发、AI应用和科研工具等领域
        </motion.p>

        <div className="blog-grid">
          {blogData?.posts.map((post, index) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="blog-card-link"
            >
              <motion.article
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
                    <span className="blog-author">
                      <FaUser /> {post.author}
                    </span>
                  </div>
                  <h3 className="blog-title">{post.title}</h3>
                </div>

                <p className="blog-excerpt">{post.excerpt}</p>

                <div className="blog-tags">
                  <span className="category-tag">
                    <FaFolder /> {post.category}
                  </span>
                  {post.tags.map((tag) => (
                    <span key={tag} className="blog-tag">
                      <FaTag /> {tag}
                    </span>
                  ))}
                </div>

                <div className="blog-link">
                  阅读全文 →
                </div>
              </motion.article>
            </Link>
          ))}
        </div>

        <motion.div
          className="blog-footer"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p>更多技术文章正在编写中...</p>
          <p className="last-updated">
            最后更新: {new Date(blogData?.lastUpdated).toLocaleString('zh-CN')}
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default Blog