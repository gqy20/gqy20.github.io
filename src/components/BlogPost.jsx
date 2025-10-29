import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, Link } from 'react-router-dom'
import {
  FaCalendar,
  FaClock,
  FaUser,
  FaTag,
  FaArrowLeft,
  FaGithub,
  FaShare,
  FaBookmark
} from 'react-icons/fa'
import MarkdownRenderer from './MarkdownRenderer'
import './BlogPost.css'

const BlogPost = () => {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadBlogPost = async () => {
      try {
        setLoading(true)

        // 加载博客数据
        const blogDataResponse = await import('../data/blog/index.json')
        const blogData = blogDataResponse.default
        const foundPost = blogData.posts.find(p => p.slug === slug)

        if (!foundPost) {
          setError('文章未找到')
          return
        }

        setPost(foundPost)

        // 加载文章内容
        const contentResponse = await import(`../data/blog/${foundPost.id}.md?raw`)
        const contentText = contentResponse.default

        // 解析frontmatter和内容
        const frontmatterEnd = contentText.indexOf('---', 3) + 3
        const markdownContent = contentText.substring(frontmatterEnd).trim()

        setContent(markdownContent)
      } catch (err) {
        setError('加载文章失败')
        console.error('Failed to load blog post:', err)
      } finally {
        setLoading(false)
      }
    }

    loadBlogPost()
  }, [slug])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.excerpt,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('链接已复制到剪贴板')
    }
  }

  if (loading) {
    return (
      <div className="blog-post-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>正在加载文章...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="blog-post-error">
        <div className="error-container">
          <h2>加载失败</h2>
          <p>{error}</p>
          <Link to="/blog" className="back-link">
            <FaArrowLeft /> 返回博客列表
          </Link>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="blog-post-error">
        <div className="error-container">
          <h2>文章未找到</h2>
          <p>您访问的文章不存在或已被删除</p>
          <Link to="/blog" className="back-link">
            <FaArrowLeft /> 返回博客列表
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="blog-post">
      <div className="container">
        {/* 返回按钮 */}
        <motion.div
          className="blog-post-nav"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link to="/blog" className="back-button">
            <FaArrowLeft /> 返回博客
          </Link>
        </motion.div>

        {/* 文章头部 */}
        <motion.header
          className="blog-post-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {post.coverImage && (
            <div className="blog-post-cover">
              <img
                src={post.coverImage}
                alt={post.title}
                className="cover-image"
              />
              <div className="cover-overlay"></div>
            </div>
          )}

          <div className="blog-post-meta">
            <div className="meta-primary">
              <h1 className="blog-post-title">{post.title}</h1>
              <p className="blog-post-excerpt">{post.excerpt}</p>
            </div>

            <div className="meta-secondary">
              <div className="meta-info">
                <span className="meta-item">
                  <FaUser /> {post.author}
                </span>
                <span className="meta-item">
                  <FaCalendar /> {formatDate(post.date)}
                </span>
                <span className="meta-item">
                  <FaClock /> {post.readTime}
                </span>
              </div>

              <div className="meta-tags">
                <span className="category-tag">{post.category}</span>
                {post.tags.map((tag) => (
                  <span key={tag} className="tag">
                    <FaTag /> {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="blog-post-actions">
            <button className="action-button" onClick={handleShare}>
              <FaShare /> 分享
            </button>
            <button className="action-button">
              <FaBookmark /> 收藏
            </button>
            <a
              href="https://github.com/gqy20/gqy20.github.io"
              target="_blank"
              rel="noopener noreferrer"
              className="action-button"
            >
              <FaGithub /> 源码
            </a>
          </div>
        </motion.header>

        {/* 文章内容 */}
        <motion.article
          className="blog-post-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <MarkdownRenderer content={content} />
        </motion.article>

        {/* 文章底部 */}
        <motion.footer
          className="blog-post-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="footer-content">
            <div className="author-info">
              <h3>关于作者</h3>
              <p>
                我是Qingyu Ge，一名在读硕士研究生，专注于AI辅助科研工具开发。
                热衷于分享技术经验和学习心得。
              </p>
              <div className="author-links">
                <a
                  href="https://github.com/gqy20"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="author-link"
                >
                  <FaGithub /> GitHub
                </a>
              </div>
            </div>

            <div className="article-navigation">
              <Link to="/blog" className="nav-button">
                <FaArrowLeft /> 查看更多文章
              </Link>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  )
}

export default BlogPost