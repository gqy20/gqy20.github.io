import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react'
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
  FaFileAlt,
  FaSync
} from 'react-icons/fa'
import Badge from './Badge'
import Button from './Button'
import BlogVisual from './BlogVisual'
import MarkdownRenderer from './MarkdownRenderer'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap.js'
import { GITHUB_URL } from '../data/social.js'
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

  // cursor 指示条对齐 active 标题;active 项离开侧栏可视区时手动滚 aside(用 scrollTop,
  // 避免 scrollIntoView 的跨容器副作用——它会滚 window,干扰主滚动)。
  useEffect(() => {
    if (!activeId) return
    const raf = requestAnimationFrame(() => {
      const el = document.querySelector('.toc-item.is-active')
      if (!el) return
      const cursor = document.querySelector('.toc-cursor')
      if (cursor) {
        cursor.style.top = `${el.offsetTop}px`
        cursor.style.height = `${el.offsetHeight}px`
      }
      const aside = document.querySelector('.blog-post-aside')
      const list = document.querySelector('.toc-list')
      if (aside && list) {
        const er = el.getBoundingClientRect()
        const ar = aside.getBoundingClientRect()
        if (er.top < ar.top - 2 || er.bottom > ar.bottom + 2) {
          aside.scrollTop = el.offsetTop + list.offsetTop - aside.clientHeight / 2 + el.offsetHeight / 2
        }
      }
    })
    return () => cancelAnimationFrame(raf)
  }, [activeId])

  // TOC scroll-spy:scroll + rAF 调度 + 范围模式遍历(标题越线后保持高亮,直到下一个越线)。
  // 渲染轻量靠 TocItem 的 memo(activeId 变化只重渲染 2 项),故可直接 setActiveId 保证连续。
  // 文末哨兵 IO 兜底——哨兵进入视口 → 锁定最后一个标题。
  useEffect(() => {
    if (!toc.length) return
    const heads = toc.map(t => document.getElementById(t.id)).filter(Boolean)
    if (!heads.length) return

    const OFFSET = 130
    let scrollRafId = 0
    const compute = () => {
      scrollRafId = 0
      const liveHeads = Array.from(document.querySelectorAll('.blog-post-content h2, .blog-post-content h3'))
      let current = liveHeads[0]?.id || ''
      for (const h of liveHeads) {
        if (h.getBoundingClientRect().top <= OFFSET) current = h.id
        else break
      }
      setActiveId(current)
    }
    const onScroll = () => {
      if (!scrollRafId) scrollRafId = requestAnimationFrame(compute)
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    compute()
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (scrollRafId) cancelAnimationFrame(scrollRafId)
    }
  }, [toc])

  // GSAP:仅保留阅读进度条 scrub(scroll-spy 已改用 IntersectionObserver)
  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add({
      isReduce: '(prefers-reduced-motion: reduce)',
      isNormal: '(prefers-reduced-motion: no-preference)'
    }, () => {
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
      // NOTE: TOC 侧栏进度线(.toc-progress)的 scaleY 改由下方 scroll-spy 的 compute
      // 直接设,与 active 高亮同帧同步(比独立 ScrollTrigger 稳,避开 rerun 时序竞态)
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

  const handleSelect = useCallback((id) => {
    const el = document.getElementById(id)
    if (!el) return
    // 手动计算位置,避免 sticky 父级下 scrollIntoView 失常;顶部留 90px 偏移
    const y = el.getBoundingClientRect().top + window.scrollY - 90
    window.scrollTo({ top: y, behavior: 'smooth' })
    setActiveId(id)
  }, [])

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

            <div className="blog-post-cover blog-post-cover--visual">
              <BlogVisual postId={post.id} />
            </div>

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
                  {post.updated && post.updated !== post.date && (
                    <span className="meta-item meta-updated">
                      <FaSync /> 更新于 {formatDate(post.updated)}
                    </span>
                  )}
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
                    href={GITHUB_URL}
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
                  <span className="toc-cursor" aria-hidden="true" />
                  {toc.map(item => (
                    <TocItem
                      key={item.id}
                      item={item}
                      isActive={activeId === item.id}
                      onSelect={handleSelect}
                    />
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

const TocItem = memo(function TocItem({ item, isActive, onSelect }) {
  return (
    <li>
      <button
        type="button"
        className={`toc-item toc-${item.level} ${isActive ? 'is-active' : ''}`}
        onClick={() => onSelect(item.id)}
      >
        {item.text}
      </button>
    </li>
  )
})

export default BlogPost
