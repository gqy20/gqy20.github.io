// Vite 插件:在 build 末尾生成 RSS / Atom feed,以及每篇文章的对外干净 URL 跳转壳
//
// 产物:
//   dist/rss.xml            RSS 2.0 feed
//   dist/atom.xml           Atom 1.0 feed
//   dist/blog/:slug/index.html   跳转壳(SPA 内仍走 /#/blog/:slug)
//
// 数据源:src/data/blog/index.json(由 npm run sync-blog 从 *.md frontmatter 派生)
// 自动触发:npm run build → 本插件 closeBundle → 写 dist/ → 跟前端一起部署
import fs from 'node:fs'
import path from 'node:path'
import { Feed } from 'feed'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkHtml from 'remark-html'

const SITE = 'https://home.gqy20.top'
const BLOG_DIR = path.join(process.cwd(), 'src', 'data', 'blog')
const INDEX_FILE = path.join(BLOG_DIR, 'index.json')
const DIST_DIR = path.join(process.cwd(), 'dist')

// 对外 URL 跳转壳:reader/爬虫看到 /blog/:slug 真实 200 页,内部 0 秒跳到 SPA
function buildShellHtml(slug, title) {
  return `<!doctype html>
<html lang="zh-cn">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<link rel="canonical" href="${SITE}/blog/${slug}">
<meta name="robots" content="noindex">
<script>location.replace('${SITE}/#/blog/${slug}')</script>
</head>
<body>
<p>正在前往文章…若未自动跳转请<a href="${SITE}/#/blog/${slug}">点这里</a>。</p>
</body>
</html>`
}

function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function rssPlugin() {
  return {
    name: 'vite-plugin-rss',
    apply: 'build',
    async closeBundle() {
      if (!fs.existsSync(INDEX_FILE)) {
        console.warn('[rss-plugin] index.json not found, skip RSS generation. Run `npm run sync-blog` first.')
        return
      }

      const index = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'))
      const posts = (index.posts || []).filter((p) => p.published !== false)

      const feed = new Feed({
        title: "Qingyu Ge's Blog",
        description: 'AI 编程 / RAG / 工程实践笔记',
        id: SITE,
        link: SITE,
        language: 'zh-cn',
        favicon: `${SITE}/favicon.svg`,
        copyright: `© ${new Date().getFullYear()} Qingyu Ge`,
        feedLinks: {
          rss2: `${SITE}/rss.xml`,
          atom: `${SITE}/atom.xml`,
        },
        updated: posts[0] ? new Date(posts[0].updated || posts[0].date) : new Date(),
      })

      for (const p of posts) {
        const mdPath = path.join(BLOG_DIR, `${p.id}.md`)
        if (!fs.existsSync(mdPath)) continue

        const raw = fs.readFileSync(mdPath, 'utf-8')
        const { content, data: fm } = matter(raw)

        // 默认只放 excerpt,让 feed 体积小、reader 抓取快
        // 需要全文进 <content:encoded> 的文章,在 frontmatter 加 `fullContent: true`
        const includeFull = fm.fullContent === true
        const html = includeFull
          ? String(await remark().use(remarkGfm).use(remarkHtml).process(content))
          : undefined

        const url = `${SITE}/blog/${p.slug}`
        feed.addItem({
          title: p.title,
          id: url,
          link: url,
          guid: p.slug,
          date: new Date(p.updated || p.date),
          description: p.excerpt,
          ...(html !== undefined && { content: html }),
          author: [{ name: p.author || 'Qingyu Ge' }],
          category: (p.tags || []).map((t) => ({ name: t })),
          image: p.coverImage ? `${SITE}${p.coverImage}` : undefined,
        })

        // 写跳转壳 dist/blog/:slug/index.html
        const slugDir = path.join(DIST_DIR, 'blog', p.slug)
        fs.mkdirSync(slugDir, { recursive: true })
        fs.writeFileSync(
          path.join(slugDir, 'index.html'),
          buildShellHtml(p.slug, p.title)
        )
      }

      fs.writeFileSync(path.join(DIST_DIR, 'rss.xml'), feed.rss2())
      fs.writeFileSync(path.join(DIST_DIR, 'atom.xml'), feed.atom1())

      console.log(
        `[rss-plugin] generated rss.xml / atom.xml + ${posts.length} post shell pages`
      )
    },
  }
}
