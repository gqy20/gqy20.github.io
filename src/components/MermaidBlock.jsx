import { useEffect, useState } from 'react'
import './MermaidBlock.css'

// mermaid 单例:首次用到才动态 import,不进主 bundle
let mermaidReady = null
async function getMermaid() {
  if (!mermaidReady) {
    const mermaid = (await import('mermaid')).default
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',           // 站点代码块统一暗色体系
      securityLevel: 'loose',
      fontFamily: 'inherit',
    })
    mermaidReady = mermaid
  }
  return mermaidReady
}

let renderSeq = 0

export default function MermaidBlock({ chart }) {
  const [svg, setSvg] = useState('')
  const [error, setError] = useState('')

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

  if (error) {
    return (
      <div className="mermaid-block mermaid-block--error">
        <p className="mermaid-error-msg">⚠ 图表渲染失败:{error}</p>
        <pre className="mermaid-error-src">{chart}</pre>
      </div>
    )
  }

  return (
    <div className="mermaid-block">
      {svg
        ? <div className="mermaid-svg" dangerouslySetInnerHTML={{ __html: svg }} />
        : <div className="mermaid-loading">渲染图表中…</div>}
    </div>
  )
}
