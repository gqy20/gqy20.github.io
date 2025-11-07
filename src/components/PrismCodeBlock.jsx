import React, { useState, useEffect, useMemo, useCallback } from 'react'
import Prism from 'prismjs'
import './PrismCodeBlock.css'

// 语言包加载器 - 按需加载，避免阻塞首屏
const languageLoaders = {
  'javascript': () => import('prismjs/components/prism-javascript'),
  'python': () => import('prismjs/components/prism-python'),
  'yaml': () => import('prismjs/components/prism-yaml'),
  'jsx': () => import('prismjs/components/prism-jsx'),
  'css': () => import('prismjs/components/prism-css'),
  'bash': () => import('prismjs/components/prism-bash'),
  'json': () => import('prismjs/components/prism-json'),
  'html': () => import('prismjs/components/prism-markup'),
  'xml': () => import('prismjs/components/prism-markup'),
  'markdown': () => import('prismjs/components/prism-markdown'),
  'typescript': () => import('prismjs/components/prism-typescript'),
  'ts': () => import('prismjs/components/prism-typescript'),
  'js': () => import('prismjs/components/prism-javascript'),
  'py': () => import('prismjs/components/prism-python'),
  'yml': () => import('prismjs/components/prism-yaml'),
  'sh': () => import('prismjs/components/prism-bash'),
  'zsh': () => import('prismjs/components/prism-bash'),
  'shell': () => import('prismjs/components/prism-bash')
}

// 缓存已加载的语言包
const loadedLanguages = new Set()

// 智能语言包加载
const loadLanguage = async (lang) => {
  // 如果已经加载，直接返回
  if (loadedLanguages.has(lang) || Prism.languages[lang]) {
    return true
  }

  try {
    const loader = languageLoaders[lang.toLowerCase()]
    if (loader) {
      await loader()
      loadedLanguages.add(lang)
      return true
    } else {
      console.warn(`Language "${lang}" is not supported by Prism.js, falling back to plain text`)
      return false
    }
  } catch (error) {
    console.error(`Failed to load language "${lang}":`, error)
    return false
  }
}

// 获取语言显示名称
const getLanguageDisplayName = (lang) => {
  const languageNames = {
    'javascript': 'JavaScript',
    'python': 'Python',
    'yaml': 'YAML',
    'jsx': 'JSX',
    'css': 'CSS',
    'bash': 'Bash',
    'json': 'JSON',
    'html': 'HTML',
    'xml': 'XML',
    'markdown': 'Markdown',
    'typescript': 'TypeScript',
    'text': 'Text'
  }
  return languageNames[lang] || lang.toUpperCase()
}

// 加载骨架屏组件
const LoadingSkeleton = ({ language }) => (
  <div className="prism-code-block">
    <div className="prism-code-header">
      <div className="prism-code-info">
        <span className="prism-language-badge">{getLanguageDisplayName(language)}</span>
        <span className="prism-code-lines">加载语法高亮中...</span>
      </div>
      <div className="prism-code-actions">
        <button className="prism-action-button" disabled>
          📋
        </button>
      </div>
    </div>
    <div className="prism-loading-skeleton" style={{ height: '80px' }} />
    <div className="prism-loading-text">正在加载 {getLanguageDisplayName(language)} 语法高亮...</div>
  </div>
)

