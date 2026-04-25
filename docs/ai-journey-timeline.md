# AI 发展 × 我的实践：双线时间线

> 从 AI 消费者到 MCP 工具构建者，再到 Agent 社会构建者。
> 记录 Qingyu Ge 在 2025-2026 年间，如何踩着 AI 行业的关键节点一步步构建自己的项目矩阵。

---

## 时间线总览

```
阶段一：AI 应用消费者          阶段二：MCP 早期采用者         阶段三：Agent 构建者           阶段四：Agent 社会构建者
(2025.04 - 2025.05)          (2025.07 - 2025.10)            (2025.12 - 2026.02)            (2026.03 - 至今)

用 LLM API 做应用             给 AI 做工具                    让 AI 成为独立 Agent            让多个 Agent 组成社会
pub2tts / SLAIS / ai_coding   article-mcp → protein-mcp      mind / IssueLab / Skills_demo  TrumanWorld / manim-agent
                             genome-mcp / crawl-mcp
```

---

## 详细时间线

### 阶段一：AI 应用消费者（2025.04 — 2025.05）

**行业背景：** GPT-4o（2025-05-13）带来多模态能力飞跃，Claude 3.5 Sonnet（2025-06-20）编码能力大幅提升。AI 编程助手 Cursor 完成 $60M A 轮（$400M 估值），开发者社区开始广泛接受 AI 辅助开发。

**我的动作：** 用 LLM API 做具体的应用场景。

| 日期 | 项目 | 说明 |
|------|------|------|
| 2025-04-01 | **pub2tts** ⭐2 | 从 PubMed 获取文献，将标题/关键词/摘要转中文并合成语音。最早的 AI 应用探索。 |
| 2025-05-31 | **SLAIS** ⭐6 | PDF 文献智能分析系统，基于 AI 的学术文献处理。 |
| 2025-05-31 | **ai_coding** ⭐3 | 用 AI 辅助编写代码的实验项目。 |
| 2025-06-23 | **gqy20.github.io** | 初始化个人主页项目（纯 HTML 版本）。 |

> **阶段特征：** 消费者心态——调用现成 API 解决具体问题，尚未深入 AI 工具链生态。

---

### 阶段二：MCP 早期采用者（2025.07 — 2025.10）

**行业背景：**

