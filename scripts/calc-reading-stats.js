import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES 模块获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_DIR = path.join(__dirname, '../src/data/blog');
const INDEX_FILE = path.join(BLOG_DIR, 'index.json');

// 阅读速度(单位/分钟):中英混合技术文章,中文偏慢 + 大量表格/代码干扰,取 350
// (纯中文小说 ~500 字/分,技术文含术语和图表,350 较合理)
const WORDS_PER_MIN = 350;

/**
 * 剥离 Markdown 标记,只保留「会被阅读」的文字
 */
function stripMarkdown(md) {
  return md
    .replace(/```[\s\S]*?```/g, ' ')          // 围栏代码块
    .replace(/`[^`]*`/g, ' ')                  // 行内代码
    .replace(/!\[.*?\]\(.*?\)/g, ' ')          // 图片
    .replace(/\[([^\]]*)\]\(.*?\)/g, '$1')     // 链接 → 保留文字
    .replace(/<[^>]+>/g, ' ')                  // HTML 标签
    .replace(/^\s{0,3}[#>\-*+]\s+/gm, ' ')     // 标题 / 引用 / 无序列表符号
    .replace(/^\s{0,3}\d+\.\s+/gm, ' ')        // 有序列表符号
    .replace(/\|/g, ' ')                       // 表格管道符
    .replace(/^\s*[-:]+\s*$/gm, ' ')           // 表格分隔行
    .replace(/[*_~]/g, ' ')                    // 加粗 / 斜体 / 删除线
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 统计阅读量:中文字符 + 英文/数字单词
 */
function countWords(text) {
  const cn = (text.match(/[一-龥]/g) || []).length;
  const en = (text.match(/[a-zA-Z0-9]+/g) || []).length;
  return { cn, en, total: cn + en };
}

/**
 * 去掉 frontmatter(开头 --- ... ---)
 */
function extractBody(md) {
  const fmEnd = md.indexOf('---', 3);
  if (fmEnd === -1) return md;
  return md.slice(fmEnd + 3);
}

// —— 主流程 ——
const index = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));

let updated = 0;
for (const post of index.posts) {
  const mdPath = path.join(BLOG_DIR, `${post.id}.md`);
  if (!fs.existsSync(mdPath)) {
    console.warn(`⚠️  未找到 ${post.id}.md,跳过`);
    continue;
  }

  const raw = fs.readFileSync(mdPath, 'utf-8');
  const clean = stripMarkdown(extractBody(raw));
  const { cn, en, total } = countWords(clean);
  const minutes = Math.max(1, Math.ceil(total / WORDS_PER_MIN));

  const oldReadTime = post.readTime;
  post.wordCount = total;
  post.readTime = `${minutes}分钟`;

  console.log(
    `✅ ${post.id}\n   中文 ${cn} + 英文词 ${en} = ${total} 单位 → ${post.readTime}` +
    (oldReadTime !== post.readTime ? `(原 ${oldReadTime})` : '')
  );
  updated++;
}

fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2) + '\n', 'utf-8');
console.log(`\n已更新 ${updated} 篇文章的字数(wordCount)与阅读时间(readTime)`);
console.log(`写入:${path.relative(process.cwd(), INDEX_FILE)}`);
