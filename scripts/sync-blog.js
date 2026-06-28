// 从 src/data/blog/*.md 的 frontmatter + 正文自动生成 index.json
// 用法: npm run sync-blog
// md frontmatter 是唯一数据源;readTime/wordCount 由本脚本从正文自动计算,frontmatter 不写。
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BLOG_DIR = path.join(__dirname, '..', 'src', 'data', 'blog')
const INDEX_FILE = path.join(BLOG_DIR, 'index.json')

// 阅读速度:中英混合技术文,中文偏慢 + 表格/代码干扰,取 350 字/分
const WORDS_PER_MIN = 350

// 解析简易 YAML frontmatter(string / array / bool / number)
function parseFrontmatter(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) return null
  const data = {}
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_]+):\s*(.*)$/)
    if (!kv) continue
    const [, key, raw] = kv
    const val = raw.trim()
    if (val.startsWith('[')) {
      const inner = val.replace(/^\[/, '').replace(/\]$/, '')
      data[key] = inner.split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean)
    } else if (val === 'true' || val === 'false') {
      data[key] = val === 'true'
    } else if (/^-?\d+$/.test(val)) {
      data[key] = Number(val)
    } else {
      data[key] = val.replace(/^["']|["']$/g, '')
    }
  }
  return data
}

// 剥离 Markdown 标记,只留会被阅读的文字
function stripMarkdown(md) {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[.*?\]\(.*?\)/g, ' ')
    .replace(/\[([^\]]*)\]\(.*?\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^\s{0,3}[#>\-*+]\s+/gm, ' ')
    .replace(/^\s{0,3}\d+\.\s+/gm, ' ')
    .replace(/\|/g, ' ')
    .replace(/^\s*[-:]+\s*$/gm, ' ')
    .replace(/[*_~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// 字数 = 中文字符 + 英文/数字词
function countWords(text) {
  const cn = (text.match(/[一-龥]/g) || []).length
  const en = (text.match(/[a-zA-Z0-9]+/g) || []).length
  return cn + en
}

function main() {
  const files = fs.readdirSync(BLOG_DIR)
    .filter(f => f.endsWith('.md') && !f.startsWith('_'))

  const posts = []
  for (const file of files) {
    const content = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8')
    const fm = parseFrontmatter(content)
    if (!fm) {
      console.warn(`⚠ 跳过(无 frontmatter): ${file}`)
      continue
    }
    if (fm.published === false) continue  // 草稿不进 index

    const id = fm.id || file.replace(/\.md$/, '')
    const body = stripMarkdown(content.replace(/^---[\s\S]*?---/, '').trim())
    const total = countWords(body)
    const minutes = Math.max(1, Math.ceil(total / WORDS_PER_MIN))

    posts.push({
      id,
      title: fm.title || id,
      type: fm.type || 'survey',
      date: fm.date || '',
      updated: fm.updated || fm.date || '',
      readTime: `${minutes}分钟`,   // 自动算,不从 frontmatter 读
      author: fm.author || '',
      tags: fm.tags || [],
      category: fm.category || '',
      excerpt: fm.excerpt || '',
      coverImage: fm.coverImage || '',
      published: fm.published !== false,
      slug: fm.slug || id,
      wordCount: total               // 自动算
    })
  }

  posts.sort((a, b) => (b.date || '').localeCompare(a.date || ''))

  const lastDate = posts.reduce((max, p) => {
    const d = p.updated || p.date
    return d && d > max ? d : max
  }, '')

  const index = {
    lastUpdated: lastDate ? new Date(lastDate).toISOString() : new Date().toISOString(),
    totalPosts: posts.length,
    categories: [...new Set(posts.map(p => p.category).filter(Boolean))],
    posts
  }

  fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2) + '\n', 'utf8')
  console.log(`✓ 同步 ${posts.length} 篇文章 → src/data/blog/index.json`)
  for (const p of posts) {
    console.log(`  • ${p.id}: ${p.wordCount} 字 → ${p.readTime}`)
  }
}

main()
