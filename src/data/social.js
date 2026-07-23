import { FaGithub, FaEnvelope, FaRss } from 'react-icons/fa'
import { SiGitee, SiBilibili } from 'react-icons/si'

// 全站社交链接唯一源:Hero 侧栏/页脚、BlogPost "关于作者" 等都从这里取,避免多处硬编码。
export const GITHUB_URL = 'https://github.com/gqy20'

export const SOCIAL_LINKS = [
  { name: 'GitHub',     url: 'https://github.com/gqy20',                  icon: FaGithub,      label: 'github.com/gqy20' },
  { name: 'Gitee',      url: 'https://gitee.com/gqy20',                   icon: SiGitee,       label: 'gitee.com/gqy20' },
  { name: 'Bilibili',   url: 'https://space.bilibili.com/500302320',      icon: SiBilibili,    label: 'space.bilibili.com/500302320' },
  { name: 'ModelScope', url: 'https://modelscope.cn/profile/gqy2025',     icon: 'modelscope',  label: 'modelscope.cn/profile/gqy2025' },
  { name: 'RSS',        url: '/rss.xml',                                  icon: FaRss,         label: 'RSS / Atom feed' },
  { name: 'Email',      url: 'mailto:qingyu_ge@foxmail.com',              icon: FaEnvelope,    label: 'qingyu_ge@foxmail.com' },
]
