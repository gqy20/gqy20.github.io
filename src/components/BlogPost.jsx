import { useState, useEffect, useRef, useMemo } from 'react'
import { motion } from 'motion/react'
import { useParams, Link } from 'react-router-dom'
import {
  FaCalendar,
  FaClock,
  FaUser,
  FaTag,
  FaArrowLeft,
  FaArrowRight,
  FaGithub,
  FaShare,
  FaFileAlt
} from 'react-icons/fa'
import Badge from './Badge'
import Button from './Button'
import MarkdownRenderer from './MarkdownRenderer'
import { gsap, ScrollTrigger, SplitText, useGSAP } from '../lib/gsap.js'
import './BlogPost.css'

const BlogPost = () => {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [content, setContent] = useState('')
  const [allPosts, setAllPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toc, setToc] = useState([])
  const [activeId, setActiveId] = useState('')
  const [toast, setToast] = useState('')

  const articleRef = useRef(null)
  const rootRef = useRef(null)

  // 加载文章数据 + 内容
  useEffect(() => {
    const loadBlogPost = async () => {
      try {
        setLoading(true)
        setError(null)
        setToc([])
        setActiveId('')

        // 加载博客数据
        const blogDataResponse = await import('../data/blog/index.json')
        const blogData = blogDataResponse.default
        setAllPosts(blogData.posts || [])

        const foundPost = blogData.posts.find(p => p.slug === slug)
        if (!foundPost) {
          setError('文章未找到')
          return
        }
        setPost(foundPost)

        // 加载文章内容
        const contentResponse = await import(`../data/blog/${foundPost.id}.md?raw`)
        const contentText = contentResponse.default

        // 解析 frontmatter 和内容
        const frontmatterEnd = contentText.indexOf('---', 3) + 3
        let markdownContent = contentText.substring(frontmatterEnd).trim()
        // 剥离开头与页面标题重复的 h1（header 已展示 post.title，正文无需重复）
        markdownContent = markdownContent.replace(/^#\s+[^\n]*\n+/, '')

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

  // 提取 H2/H3 → 注入 id → 构建 TOC（scroll-spy 改由 GSAP ScrollTrigger 处理，见下方 useGSAP）
  useEffect(() => {
    if (!content) return
    const timer = setTimeout(() => {
      const root = articleRef.current
      if (!root) return
      const heads = Array.from(root.querySelectorAll('h2, h3'))
      const seen = new Set()
      const items = heads.map((h, i) => {
        let id = h.id || `bp-heading-${i}`
        if (!h.id) h.id = id
        if (seen.has(id)) { id = `${id}-${i}`; h.id = id }
        seen.add(id)
        return {
          id,
          text: (h.textContent || '').replace(/[#*`]/g, '').trim(),
          level: h.tagName.toLowerCase()
        }
      })
      setToc(items)
      if (items.length) setActiveId(items[0].id)
    }, 120)
    return () => clearTimeout(timer)
  }, [content])

  // TOC 当前项自动滚入侧栏可见区（block:nearest 只在不可见时滚侧栏，不干扰主页面）
  useEffect(() => {
    if (!activeId) return
    const el = document.querySelector('.toc-item.is-active')
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' })
  }, [activeId])

  // GSAP: 阅读进度条 scrub + TOC scroll-spy + 文章标题逐字（替换原手写 scroll 监听）
  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add({
      isReduce: '(prefers-reduced-motion: reduce)',
      isNormal: '(prefers-reduced-motion: no-preference)'
    }, ({ conditions }) => {
      const { isReduce } = conditions

      // 阅读进度条:scaleX 跟随整页滚动
      gsap.fromTo('.reading-progress',
        { scaleX: 0 },
        {
          scaleX: 1, ease: 'none',
          scrollTrigger: {
            trigger: '.blog-post',
            start: 'top top',
            end: 'max',
            scrub: 0.2
          }
        }
      )

      // TOC scroll-spy:每个 heading 越过阅读线(视口顶 120px)时高亮
      const heads = articleRef.current
        ? Array.from(articleRef.current.querySelectorAll('h2, h3'))
        : []
      heads.forEach((h) => {
        if (!h.id) return
        ScrollTrigger.create({
          trigger: h,
          start: 'top 120px',
          end: 'bottom 120px',
          onEnter: () => setActiveId(h.id),
          onEnterBack: () => setActiveId(h.id)
        })
      })

      // 文章标题逐字上浮(行遮罩;reduced-motion 跳过)
      if (!isReduce) {
        const titleEl = rootRef.current?.querySelector('.blog-post-title')
        if (titleEl) {
          const split = SplitText.create(titleEl, { type: 'lines, chars', mask: 'lines' })
          gsap.from(split.chars, {
            yPercent: 100, opacity: 0,
            duration: 0.7, ease: 'power3.out', stagger: 0.015
          })
        }
      }
    })
    return () => mm.revert()
  }, { scope: rootRef, dependencies: [toc] })

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleShare = async () => {
    const url = window.location.href
    const shareData = { title: post?.title, text: post?.excerpt, url }
    // 移动端优先系统分享
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
    if (isMobile && navigator.share) {
      try { await navigator.share(shareData) } catch {}
      return
    }
    // 桌面/兜底：复制链接 + toast 提示
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = url
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setToast('链接已复制到剪贴板')
    setTimeout(() => setToast(''), 2000)
  }

  const scrollToHeading = (id) => {
    const el = document.getElementById(id)
    if (!el) return
    // 手动计算位置，避免 sticky 父级下 scrollIntoView 失常；顶部留 90px 偏移
    const y = el.getBoundingClientRect().top + window.scrollY - 90
    window.scrollTo({ top: y, behavior: 'smooth' })
    setActiveId(id)
  }

  const otherPosts = useMemo(
    () => allPosts.filter(p => p.slug !== slug).slice(0, 5),
    [allPosts, slug]
  )

  const renderMoreArticles = (variant) => {
    if (!otherPosts.length) return null
    return (
      <div className={`more-articles ${variant ? `more-articles--${variant}` : ''}`}>
        <h4 className="aside-label">MORE ARTICLES</h4>
        <ul className="more-list">
          {otherPosts.map(p => (
            <li key={p.id}>
              <Link to={`/blog/${p.slug}`} className="more-item">
                <span className="more-item-title">{p.title}</span>
                <span className="more-item-meta">
                  {p.category} · {p.readTime}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <Link to="/blog" className="more-all">
          查看全部 <FaArrowRight />
        </Link>
      </div>
    )
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
          <Link to="/blog">
            <Button variant="outline" className="back-button">
              <FaArrowLeft /> 返回博客列表
            </Button>
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
          <Link to="/blog">
            <Button variant="outline" className="back-button">
              <FaArrowLeft /> 返回博客列表
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="blog-post" ref={rootRef}>
      {/* 顶部阅读进度线 */}
      <div className="reading-progress" />

      {/* 分享 toast */}
      {toast && <div className="blog-toast">{toast}</div>}

      <div className="blog-post-shell">
        {/* ── 主栏：正文 ── */}
        <div className="blog-post-main">
          {/* 返回按钮 */}
          <motion.div
            className="blog-post-nav"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link to="/blog">
              <Button variant="ghost" className="back-button">
                <FaArrowLeft /> 返回博客
              </Button>
            </Link>
          </motion.div>

          {/* 文章头部 */}
          <motion.header
            className="blog-post-header"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="post-eyebrow">ESSAY · {post.category}</p>

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
                  {post.wordCount && (
                    <span className="meta-item">
                      <FaFileAlt /> {post.wordCount.toLocaleString()} 字
                    </span>
                  )}
                </div>

                <div className="meta-tags">
                  <Badge variant="secondary" className="blogpost-category-badge">
                    {post.category}
                  </Badge>
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="blogpost-tag-badge">
                      <FaTag /> {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="blog-post-actions">
              <button className="action-button" onClick={handleShare}>
                <FaShare /> 分享
              </button>
            </div>
          </motion.header>

          {/* 文章内容 */}
          <motion.article
            ref={articleRef}
            className="blog-post-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <MarkdownRenderer content={content} />
          </motion.article>

          {/* 窄屏：内联的更多文章（宽屏由右侧栏承接，CSS 控制显隐） */}
          {renderMoreArticles('inline')}

          {/* 文章底部 */}
          <motion.footer
            className="blog-post-footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="footer-content">
              <div className="author-info">
                <div className="author-info__head">
                  <h3>关于作者</h3>
                  <a
                    href="https://github.com/gqy20"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="author-link"
                  >
                    <FaGithub /> GitHub
                  </a>
                </div>
                <p>
                  我是Qingyu Ge，一名在读硕士研究生，专注于AI辅助科研工具开发。
                  热衷于分享技术经验和学习心得。
                </p>
              </div>

              <div className="article-navigation">
                <Link to="/blog">
                  <Button variant="outline" className="nav-button">
                    <FaArrowLeft /> 查看更多文章
                  </Button>
                </Link>
              </div>
            </div>
          </motion.footer>
        </div>

        {/* ── 右侧栏：TOC + 更多文章（宽屏 sticky） ── */}
        <aside className="blog-post-aside">
          <div className="aside-inner">
            {toc.length > 0 && (
              <nav className="toc" aria-label="文章目录">
                <h4 className="aside-label">ON THIS PAGE</h4>
                <ul className="toc-list">
                  {toc.map(item => (
                    <li key={item.id}>
                      <button
                        className={`toc-item toc-${item.level} ${activeId === item.id ? 'is-active' : ''}`}
                        onClick={() => scrollToHeading(item.id)}
                      >
                        {item.text}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            {renderMoreArticles('aside')}
          </div>
        </aside>
      </div>
    </div>
  )
}

export default BlogPost
