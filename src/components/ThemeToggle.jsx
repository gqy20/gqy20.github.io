import { useTheme } from '../hooks/useTheme'
import { motion, AnimatePresence } from 'framer-motion'
import './ThemeToggle.css'

/**
 * 主题切换按钮 — fixed 浮动，挂在所有页面右上角
 * - 当前是暗色 → 显示太阳（点击切到亮色）
 * - 当前是亮色 → 显示月亮（点击切到暗色）
 *
 * 设计要点：
 * - 不依赖任何外部容器（Navbar / Sidebar），所以 Hero 那种有自己侧边栏的页面也能用
 * - position: fixed + 高 z-index，但放在不挡内容的角落
 */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <motion.button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? '切换到亮色主题' : '切换到暗色主题'}
      title={isDark ? '切换到亮色主题（⌘/Ctrl+Shift+L）' : '切换到暗色主题（⌘/Ctrl+Shift+L）'}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.08 }}
      transition={{ type: 'spring', stiffness: 360, damping: 22 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          className="theme-toggle__icon"
          initial={{ y: -8, opacity: 0, rotate: -45 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 8, opacity: 0, rotate: 45 }}
          transition={{ duration: 0.22, ease: [0.33, 1, 0.68, 1] }}
          aria-hidden="true"
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}
