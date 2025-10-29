import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import ShikiCodeBlock from './ShikiCodeBlock'
import './MarkdownRenderer.css'

const MarkdownRenderer = ({ content }) => {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // 自定义标题渲染
          h1: ({ children, ...props }) => (
            <h1 className="markdown-title" {...props}>{children}</h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="markdown-heading" {...props}>{children}</h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="markdown-subheading" {...props}>{children}</h3>
          ),
          // 自定义段落渲染
          p: ({ children, ...props }) => (
            <p className="markdown-paragraph" {...props}>{children}</p>
          ),
          // 自定义列表渲染
          ul: ({ children, ...props }) => (
            <ul className="markdown-list" {...props}>{children}</ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="markdown-ordered-list" {...props}>{children}</ol>
          ),
          li: ({ children, ...props }) => {
            // 更精确地检查是否是任务列表项
            // 确保只有真正包含checkbox的li才被识别为任务列表项
            const isTaskItem = props.className?.includes('task-list-item') &&
                             React.Children.toArray(children).some(child =>
                               React.isValidElement(child) && child.type === 'input' && child.props.type === 'checkbox'
                             )
            if (isTaskItem) {
              return (
                <li className="task-list-item" {...props}>
                  {children}
                </li>
              )
            }
            return <li className="markdown-list-item" {...props}>{children}</li>
          },
          // 自定义代码块渲染 - 使用Shiki高亮
          code: ({ inline, children, className, ...props }) => {
            if (inline) {
              return (
                <code className="markdown-inline-code" {...props}>
                  {children}
                </code>
              )
            }

            // 检测内容复杂度，简单内容使用内联样式
            const content = String(children)
            const isSimpleContent = !content.includes('\n') && content.length < 50

            if (isSimpleContent) {
              return (
                <code className="markdown-inline-code" {...props}>
                  {children}
                </code>
              )
            }

            // 复杂代码块使用ShikiCodeBlock组件
            return (
              <ShikiCodeBlock className={className} {...props}>
                {children}
              </ShikiCodeBlock>
            )
          },
          pre: ({ children, ...props }) => {
            // 直接返回children，让code组件处理所有代码块
            return children
          },
          // 自定义链接渲染
          a: ({ children, href, ...props }) => (
            <a
              href={href}
              className="markdown-link"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
          ),
          // 自定义引用渲染
          blockquote: ({ children, ...props }) => (
            <blockquote className="markdown-quote" {...props}>{children}</blockquote>
          ),
          // 自定义表格渲染
          table: ({ children, ...props }) => (
            <div className="markdown-table-wrapper">
              <table className="markdown-table" {...props}>{children}</table>
            </div>
          ),
          th: ({ children, ...props }) => (
            <th className="markdown-table-header" {...props}>{children}</th>
          ),
          td: ({ children, ...props }) => (
            <td className="markdown-table-cell" {...props}>{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export default MarkdownRenderer