import { Link } from 'react-router-dom'
import './PageHeader.css'

export default function PageHeader({ num, title, children }) {
  return (
    <header className="page-header">
      <div className="page-header__inner">
        <div className="page-header__head">
          <span className="page-header__num">{num}</span>
          <span className="page-header__title">{title}</span>
          <span className="page-header__rule" />
          <Link to="/" className="page-header__home">← 首页</Link>
        </div>
        {children && <div className="page-header__body">{children}</div>}
      </div>
    </header>
  )
}
