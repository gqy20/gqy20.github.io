import React, { useState, useMemo, useCallback } from 'react'
import Prism from 'prismjs'

// 静态 import 全部需要的语言包 — prismjs 的 components/* 是 UMD 脚本
// (Prism.languages.xxx = {...}),依赖全局 Prism 变量。Vite 的动态 import() 会
// 把它当 ES module 解析,副作用不执行,所以这里用静态 import 让 Vite 在构建时
// 把副作用打进 bundle,加载时立即注册到 Prism.languages。
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-yaml'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-markup'   // html / xml / markup
import 'prismjs/components/prism-markdown'

import { FaCheck, FaCode, FaCopy } from 'react-icons/fa'
import {
  SiGnubash,
  SiCss,
  SiHtml5,
  SiJavascript,
  SiJson,
  SiMarkdown,
  SiPython,
  SiReact,
  SiTypescript,
  SiYaml
} from 'react-icons/si'
import './PrismCodeBlock.css'

// 别名 → 实际语言 key(react-markdown 给的 className 可能是 js/ts/py/yml 等)
const LANG_ALIAS = {
  js: 'javascript',
  ts: 'typescript',
  jsx: 'jsx',
  tsx: 'jsx',
  py: 'python',
  yml: 'yaml',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  xml: 'markup',
  html: 'markup',
  md: 'markdown'
}

// 解析代码块 className,得到语言 key
const resolveLanguage = (className) => {
  if (!className) return 'text'
  const m = className.match(/(?:^|[\s])(?:lang(?:uage)?-)?(\w+)/)
  if (!m) return 'text'
  const key = m[1].toLowerCase()
  return LANG_ALIAS[key] || key
}

// 同步高亮(语言已静态 import 完毕)。不支持的语言(没注册到 Prism.languages)
// 用 try/catch 兜底,失败时返回转义后的纯文本 — 避免危险字符未转义
const highlight = (code, lang) => {
  const grammar = Prism.languages[lang]
  if (!grammar) return escapeHtml(code)
  try {
    return Prism.highlight(code, grammar, lang)
  } catch (err) {
    console.warn(`Prism highlight failed for "${lang}":`, err)
    return escapeHtml(code)
  }
}

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

// 获取语言显示名称
const getLanguageDisplayName = (lang) => {
  const languageNames = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    jsx: 'JSX',
    python: 'Python',
    yaml: 'YAML',
    css: 'CSS',
    bash: 'Bash',
    json: 'JSON',
    markup: 'HTML',
    markdown: 'Markdown',
    text: 'Text'
  }
  return languageNames[lang] || lang.toUpperCase()
}

// 语言 → Simple Icons logo 映射(单色,currentColor 适配主题色)。
// 没匹配到的语言用 FaCode 兜底。jsx/tsx 复用 SiReact(JSX/TSX 多数场景就是 React)。
const LANG_ICON_MAP = {
  javascript: SiJavascript,
  js: SiJavascript,
  typescript: SiTypescript,
  ts: SiTypescript,
  jsx: SiReact,
  tsx: SiReact,
  python: SiPython,
  py: SiPython,
  css: SiCss,
  html: SiHtml5,
  xml: SiHtml5,
  markup: SiHtml5,
  json: SiJson,
  yaml: SiYaml,
  yml: SiYaml,
  markdown: SiMarkdown,
  md: SiMarkdown,
  bash: SiGnubash,
  sh: SiGnubash,
  shell: SiGnubash,
  zsh: SiGnubash
}

const getLanguageIcon = (lang) => LANG_ICON_MAP[lang] || FaCode

const PrismCodeBlock = ({ children, className }) => {
  const [isCopied, setIsCopied] = useState(false)

  // 同步解析语言 + 高亮(放到 useMemo,只在 children/language 变化时重算)
  const { language, lineCount, highlightedHtml } = useMemo(() => {
    const lang = resolveLanguage(className)
    const code = String(children || '').replace(/\n$/, '')  // 去掉末尾换行(Prism 习惯)
    const lines = code.split('\n').length
    const html = lang === 'text' || !code ? escapeHtml(code) : highlight(code, lang)
    return { language: lang, lineCount: lines, highlightedHtml: html }
  }, [children, className])

  const copyCode = useCallback(async () => {
    const textToCopy = String(children || '').replace(/\n$/, '')
    if (!textToCopy) return
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy)
      } else {
        const ta = document.createElement('textarea')
        ta.value = textToCopy
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }, [children])

  const LangIcon = getLanguageIcon(language)

  return (
    <div className="prism-code-block">
      <div className="prism-code-header">
        <div className="prism-code-info">
          <span className="prism-language-badge">
            <LangIcon className="prism-lang-icon" aria-hidden="true" />
            {getLanguageDisplayName(language)}
          </span>
          <span className="prism-code-lines">{lineCount} 行</span>
        </div>
        <div className="prism-code-actions">
          <button
            onClick={copyCode}
            className="prism-action-button"
            title={isCopied ? '已复制!' : '复制代码'}
            aria-label={isCopied ? '已复制' : '复制代码'}
          >
            {isCopied ? <FaCheck /> : <FaCopy />}
          </button>
        </div>
      </div>

      {/* 用 dangerouslySetInnerHTML 渲染高亮结果 — 避免 React 重渲 children 时
          用 textContent 覆盖 Prism 写入的 token span */}
      <div className="prism-code-content">
        <pre className={`language-${language}`}>
          <code
            className={`language-${language}`}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </pre>
      </div>
    </div>
  )
}

export default React.memo(PrismCodeBlock)
