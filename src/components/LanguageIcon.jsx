import { FaPython, FaJs, FaCode } from 'react-icons/fa'
import { SiTypescript, SiRuby, SiJavascript } from 'react-icons/si'

const LANGUAGE_ICONS = {
  'Python': FaPython,
  'TypeScript': SiTypescript,
  'JavaScript': SiJavascript,
  'JS': FaJs,
  'Go': FaCode,
  'Golang': FaCode,
  'Ruby': SiRuby,
  'Unknown': FaCode,
}

export default function LanguageIcon({ language, className = '' }) {
  const Icon = LANGUAGE_ICONS[language] || FaCode
  return <Icon className={className} />
}
