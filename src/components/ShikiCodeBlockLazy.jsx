import React, { Suspense, lazy } from 'react'
import './ShikiCodeBlock.css'

// 懒加载 ShikiCodeBlock - 这会将其分割到独立的 chunk
const ShikiCodeBlock = lazy(() =>
  import('./ShikiCodeBlock').then(module => ({
    default: module.default
  }))
)

// 简单的降级组件，在语法高亮加载时显示
const SimpleCodeBlock = ({ children, className, ...props }) => {
  // 提取语言名称
  const language = className ? className.replace('language-', '').replace('lang-', '') : 'code'

  return (
    <div className="code-block-wrapper simple" style={{
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      margin: '16px 0',
      overflow: 'hidden',
      backgroundColor: 'var(--bg-color)'
    }}>
      <div className="code-header" style={{
        padding: '8px 16px',
        backgroundColor: 'var(--border-color)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px'
      }}>
        <span className="language-badge" style={{
          background: 'var(--accent-color)',
          color: 'white',
          padding: '2px 8px',
          borderRadius: '4px',
          fontWeight: 'bold'
        }}>
          {language}
        </span>
        <span style={{ color: 'var(--text-color)', opacity: 0.7 }}>
          加载语法高亮中...
        </span>
      </div>
      <pre style={{
        margin: 0,
        padding: '16px',
        overflow: 'auto',
        backgroundColor: 'var(--bg-color)',
        color: 'var(--text-color)'
      }}>
        <code style={{
          fontFamily: '"Fira Code", "Courier New", monospace',
          fontSize: '14px',
          lineHeight: '1.5'
        }}>
          {children}
        </code>
      </pre>
    </div>
  )
}

const ShikiCodeBlockLazy = ({ children, className, ...props }) => {
  // 检查是否是简单的内联代码
  const isInline = !children || !String(children).includes('\n') || String(children).length < 30

  if (isInline) {
    return (
      <code className="markdown-inline-code" style={{
        backgroundColor: 'var(--border-color)',
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: '0.9em',
        fontFamily: '"Fira Code", "Courier New", monospace'
      }} {...props}>
        {children}
      </code>
    )
  }

  return (
    <Suspense fallback={<SimpleCodeBlock {...props} />}>
      <ShikiCodeBlock {...props}>
        {children}
      </ShikiCodeBlock>
    </Suspense>
  )
}

export default ShikiCodeBlockLazy