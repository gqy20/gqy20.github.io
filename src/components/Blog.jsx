import { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { FaArrowRight, FaCalendar, FaClock, FaFolder, FaTag } from 'react-icons/fa'
import Badge from './Badge'
import './Blog.css'
import PageHeader from './PageHeader'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap.js'

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

  const rootRef = useRef(null)

  // 文章卡片:ScrollTrigger.batch 入场(替代手写 delay stagger)
  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add({
      isReduce: '(prefers-reduced-motion: reduce)',
      isNormal: '(prefers-reduced-motion: no-preference)'
    }, ({ conditions }) => {
      const { isReduce } = conditions
      if (isReduce) return
      gsap.set('.blog-item', { opacity: 0, y: 18 })
      ScrollTrigger.batch('.blog-item', {
        start: 'top 85%',
        onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.38, stagger: 0.06, ease: 'power2.out', overwrite: true }),
        onLeaveBack: (batch) => gsap.set(batch, { opacity: 0, y: 18, overwrite: true })
      })
    })
    return () => mm.revert()
  }, { scope: rootRef, dependencies: [blogData] })

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
    <section className="blog" ref={rootRef}>
      <PageHeader num="03" title="BLOG" />
      <div className="blog-shell">
        {/* Inline hero */}
        <motion.div
          className="blog-hero"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>记录我如何把 AI 想法做成真实系统。</h1>
          <div className="blog-hero-copy">
            <span>{blogData?.totalPosts || 0} 篇关于智能体、工具接口和自动化工作流的记录。</span>
            <a href="#/projects">查看项目 <FaArrowRight /></a>
          </div>
        </motion.div>
        <div className="blog-list">
          {blogData?.posts.map((post, index) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="blog-item-link"
            >
              <article className="blog-item">
                <div className="blog-index">
                  <span className="blog-index-num">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="blog-date">
                    <FaCalendar /> {post.date}
                  </span>
                  <span className="blog-read-time">
                    <FaClock /> {post.readTime}
                  </span>
                </div>

                <div className="blog-main">
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

                {post.coverImage && (
                  <div className="blog-cover">
                    <img src={post.coverImage} alt={post.title} loading="lazy" />
                  </div>
                )}

                <span className="blog-link">阅读 <FaArrowRight /></span>
              </article>
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
