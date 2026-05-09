import { FaArrowRight } from 'react-icons/fa'
import TimelineSection from './TimelineSection.jsx'
import './Journey.css'

export default function Journey() {
  return (
    <div className="page-journey">
      <section className="journey-hero">
        <header className="journey-hero__head">
          <span className="journey-hero__num">01</span>
          <span className="journey-hero__title">JOURNEY</span>
          <span className="journey-hero__rule" />
        </header>
        <h1 className="journey-hero__heading">从回答问题，到构建 Agent 社会。</h1>
        <p className="journey-hero__lede">
          一年时间，四个阶段。这条时间线记录了每一步转折——以及 AI 行业在同步发生什么。
          从调用 API 的消费者，到给 AI 做工具的构建者，再到让 Agent 组成自运转社会的架构师。
        </p>
        <div className="journey-hero__actions">
          <a href="#timeline" className="journey-btn journey-btn--primary">
            开始浏览 <FaArrowRight />
          </a>
          <a href="#/" className="journey-btn journey-btn--secondary">返回首页</a>
        </div>
      </section>

      <TimelineSection />
    </div>
  )
}
