import { lazy, Suspense } from 'react'
import { motion } from 'motion/react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Hero from './components/Hero'
import ScrollToTopButton from './components/ScrollToTopButton.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import './App.css'

// 路由级懒加载:首屏只加载 Hero,其余页面按需拆 chunk
// (BlogPost 的 markdown + katex + prism 栈只在进博客时才加载)
const Projects = lazy(() => import('./components/Projects'))
const Blog = lazy(() => import('./components/Blog'))
const BlogPost = lazy(() => import('./components/BlogPost.jsx'))
const Journey = lazy(() => import('./components/Journey.jsx'))
const ComponentTest = lazy(() => import('./components/ComponentTest.jsx'))

export default function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="app">
        <div className="app-content">
          <main className="main-content">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="page-content"
            >
              <Suspense fallback={<div className="route-loading">加载中…</div>}>
                <Routes>
                  <Route path="/" element={<Hero />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/journey" element={<Journey />} />
                  <Route path="/components" element={<ComponentTest />} />
                </Routes>
              </Suspense>
            </motion.div>
          </main>
        </div>
        <ScrollToTopButton />
        <ThemeToggle />
      </div>
    </Router>
  )
}
