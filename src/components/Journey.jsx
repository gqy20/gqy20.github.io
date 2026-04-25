import { FaArrowRight } from 'react-icons/fa'
import TimelineSection from './TimelineSection.jsx'

export default function Journey() {
  return (
    <main className="ai-home">
      <section className="ai-hero journey-hero">
        <div className="ai-shell">
          <p className="ai-kicker">AI Journey / 2025 → 2026</p>
          <h1>从回答问题，到构建 Agent 社会。</h1>
          <p className="ai-lede">
            一年时间，四个阶段。这条时间线记录了每一步转折——以及 AI 行业在同步发生什么。
            从调用 API 的消费者，到给 AI 做工具的构建者，再到让 Agent 组成自运转社会的架构师。
          </p>
          <div className="ai-actions">
            <a href="#timeline" className="ai-button ai-button-primary">
              开始浏览 <FaArrowRight />
            </a>
            <a href="#/" className="ai-button ai-button-secondary">
              返回首页
            </a>
          </div>
        </div>
      </section>

      <TimelineSection />
    </main>
  )
}
