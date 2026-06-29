import { useEffect, useState } from 'react'
import './MermaidBlock.css'

// mermaid 单例:首次用到才动态 import,不进主 bundle
let mermaidReady = null
async function getMermaid() {
  if (!mermaidReady) {
    const mermaid = (await import('mermaid')).default
    // 读取站点 dt-* 设计变量,让 mermaid 配色融入体系并自动跟随深/浅主题
    const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim()
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      securityLevel: 'loose',
      fontFamily: 'inherit',
      themeVariables: {
        background: 'transparent',
        primaryColor:        css('--dt-surface')     || '#0f1424', // 节点底色:卡片面
        primaryBorderColor:  css('--dt-accent-line') || 'rgba(255,184,107,0.35)', // 节点边框:橙
        primaryTextColor:    css('--dt-ink')         || '#e8edf5', // 节点文字
        lineColor:           css('--dt-dim')         || '#5e6a7e', // 连线
        clusterBkg:          'transparent',
        clusterBorder:       css('--dt-line-strong') || 'rgba(150,200,255,0.18)', // subgraph 框
        edgeLabelBackground: css('--dt-surface-2')   || '#161d33',
        fontSize:            '14px',
      },
    })
    mermaidReady = mermaid
  }
  return mermaidReady
}

let renderSeq = 0

export default function MermaidBlock({ chart }) {
  const [svg, setSvg] = useState('')
  const [error, setError] = useState('')
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    let cancelled = false
    getMermaid().then(async (mermaid) => {
      try {
        const id = `mmd-${++renderSeq}`
        const { svg } = await mermaid.render(id, chart.trim())
        if (!cancelled) { setSvg(svg); setError('') }
      } catch (e) {
        if (!cancelled) setError(e?.message || String(e))
      }
    })
    return () => { cancelled = true }
  }, [chart])

  // 全屏:锁页面滚动 + ESC 关闭
  useEffect(() => {
    if (!fullscreen) return
    const onKey = (e) => { if (e.key === 'Escape') setFullscreen(false) }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [fullscreen])

  if (error) {
    return (
      <div className="mermaid-block mermaid-block--error">
        <p className="mermaid-error-msg">⚠ 图表渲染失败:{error}</p>
        <pre className="mermaid-error-src">{chart}</pre>
      </div>
    )
  }

  return (
    <div
      className={`mermaid-block ${fullscreen ? 'is-fullscreen' : ''}`}
      onClick={() => svg && setFullscreen(!fullscreen)}
      role="button"
      tabIndex={0}
      title={fullscreen ? '点击空白处或按 ESC 关闭' : '点击放大查看'}
    >
      {svg
        ? (
          <div
            className="mermaid-svg"
            onClick={fullscreen ? (e) => e.stopPropagation() : undefined}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )
        : <div className="mermaid-loading">渲染图表中…</div>}
      {svg && !fullscreen && <span className="mermaid-zoom-hint" aria-hidden="true">🔍 点击放大</span>}
      {fullscreen && (
        <button
          className="mermaid-fullscreen-close"
          aria-label="关闭"
          onClick={(e) => { e.stopPropagation(); setFullscreen(false) }}
        >
          ✕
        </button>
      )}
    </div>
  )
}
