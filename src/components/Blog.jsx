import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaArrowRight, FaCalendar, FaClock, FaFolder, FaTag } from 'react-icons/fa'
import Badge from './Badge'
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
        <div className="blog-shell">
          <div className="blog-state">
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
        <div className="blog-shell">
          <div className="blog-state">
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
      <div className="blog-shell">
        <motion.header
          className="blog-hero"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <p>构建记录</p>
          <h1>记录我如何把 AI 想法做成真实系统。</h1>
          <div className="blog-hero-copy">
            <span>{blogData?.totalPosts || 0} 篇关于智能体、工具接口、前端体验和自动化工作流的记录。</span>
            <a href="#/projects">查看项目 <FaArrowRight /></a>
          </div>
        </motion.header>

        <div className="blog-list">
          {blogData?.posts.map((post, index) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="blog-item-link"
            >
              <motion.article
                className="blog-item"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.38, delay: Math.min(index, 8) * 0.04 }}
              >
                <div className="blog-index">
                  {String(index + 1).padStart(2, '0')}
                </div>

                <div className="blog-main">
                  <div className="blog-meta">
                    <span className="blog-date">
                      <FaCalendar /> {post.date}
                    </span>
                    <span className="blog-read-time">
                      <FaClock /> {post.readTime}
                    </span>
                  </div>
                  <h3 className="blog-title">{post.title}</h3>
                  <p className="blog-excerpt">{post.excerpt}</p>

                  <div className="blog-tags">
                    <Badge variant="secondary" className="blog-category-badge">
                      <FaFolder /> {post.category}
                    </Badge>
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="blog-tag-badge">
                        <FaTag /> {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <span className="blog-link">阅读 <FaArrowRight /></span>
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
          <p className="last-updated">
            最后更新: {new Date(blogData?.lastUpdated).toLocaleString('zh-CN')}
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default Blog
