import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaSun, FaMoon, FaBars, FaTimes } from 'react-icons/fa'
import './Navbar.css'

const Navbar = ({ isDarkMode, setIsDarkMode }) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [currentPath, setCurrentPath] = useState('/')
  const [navigationState, setNavigationState] = useState('idle') // idle, browsing, seeking, interacting
  const [userActivity, setUserActivity] = useState({ scrollDirection: 'none', lastActivity: Date.now() })
  const activityTimeoutRef = useRef(null)

  // 智能状态管理 - Jobs理念的情境感知
  const updateNavigationState = useCallback(() => {
    const now = Date.now()
    const timeSinceLastActivity = now - userActivity.lastActivity

    // 基于用户行为确定导航状态
    if (timeSinceLastActivity < 1000) {
      setNavigationState('interacting')
    } else if (timeSinceLastActivity < 3000) {
      setNavigationState('seeking')
    } else if (isScrolled) {
      setNavigationState('browsing')
    } else {
      setNavigationState('idle')
    }
  }, [isScrolled, userActivity.lastActivity])

  // 智能滚动检测 - 区分不同类型的滚动行为
  useEffect(() => {
    let lastScrollY = 0
    let scrollVelocity = 0
    let scrollAcceleration = 0

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const deltaY = currentScrollY - lastScrollY

      // 计算滚动速度和加速度
      scrollVelocity = Math.abs(deltaY)
      scrollAcceleration = scrollVelocity - (userActivity.scrollVelocity || 0)

      // 判断用户意图
      let intent = 'browsing'
      if (Math.abs(deltaY) > 5) {
        if (deltaY < 0) {
          intent = 'seeking' // 向上滚动 = 寻找内容
        } else {
          intent = 'browsing' // 向下滚动 = 浏览内容
        }
      }

      setUserActivity({
        scrollDirection: deltaY < 0 ? 'up' : deltaY > 0 ? 'down' : 'none',
        scrollVelocity,
        scrollAcceleration,
        lastActivity: Date.now(),
        intent
      })

      setIsScrolled(currentScrollY > 50)
      lastScrollY = currentScrollY
      updateNavigationState()
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [updateNavigationState])

  // 页面路径检测
  useEffect(() => {
    const handleHashChange = () => {
      const path = window.location.hash.replace('#', '') || '/'
      setCurrentPath(path)
      setUserActivity(prev => ({ ...prev, lastActivity: Date.now(), intent: 'navigating' }))
    }

    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // 鼠标活动检测
  useEffect(() => {
    const handleMouseMove = () => {
      setUserActivity(prev => ({ ...prev, lastActivity: Date.now() }))
      updateNavigationState()
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [updateNavigationState])

  // 自动回归空闲状态
  useEffect(() => {
    const resetToIdle = () => {
      setNavigationState('idle')
    }

    activityTimeoutRef.current = setTimeout(resetToIdle, 5000)

    return () => {
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current)
      }
    }
  }, [userActivity.lastActivity])

  // 交互处理
  const handleInteraction = useCallback(() => {
    setUserActivity(prev => ({ ...prev, lastActivity: Date.now(), intent: 'interacting' }))
    setNavigationState('interacting')

    // 3秒后自动降低状态
    setTimeout(() => {
      updateNavigationState()
    }, 3000)
  }, [updateNavigationState])

  const navItems = [
    { name: '首页', href: '#/', icon: '🏠' },
    { name: '项目', href: '#/projects', icon: '💻' },
    { name: '博客', href: '#/blog', icon: '📖' }
  ]

  return (
    <motion.nav
      className={`navbar ${navigationState} ${isScrolled ? 'scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <div className="navbar-container">
        <motion.a
          href="#/"
          className="navbar-logo"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          QY
        </motion.a>

        <div className="navbar-menu">
          {navItems.map((item, index) => {
            const isActive = item.href.replace('#', '') === currentPath ||
                           (currentPath === '/' && item.href === '#/')
            return (
              <motion.a
                key={item.name}
                href={item.href}
                className={`navbar-link ${isActive ? 'active' : ''}`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={handleInteraction}
                onFocus={handleInteraction}
              >
                <span className="nav-text">{item.name}</span>
              </motion.a>
            )
          })}
        </div>

        <div className="navbar-controls">
          <motion.button
            className="theme-toggle"
            onClick={() => setIsDarkMode(!isDarkMode)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </motion.button>

          <motion.button
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {navItems.map((item) => (
              <motion.a
                key={item.name}
                href={item.href}
                className="mobile-menu-link"
                onClick={() => setIsMobileMenuOpen(false)}
                whileHover={{ x: 10 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.name}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Navbar
