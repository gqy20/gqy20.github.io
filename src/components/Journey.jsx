import { FaArrowRight } from 'react-icons/fa'
import TimelineSection from './TimelineSection.jsx'
import PageHeader from './PageHeader.jsx'

export default function Journey() {
  return (
    <div className="page-journey">
      <PageHeader num="04" title="JOURNEY">
        <h1 className="page-header__heading">从回答问题，到构建 Agent 社会。</h1>
        <p className="page-header__lede">
          一年时间，四个阶段。这条时间线记录了每一步转折——以及 AI 行业在同步发生什么。
          从调用 API 的消费者，到给 AI 做工具的构建者，再到让 Agent 组成自运转社会的架构师。
        </p>
        <div className="journey-hero__actions">
          <a href="#timeline" className="journey-btn journey-btn--primary">
            开始浏览 <FaArrowRight />
          </a>
        </div>
      </PageHeader>

      <TimelineSection />
    </div>
  )
}
