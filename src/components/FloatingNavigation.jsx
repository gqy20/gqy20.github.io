import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaSun, FaMoon, FaHome, FaCode, FaBook, FaTimes } from 'react-icons/fa'
import './FloatingNavigation.css'

const FloatingNavigation = ({ isDarkMode, setIsDarkMode }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [currentPath, setCurrentPath] = useState('/')
  const [showQuickNav, setShowQuickNav] = useState(false)
  const [touchStart, setTouchStart] = useState(null)
  const lastActivityRef = useRef(Date.now())
  const timeoutRef = useRef(null)

  // 检测当前路径
  useEffect(() => {
    const handleHashChange = () => {
      const path = window.location.hash.replace('#', '') || '/'
      setCurrentPath(path)
    }

    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // 双击顶部显示导航
  const handleDoubleClick = useCallback(() => {
    setIsVisible(true)
    setShowQuickNav(true)
    lastActivityRef.current = Date.now()

    // 3秒后自动隐藏
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false)
      setShowQuickNav(false)
    }, 3000)
  }, [])

  // 长按显示导航
  const handleMouseDown = useCallback(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
      setShowQuickNav(true)
      lastActivityRef.current = Date.now()
    }, 800)

    const handleMouseUp = () => {
      clearTimeout(timer)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false)
        setShowQuickNav(false)
      }, 2000)
    }

    document.addEventListener('mouseup', handleMouseUp, { once: true })
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  // 滚动到顶部时显示导航提示
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const now = Date.now()

      // 在页面顶部且最近没有活动时显示导航提示
      if (scrollTop < 50 && now - lastActivityRef.current > 5000) {
        setIsVisible(true)
        setShowQuickNav(false)

        // 2秒后自动隐藏
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(() => {
          setIsVisible(false)
          setShowQuickNav(false)
        }, 2000)
      }

      lastActivityRef.current = now
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 导航项
  const navItems = [
    { name: '首页', href: '#/', icon: FaHome, color: '#6366f1' },
    { name: '项目', href: '#/projects', icon: FaCode, color: '#10b981' },
    { name: '博客', href: '#/blog', icon: FaBook, color: '#f59e0b' }
  ]

  const handleNavigation = (href) => {
    window.location.hash = href
    setIsVisible(false)
    setShowQuickNav(false)
    lastActivityRef.current = Date.now()
  }

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode)
    lastActivityRef.current = Date.now()
  }

  return (
    <>
      {/* 顶部检测区域 - 完全透明且不可见 */}
      <div
        className="floating-nav-trigger"
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
      />

      {/* 浮动导航 */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="floating-navigation"
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
              duration: 0.3
            }}
          >
            {/* 关闭按钮 */}
            <motion.button
              className="floating-close"
              onClick={() => {
                setIsVisible(false)
                setShowQuickNav(false)
              }}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaTimes />
            </motion.button>

            {/* 导航内容 */}
            <div className="floating-content">
              {/* 快速导航 */}
              {showQuickNav && (
                <motion.div
                  className="quick-nav"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {navItems.map((item, index) => {
                    const Icon = item.icon
                    const isActive = item.href.replace('#', '') === currentPath ||
                                   (currentPath === '/' && item.href === '#/')

                    return (
                      <motion.button
                        key={item.name}
                        className={`nav-item ${isActive ? 'active' : ''}`}
                        onClick={() => handleNavigation(item.href)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.1 }}
                        whileHover={{ scale: 1.05, x: 5 }}
                        whileTap={{ scale: 0.95 }}
                        style={{ '--nav-color': item.color }}
                      >
                        <Icon className="nav-icon" />
                        <span className="nav-label">{item.name}</span>
                      </motion.button>
                    )
                  })}
                </motion.div>
              )}

              {/* 主题切换 */}
              <motion.div
                className="theme-control"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.button
                  className="theme-toggle-btn"
                  onClick={handleThemeToggle}
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {isDarkMode ? <FaSun /> : <FaMoon />}
                </motion.button>
                <span className="theme-label">
                  {isDarkMode ? '浅色模式' : '深色模式'}
                </span>
              </motion.div>

              {/* 提示文本 */}
              <motion.div
                className="nav-hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {showQuickNav
                  ? '点击任意位置或等待自动隐藏'
                  : '双击顶部区域或长按显示导航菜单'
                }
              </motion.div>
            </div>

            {/* 背景关闭区域 */}
            <div
              className="nav-backdrop"
              onClick={() => {
                setIsVisible(false)
                setShowQuickNav(false)
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default FloatingNavigation