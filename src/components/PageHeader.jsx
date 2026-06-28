import { Link } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'
import './PageHeader.css'

/**
 * 统一页面头部：编号 + 标题 + 横线 + 返回首页
 * 各子页面（Projects / Blog / Journey）顶部接入，保证一致的返回入口。
 */
const PageHeader = ({ num, title, homeLabel = '返回首页', children }) => (
  <header className="page-header">
    <div className="page-header__inner">
      <div className="page-header__head">
        {num && <span className="page-header__num">{num}</span>}
        {title && <span className="page-header__title">{title}</span>}
        <span className="page-header__rule" />
        <Link to="/" className="page-header__home">
          <FaArrowLeft /> {homeLabel}
        </Link>
      </div>
      {children && <div className="page-header__body">{children}</div>}
    </div>
  </header>
)

export default PageHeader
