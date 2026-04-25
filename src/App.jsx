import { motion } from 'framer-motion'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Projects from './components/Projects'
import Blog from './components/Blog'
import BlogPost from './components/BlogPost'
import ComponentTest from './components/ComponentTest'
import { useDarkMode } from './hooks/useDarkMode.js'
import './App.css'

function App() {
  const { isDarkMode, toggle: toggleDarkMode } = useDarkMode()

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className={`app ${isDarkMode ? 'dark' : ''}`}>
        <div className="app-content">
          <main className="main-content">
            <Navbar isDarkMode={isDarkMode} setIsDarkMode={toggleDarkMode} />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="page-content"
            >
              <Routes>
                <Route path="/" element={<Hero />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/components" element={<ComponentTest />} />
              </Routes>
            </motion.div>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App
