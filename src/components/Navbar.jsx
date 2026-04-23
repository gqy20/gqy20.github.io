import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaSun, FaMoon, FaBars, FaTimes } from 'react-icons/fa'
import './Navbar.css'

const Navbar = ({ isDarkMode, setIsDarkMode }) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [currentPath, setCurrentPath] = useState('/')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleHashChange = () => {
      const path = window.location.hash.replace('#', '') || '/'
      setCurrentPath(path)
      setIsMobileMenuOpen(false)
    }

    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const navItems = [
    { name: '首页', href: '#/' },
    { name: '项目', href: '#/projects' },
    { name: '博客', href: '#/blog' }
  ]

  return (
    <motion.nav
      className={`navbar ${isScrolled ? 'scrolled' : ''}`}
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.28 }}
    >
      <div className="navbar-container">
        <motion.a
          href="#/"
          className="navbar-logo"
          whileTap={{ scale: 0.96 }}
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
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileTap={{ scale: 0.98 }}
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
            aria-label={isDarkMode ? '切换到亮色模式' : '切换到深色模式'}
            whileTap={{ scale: 0.94 }}
          >
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </motion.button>

          <motion.button
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? '关闭导航菜单' : '打开导航菜单'}
            whileTap={{ scale: 0.94 }}
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
                whileTap={{ scale: 0.98 }}
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
