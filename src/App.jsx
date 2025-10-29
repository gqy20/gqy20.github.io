import { useState } from 'react'
import { motion } from 'framer-motion'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Projects from './components/Projects'
import Blog from './components/Blog'
import BlogPost from './components/BlogPost'
import ComponentTest from './components/ComponentTest'
import ParticleBackground from './components/ParticleBackground'
import './App.css'

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  return (
    <Router>
      <div className={`app ${isDarkMode ? 'dark' : ''}`}>
        <ParticleBackground />
        <Navbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Routes>
            <Route path="/" element={<Hero />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/components" element={<ComponentTest />} />
                      </Routes>
        </motion.div>
      </div>
    </Router>
  )
}

export default App