import React, { useState, useEffect, useMemo } from 'react'
import { createHighlighter } from 'shiki'
import './ShikiCodeBlock.css'

const ShikiCodeBlock = ({ children, className, ...props }) => {
  const [highlightedCode, setHighlightedCode] = useState('')
  const [language, setLanguage] = useState('text')
  const [theme, setTheme] = useState('github-dark')
  const [isCopied, setIsCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // 检测网站主题
  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.querySelector('.app')?.classList.contains('dark') ||
                    document.body.classList.contains('dark') ||
                    window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDarkMode(isDark)
      setTheme(isDark ? 'github-dark' : 'github-light')
    }

    checkTheme()
    const observer = new MutationObserver(checkTheme)
    const appElement = document.querySelector('.app') || document.body
    observer.observe(appElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  // 解析语言信息
  const parsedLanguage = useMemo(() => {
    if (!className) return 'text'

    const patterns = [
      /language-(\w+)/,
      /lang-(\w+)/,
      /(\w+)/
    ]

    for (const pattern of patterns) {
      const match = pattern.exec(className)
      if (match) {
        const lang = match[1].toLowerCase()
        const langMap = {
          'js': 'javascript',
          'ts': 'typescript',
          'py': 'python',
          'rb': 'ruby',
          'sh': 'bash',
          'zsh': 'bash',
          'fish': 'bash',
          'yml': 'yaml',
          'dockerfile': 'dockerfile'
        }
        return langMap[lang] || lang
      }
    }

    return 'text'
  }, [className])

  // 高亮代码
  useEffect(() => {
    if (!children) {
      setIsLoading(false)
      return
    }

    const lang = parsedLanguage
    setLanguage(lang)
    setIsLoading(true)

    const highlightCode = async () => {
      try {
        const highlighter = await createHighlighter({
          themes: ['github-dark', 'github-light'],
          langs: [
            'javascript',
            'typescript',
            'python',
            'css',
            'html',
            'json',
            'bash',
            'markdown',
            'java',
            'cpp',
            'c',
            'go',
            'rust',
            'sql',
            'yaml',
            'xml',
            'php',
            'ruby',
            'swift',
            'kotlin',
            'scala',
            'r',
            'dockerfile'
          ]
        })

        const code = highlighter.codeToHtml(String(children), {
          lang,
          theme: theme
        })
        setHighlightedCode(code)
        setIsLoading(false)
      } catch (err) {
        console.error('Shiki highlighter error:', err)
        // 降级到纯文本显示
        const escapedCode = String(children)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
        setHighlightedCode(`<pre><code>${escapedCode}</code></pre>`)
        setIsLoading(false)
      }
    }

    highlightCode()
  }, [children, parsedLanguage, theme])

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(String(children))
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = String(children)
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  const toggleTheme = () => {
    setTheme(prev => prev === 'github-dark' ? 'github-light' : 'github-dark')
  }

  // 获取语言显示名称
  const getLanguageDisplayName = (lang) => {
    const languageNames = {
      'javascript': 'JavaScript',
      'typescript': 'TypeScript',
      'python': 'Python',
      'css': 'CSS',
      'html': 'HTML',
      'json': 'JSON',
      'bash': 'Bash',
      'markdown': 'Markdown',
      'java': 'Java',
      'cpp': 'C++',
      'c': 'C',
      'go': 'Go',
      'rust': 'Rust',
      'sql': 'SQL',
      'yaml': 'YAML',
      'xml': 'XML',
      'php': 'PHP',
      'ruby': 'Ruby',
      'swift': 'Swift',
      'kotlin': 'Kotlin',
      'scala': 'Scala',
      'r': 'R',
      'dockerfile': 'Dockerfile',
      'text': 'Text'
    }
    return languageNames[lang] || lang.toUpperCase()
  }

  if (isLoading) {
    return (
      <div className="code-block-wrapper">
        <div className="code-header">
          <div className="code-info">
            <span className="language-badge">{getLanguageDisplayName(language)}</span>
            <span className="code-lines">加载中...</span>
          </div>
          <div className="code-actions">
            <button className="theme-toggle" disabled>
              🌙
            </button>
            <button className="copy-button" disabled>
              📋
            </button>
          </div>
        </div>
        <div className="code-loading">
          <pre><code>{String(children)}</code></pre>
        </div>
      </div>
    )
  }

  return (
    <div className="code-block-wrapper">
      <div className="code-header">
        <div className="code-info">
          <span className="language-badge">{getLanguageDisplayName(language)}</span>
          <span className="code-lines">
            {String(children).split('\n').length} 行
          </span>
        </div>
        <div className="code-actions">
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            title={theme === 'github-dark' ? '切换到浅色主题' : '切换到深色主题'}
          >
            {theme === 'github-dark' ? '🌙' : '☀️'}
          </button>
          <button
            onClick={copyCode}
            className="copy-button"
            title="复制代码"
          >
            {isCopied ? '✅' : '📋'}
          </button>
        </div>
      </div>
      <div
        className="code-content"
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
      />
    </div>
  )
}

export default ShikiCodeBlock