const PrismCodeBlock = ({ children, className, ...props }) => {
  const [isHighlighted, setIsHighlighted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [highlightError, setHighlightError] = useState(null)

  // 性能优化：缓存语言解析结果
  const language = useMemo(() => {
    if (!className) {
      console.log('PrismCodeBlock: No className provided, defaulting to text')
      return 'text'
    }

    console.log('PrismCodeBlock: className received:', className)

    // 支持多种语法格式 - 扩展模式匹配
    const patterns = [
      /language-(\w+)/,           // 标准格式: language-javascript
      /lang-(\w+)/,               // 简化格式: lang-js
      /^(\w+)$/                   // 直接格式: javascript
    ]

    for (const pattern of patterns) {
      const match = className.match(pattern)
      if (match) {
        const detectedLang = match[1].toLowerCase()
        console.log(`PrismCodeBlock: Detected language "${detectedLang}" from pattern "${pattern}"`)
        return detectedLang
      }
    }

    console.log(`PrismCodeBlock: No language pattern matched in className "${className}", defaulting to text`)
    return 'text'
  }, [className])

  // 性能优化：防抖复制功能
  const copyCode = useCallback(async () => {
    try {
      const textToCopy = String(children || '')
      if (!textToCopy) return

      // 优先使用现代剪贴板API
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy)
      } else {
        // 降级到传统方法
        const textArea = document.createElement('textarea')
        textArea.value = textToCopy
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.select()

        const success = document.execCommand('copy')
        document.body.removeChild(textArea)

        if (!success) {
          throw new Error('Failed to copy using execCommand')
        }
      }

      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
      // 可以在这里显示错误提示
    }
  }, [children])

  // 异步语法高亮处理
  useEffect(() => {
    if (!children || language === 'text') {
      setIsHighlighted(true)
      setIsLoading(false)
      return
    }

    let isMounted = true
    let highlightTimer = null

    const highlightCode = async () => {
      setIsLoading(true)
      setHighlightError(null)

      try {
        // 动态加载语言包
        const isLanguageLoaded = await loadLanguage(language)

        if (isMounted) {
          if (isLanguageLoaded) {
            // 使用requestAnimationFrame确保不阻塞UI
            highlightTimer = requestAnimationFrame(() => {
              if (isMounted) {
                try {
                  // 执行语法高亮
                  Prism.highlightAllUnder(document.querySelector('.prism-code-content'))
                  setIsHighlighted(true)
                  setHighlightError(null)
                } catch (error) {
                  console.error('Prism highlighting error:', error)
                  setHighlightError(error)
                  setIsHighlighted(true) // 即使出错也显示内容
                } finally {
                  setIsLoading(false)
                }
              }
            })
          } else {
            // 语言包加载失败，显示纯文本
            setIsHighlighted(true)
            setIsLoading(false)
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Language loading error:', error)
          setHighlightError(error)
          setIsHighlighted(true)
          setIsLoading(false)
        }
      }
    }

    // 延迟执行，避免阻塞首屏渲染
    const delayTimer = setTimeout(highlightCode, 100)

    return () => {
      isMounted = false
      clearTimeout(delayTimer)
      if (highlightTimer) {
        cancelAnimationFrame(highlightTimer)
      }
    }
  }, [children, language])

  // 如果还没有内容，显示加载状态
  if (isLoading && !isHighlighted) {
    return <LoadingSkeleton language={language} />
  }

  // 计算代码行数
  const lineCount = children ? String(children).split('\n').length : 0

  return (
    <div className="prism-code-block">
      {/* 代码头部 - 语言标识和操作按钮 */}
      <div className="prism-code-header">
        <div className="prism-code-info">
          <span className="prism-language-badge">
            {getLanguageDisplayName(language)}
          </span>
          <span className="prism-code-lines">
            {lineCount} 行
          </span>
        </div>
        <div className="prism-code-actions">
          <button
            onClick={copyCode}
            className="prism-action-button"
            title={isCopied ? "已复制!" : "复制代码"}
            aria-label={isCopied ? "已复制" : "复制代码"}
          >
            {isCopied ? '✅' : '📋'}
          </button>
        </div>
      </div>

      {/* 代码内容区域 */}
      <div className="prism-code-content">
        <pre className={`language-${language}`}>
          <code className={`language-${language}`}>
            {children}
          </code>
        </pre>
      </div>

      {/* 错误提示（仅在开发环境显示） */}
      {process.env.NODE_ENV === 'development' && highlightError && (
        <div className="prism-error-hint" style={{
          padding: '8px 16px',
          background: 'rgba(255, 193, 7, 0.1)',
          border: '1px solid rgba(255, 193, 7, 0.3)',
          borderRadius: '4px',
          margin: '8px 16px',
          fontSize: '12px',
          color: '#856404'
        }}>
          <small>
            ⚠️ 语法高亮失败，显示纯文本
            {highlightError.message && `: ${highlightError.message}`}
          </small>
        </div>
      )}
    </div>
  )
}

export default React.memo(PrismCodeBlock)