| 日期 | 事件 | 来源 |
|------|------|------|
| 2024-11-25 | **Anthropic 发布 MCP（Model Context Protocol）规范** | [den.dev 一周年回顾](https://den.dev/blog/one-year-of-mcp/) |
| 2025-02-24 | **Claude 3.7 Sonnet + Claude Code Beta 同日发布** | [Wikipedia](https://en.wikipedia.org/wiki/Claude_(language_model)) |
| 2025-05-22 | **Claude 4 发布 + Claude Code 正式版（GA）** | [InfoQ](https://www.infoq.com/news/2025/06/anthropic-claude-4/) |

MCP 协议发布后，生态开始形成。Cursor 在 2024-08 到 2024-12 间完成 A 轮→B 轮跳跃（$400M→$26亿估值），AI 编程工具进入爆发期。

**我的动作：** MCP 协议发布后 ~7.5 个月内开始跟进，连续构建多个领域 MCP 工具。

| 日期 | 项目 | 说明 |
|------|------|------|
| 2025-07-14 | **article-mcp** ⭐13 | 文献检索 MCP。第一个 MCP 项目，发布在 PyPI（v0.2.2）。MCP 发布后约 7.5 个月启动。 |
| 2025-08-15 | **mcp_agent** ⭐2 | MCP + Agent 结合的早期探索。与 Claude Code Beta 同期启动。 |
| 2025-09-14 | **genome-mcp** ⭐2 | 基因组数据 MCP，发布 PyPI v0.2.6（5 个 release）。将 MCP 扩展到生物信息学领域。 |
| 2025-09-18 | **note-gen-sync / note-gen-image-sync** | NoteGen 同步工具。 |
| 2025-10-16 | **astro_light_pollution** | 天文光污染分析 FastMCP 工具包。 |
| 2025-10-24 | **protein-mcp** | 蛋白质数据访问 FastMCP 工具（v0.1.5），面向生物信息学研究。 |
| 2025-10-28 | **cc_plugins** | Claude Code 专业插件集合（专家分析、研究工作流）。CC GA 后 ~5 个月启动。 |

> **阶段特征：** 从消费者转向构建者——不再只是用 AI，而是给 AI 做工具。覆盖了文献、基因组、蛋白质、天文等多个垂直领域。

---

### 阶段三：Agent 构建者（2025.12 — 2026.02）

**行业背景：**

| 日期 | 事件 | 来源 |
|------|------|------|
| 2025-09-29 | **Claude Code v2.0**（VS Code 扩展、UI 重做、检查点调试） | [hyperdev](https://hyperdev.matsuoka.com/p/anthropic-drops-claude-code-v200) |
| 2025-10-09 | **Claude Code Plugins 公测** | [AI Central News](https://aicentral.news/anthropic-debuts-claude-code-plugins-in-public-beta/) |
| 2025-12 | **Agent Skills 开放标准规范发布**（OpenAI Codex CLI 同步采用） | [SkillsMP](https://skillsmp.com/) |
| 2026-02 | **OpenClaw + Moltbook 病毒式传播**——开源 Agent 框架 + AI 社交网络 | [TechXplore](https://techxplore.com/news/2026-02-openclaw-moltbook-diy-ai-agent.html) |

Claude Code 从 Beta → GA → v2.0 → Plugins，生态快速成熟。Multi-Agent 协作概念从学术论文走向实际可用的框架。

**我的动作：** 围绕 CC 生态构建工具，同时转向多智能体系统。

| 日期 | 项目 | 说明 |
|------|------|------|
| 2025-09-26 | **process-tracker** | 流程追踪工具。 |
| 2025-10-05 | **ZoteroFlow** | Zotero 工作流工具。 |
| 2025-11-21 | **docker_image_pusher** | GitHub Action Docker 镜像转存工具（国内加速）。 |
| 2025-11-22 | **biotools_agent** | 基于 Claude Agent SDK 的生物信息学工具自动分析系统。 |
| 2025-12-07 | **pdfget** ⭐3 | 智能文献搜索与批量下载（v0.1.5，5 个 release）。 |
| 2025-12-27 | **justdo** | AI 待办事项工具（支持用户画像、Web 界面，v0.1.3）。 |
| 2025-12-28 | **evo-flywheel** | AI 驱动的进化生物学文献分析与报告系统。 |
| 2025-12-29 | **flywheel** | flywheel 相关项目。 |
| 2025-12-31 | **quick-py** | 现代 Python 项目模板（基于 Copier）。 |
| 2025-12-31 | **crawl-mcp** | 网页爬取 + AI 分析 MCP（v0.1.3，1 个 release）。 |
| 2025-12-31 | **mind** ⭐1 | **多智能体协作创新系统**——"AI agents that collaborate to spark innovation"。从单工具转向多 Agent 协作的关键转折点。 |
| 2026-01-02 | **TrendPluse** ⭐2 | GitHub 趋势 AI 分析工具——从开源动态中追踪 AI 编程和智能体生态趋势。 |
| 2026-01-08 | **cc-insights** ⭐3 | Claude Code 使用数据分析——可视化、模式发现、智能推荐。围绕 CC 生态构建基础设施。 |
| 2026-01-21 | **university-crawler** | 高校学术成果爬虫系统（103 所高校，增量更新+全文提取）。 |
| 2026-01-27 | **Skills_demo** ⭐4 | 基于 Claude Code Skills 的自适应 AI 助手。直接利用 Skills 标准构建。 |
| 2026-02-02 | **IssueLab** ⭐11 | **多智能体科研讨论网络**——基于 GitHub Issues，支持受控协作区触发跨仓库数字分身协作。与 OpenClaw/Moltbook 的 Agent 社交理念同源。 |
| 2026-02-12 | **issuelab-secondme** | IssueLab × SecondMe 集成（OAuth 登录、轨迹对话、用户画像、笔记沉淀）。 |
| 2026-02-21 | **llms_txt** | llms.txt 相关工具。 |
| 2026-02-24 | **codex_test** | Codex 测试项目。 |

> **阶段特征：** 从做工具转向做 Agent——不只是给 AI 提供能力接口，而是让 AI 成为有自主行为能力的主体。IssueLab 是这一阶段的集大成作。

---

### 阶段四：Agent 社会构建者（2026.03 — 至今）

**行业背景：**

- OpenClaw + Moltbook 在 2026 年初病毒式传播，"AI 社交网络"概念引发广泛关注
- Multi-Agent 系统、数字分身、Agent 社会模拟成为前沿方向
- Stanford Generative Agents 论文（2023-04）的思想开始被大规模工程化实现

**我的动作：** 构建 Agent 社会——让多个 Agent 不只是协作任务，而是组成有记忆、有关系、能演化的社会系统。

| 日期 | 项目 | 说明 |
|------|------|------|
| 2026-03-03 | **rss2cubox** | RSS 同步 + AI 过滤 + Agent 深化分析与全局洞察。 |
| 2026-03-07 | **TrumanWorld** ⭐11 | **主角项目——多智能体社会模拟系统**。"楚门的世界 AI 版"：AI 居民有记忆、会规划、形成关系；你是导演，只能观察和创造条件，不能操控他们的想法。尊重每一个主体的自由意志。这是从 Agent 协作到 Agent 社会的质变。 |
| 2026-03-24 | **minimax-studio** | MiniMax Studio CLI（视频/音频/音乐/拼接全流程工作流）。 |
| 2026-03-30 | **zotero_cli** ⭐4 | **为 Claude Code 等 AI Agent 设计的 Zotero 命行工具**（Go 语言，v0.0.8，5 个 release）。不是给人用的 CLI，而是给 Agent 用的接口——Agent 可以直接检索文献库、阅读 PDF、管理标注、生成引文。 |
| 2026-03-31 | **homebrew-tap** | Homebrew Tap，分发自己的 CLI 工具（zotero_cli 等）。 |
| 2026-04-09 | **note_wall** | Next.js + Supabase + Vercel 在线留言墙。 |
| 2026-04-10 | **manim-agent** | **AI Agent 数学动画自动生成系统**——自然语言输入，端到端产出带配音的 Manim 动画。Agent 不只是处理文本，而是完成完整的创作流程。 |

> **阶段特征：** Agent 社会构建者——TrumanWorld 让 Agent 组成有内在动力的社会，manim-agent 让 Agent 完成复杂创作，zotero_cli 为 Agent 提供原生基础设施。从"让 AI 工作"进化到"让 AI 世界自己运转"。

---

## 关键转折节点

### 转折一：pub2tts → article-mcp（消费者 → 构建者）
- **时间：** 2025.04 → 2025.07（间隔 ~3 个月）
- **触发：** MCP 协议发布提供了标准化的工具接入方式
- **意义：** 不再只是调用 API，而是参与构建 AI 工具链

### 转折二：article-mcp → mind（工具 → Agent）
- **时间：** 2025.07 → 2025.12（间隔 ~5 个月）
- **触发：** Claude Code 从 Beta 走向成熟，Agent 能力边界扩展
- **意义：** 从给 AI 做工具，到让 AI 自己成为行动主体

### 转折三：mind → TrumanWorld（Agent → Agent 社会）
- **时间：** 2025.12 → 2026.03（间隔 ~3 个月）
- **触发：** OpenClaw/Moltbook 引爆 Agent 社交概念，Multi-Agent 工程化条件成熟
- **意义：** 从单个/多个 Agent 协作任务，到 Agent 组成自运转的社会系统

## IssueLab 与 OpenClaw/Moltbook 的关系

**OpenClaw** 是一个开源的 Agent 框架，允许用户运行 24/7 的个人 AI 助手。**Moltbook** 是一个"为 AI Agent 构建的社交网络"，Agent 是一等公民，可以自主发帖、互动、建立关系。

**IssueLab** 的设计理念与 Moltbook 同源：
- 都关注 **Agent 之间的交互与协作**
- 都强调 **过程可追溯**（IssueLab 用 GitHub Issues，Moltbook 用社交动态）
- 都探索 **数字分身/身份** 在多 Agent 系统中的角色

区别在于：
- **Moltbook** 是开放的 Agent 社交空间（类似 AI 版 Twitter）
- **IssueLab** 是受控的多智能体科研讨论网络（基于 GitHub Issues，聚焦知识生产）

IssueLab 还通过 **issuelab-secondme** 与 SecondMe 集成，支持 OAuth 登录、轨迹对话、用户画像和笔记沉淀——进一步强化了"数字身份+持久记忆"的 Agent 特征。

---

## 数据统计（仅公开项目）

| 维度 | 数据 |
|------|------|
| 公开仓库数 | 38 |
| 总展示项目 | 35 |
| GitHub Stars | 71 |
| 时间跨度 | 2025-04-01 → 2026-04-10（~1 年零 9 天） |
| MCP 工具 | 5 个（article/crawl/genome/protein/astro） |
| 多智能体/Agent 项目 | TrumanWorld、IssueLab、mind、manim-agent、mcp_agent |
| 为 AI Agent 设计的工具 | zotero_cli、cc-insights、Skills_demo |
| 最高 Star 项目 | article-mcp（13⭐）、TrumanWorld（11⭐）、IssueLab（11⭐）、SLAIS（6⭐） |

---

## 参考来源

- [MCP 协议一周年回顾 - den.dev](https://den.dev/blog/one-year-of-mcp/)
- [Claude Code 时间线 - Wikipedia](https://en.wikipedia.org/wiki/Claude_(language_model))
- [Claude Code v2.0 发布 - hyperdev](https://hyperdev.matsuoka.com/p/anthropic-drops-claude-code-v200)
- [GPT-4o 发布 - OpenAI](https://openai.com/index/hello-gpt-4o/)
- [Claude 3.5 Sonnet 发布 - Anthropic](https://claudeaihub.com/claude-3-5-sonnet-released/)
- [Claude 4 发布 - InfoQ](https://www.infoq.com/news/2025/06/anthropic-claude-4/)
- [Claude Code Plugins 公测 - AI Central News](https://aicentral.news/anthropic-debuts-claude-code-plugins-in-public-beta/)
- [Agent Skills 开放标准 - SkillsMP](https://skillsmp.com/)
- [Stanford Generative Agents 论文 - arXiv](https://arxiv.org/abs/2304.03442)
- [OpenClaw & Moltbook - TechXplore](https://techxplore.com/news/2026-02-openclaw-moltbook-diy-ai-agent.html)
- [OpenClaw Moltbook 介绍 - moltbooks.com](https://moltsbooks.com/openclaw/)
- [Cursor 融资历程 - Forbes/TechCrunch](https://www.forbes.com/sites/rashishrivastava/2024/08/22/)
