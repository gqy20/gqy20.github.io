export const timelineStages = [
  {
    id: 'consumer',
    label: 'AI 应用消费者',
    period: '2025.04 — 2025.05',
    theme: '用 LLM API 做应用',
    industryContext:
      'GPT-4o 多模态能力飞跃，Claude 3.5 Sonnet 编码能力大幅提升。Cursor 完成 A 轮→B 轮跳跃，开发者社区开始广泛接受 AI 辅助开发。',
    industryEvents: [
      { date: '2025-05-13', title: 'GPT-4o 发布', description: '多模态能力飞跃，文本/图像/音频统一处理' },
      { date: '2025-06-20', title: 'Claude 3.5 Sonnet', description: '编码能力大幅提升，64% 编程问题解决率' },
    ],
    projects: [
      {
        name: 'pub2tts',
        date: '2025-04-01',
        description: '从 PubMed 获取文献，将标题/关键词/摘要转中文并合成语音。最早的 AI 应用探索。',
        tags: ['TTS', 'PubMed', 'AI应用'],
      },
      {
        name: 'SLAIS',
        date: '2025-05-31',
        description: 'PDF 文献智能分析系统，基于 AI 的学术文献处理。专为科研人员和学生设计。',
        tags: ['PDF分析', '学术', 'AI'],
      },
      {
        name: 'ai_coding',
        date: '2025-05-31',
        description: '用 AI 辅助编写代码的实验项目。探索 LLM 在编程工作流中的早期应用。',
        tags: ['AI编程', '实验'],
      },
    ],
    stageInsight: '消费者心态——调用现成 API 解决具体问题，尚未深入 AI 工具链生态。',
    side: 'left',
  },
  {
    id: 'mcp-builder',
    label: 'MCP 早期采用者',
    period: '2025.07 — 2025.10',
    theme: '给 AI 做工具',
    industryContext:
      'Anthropic 发布 MCP（Model Context Protocol）开放协议。Claude Code 从 Beta 走向正式版。MCP 生态开始形成，工具接入有了标准化路径。',
    industryEvents: [
      { date: '2024-11-25', title: 'MCP 协议发布', description: 'Anthropic 开放 Model Context Protocol 规范' },
      { date: '2025-02-24', title: 'Claude Code Beta', description: '与 Claude 3.7 Sonnet 同日发布，首个 agentic CLI 工具' },
      { date: '2025-05-22', title: 'Claude Code GA + Claude 4', description: '正式版发布，Agent 能力边界大幅扩展' },
      { date: '2024-08→12', title: 'Cursor 爆发期', description: '$400M → $26亿估值，AI 编程工具进入主流' },
    ],
    projects: [
      {
        name: 'article-mcp',
        date: '2025-07-14',
        description: '文献检索 MCP。第一个 MCP 项目，发布 PyPI v0.2.2。让智能体稳定获取论文和全文上下文。',
        tags: ['MCP', '文献检索', 'PyPI'],
        highlight: true,
      },
      {
        name: 'mcp_agent',
        date: '2025-08-15',
        description: 'MCP + Agent 结合的早期探索。在 CC Beta 同期启动，尝试将 MCP 工具链与 Agent 架构打通。',
        tags: ['MCP', 'Agent', '早期探索'],
      },
      {
        name: 'genome-mcp',
        date: '2025-09-14',
        description: '基因组数据 MCP（PyPI v0.2.6，5 个 release）。将 MCP 扩展到生物信息学领域。',
        tags: ['MCP', '生物信息', '基因组'],
      },
      {
        name: 'astro_light_pollution',
        date: '2025-10-16',
        description: '天文光污染分析 FastMCP 工具包。为 AI 助手提供专业的光污染评估和天文观测条件分析。',
        tags: ['MCP', '天文', 'FastMCP'],
      },
      {
        name: 'protein-mcp',
        date: '2025-10-24',
        description: '蛋白质数据访问 FastMCP 工具（v0.1.5）。面向生物信息学研究的数据接口层。',
        tags: ['MCP', '蛋白质', '生物信息'],
      },
      {
        name: 'cc_plugins',
        date: '2025-10-28',
        description: 'Claude Code 专业插件集合——专家分析、研究工作流。CC GA 后 ~5 个月启动。',
        tags: ['CC插件', '专家分析'],
      },
    ],
    stageInsight:
      '从消费者转向构建者——不再只是用 AI，而是给 AI 做工具。覆盖文献、基因组、蛋白质、天文等多个垂直领域。',
    side: 'right',
  },
  {
    id: 'agent-builder',
    label: 'Agent 构建者',
    period: '2025.12 — 2026.02',
    theme: '让 AI 成为独立 Agent',
    industryContext:
      'Claude Code v2.0（VS Code 扩展、检查点调试）、Plugins 公测、Agent Skills 开放标准相继发布。OpenClaw + Moltbook 病毒式传播，Multi-Agent 概念从论文走向工程实践。',
    industryEvents: [
      { date: '2025-09-29', title: 'Claude Code v2.0', description: '原生 VS Code 扩展、UI 重做、时间旅行调试' },
      { date: '2025-10-09', title: 'CC Plugins 公测', description: '可安装 Slash Commands、MCP Servers、Hooks' },
      { date: '2025-12', title: 'Agent Skills 规范', description: '开放标准，OpenAI Codex CLI 同步采用' },
      { date: '2026-02', title: 'OpenClaw + Moltbook', description: '开源 Agent 框架 + AI 社交网络病毒式传播' },
    ],
    projects: [
      {
        name: 'pdfget',
        date: '2025-12-07',
        description: '智能文献搜索与批量下载（v0.1.5，5 个 release）。高级检索 + 并发下载。',
        tags: ['文献', '下载', 'CLI'],
      },
      {
        name: 'justdo',
        date: '2025-12-27',
        description: 'AI 待办事项工具（v0.1.3）。支持用户画像和 Web 界面。',
        tags: ['待办', 'AI', 'CLI'],
      },
      {
        name: 'evo-flywheel',
        date: '2025-12-28',
        description: 'AI 驱动的进化生物学文献分析与报告系统。',
        tags: ['进化生物学', '文献分析', 'AI'],
      },
      {
        name: 'crawl-mcp',
        date: '2025-12-31',
        description: '网页爬取 + AI 分析 MCP（v0.1.3）。基于 crawl4ai 和 FastMCP。',
        tags: ['MCP', '爬取', 'AI分析'],
      },
      {
        name: 'mind',
        date: '2025-12-31',
        description: '多智能体协作创新系统——"AI agents that collaborate to spark innovation"。从单工具转向多 Agent 协作的关键转折点。',
        tags: ['Multi-Agent', '协作', '创新'],
        highlight: true,
      },
      {
        name: 'TrendPluse',
        date: '2026-01-02',
        description: 'GitHub 趋势 AI 分析工具。从开源动态中追踪 AI 编程和智能体生态趋势。',
        tags: ['趋势分析', 'GitHub', 'AI'],
      },
      {
        name: 'cc-insights',
        date: '2026-01-08',
        description: 'Claude Code 使用数据分析——可视化、模式发现、智能推荐。围绕 CC 生态构建基础设施。',
        tags: ['CC', '数据分析', '可视化'],
      },
      {
        name: 'Skills_demo',
        date: '2026-01-27',
        description: '基于 Claude Code Skills 的自适应 AI 助手。直接利用 Skills 开放标准构建。',
        tags: ['Skills', 'CC', '自适应'],
      },
      {
        name: 'IssueLab',
        date: '2026-02-02',
        description: '多智能体科研讨论网络——基于 GitHub Issues，支持受控协作区触发跨仓库数字分身协作。与 OpenClaw/Moltbook 理念同源。',
        tags: ['Multi-Agent', '科研', 'GitHub Issues'],
        highlight: true,
      },
      {
        name: 'issuelab-secondme',
        date: '2026-02-12',
        description: 'IssueLab × SecondMe 集成——OAuth 登录、轨迹对话、用户画像、笔记沉淀。',
        tags: ['IssueLab', 'SecondMe', '数字身份'],
      },
    ],
    stageInsight:
      '从做工具转向做 Agent——不只是给 AI 提供能力接口，而是让 AI 成为有自主行为能力的主体。IssueLab 是这一阶段的集大成作。',
    side: 'left',
  },
  {
    id: 'agent-society',
    label: 'Agent 社会构建者',
    period: '2026.03 — 至今',
    theme: '让多个 Agent 组成社会',
    industryContext:
      'OpenClaw + Moltbook 引爆"AI 社交网络"概念。Multi-Agent 系统、数字分身、Agent 社会模拟成为前沿方向。Stanford Generative Agents 论文的思想开始被大规模工程化实现。',
    industryEvents: [
      { date: '2023-04', title: 'Generative Agents 论文', description: 'Stanford HCI：可信的人类行为模拟代理' },
      { date: '2026-02', title: 'Moltbook 病毒传播', description: '"AI 社交网络"概念引发全球关注' },
      { date: '2026-03', title: 'Agent 社会模拟热潮', description: '数字分身、持久记忆、自演化系统成为工程焦点' },
    ],
    projects: [
      {
        name: 'rss2cubox',
        date: '2026-03-03',
        description: 'RSS 同步 + AI 过滤 + Agent 深化分析与全局洞察。',
        tags: ['RSS', 'AI过滤', 'Cubox'],
      },
      {
        name: 'TrumanWorld',
        date: '2026-03-07',
        description:
          '主角项目——多智能体社会模拟系统。"楚门的世界 AI 版"：AI 居民有记忆、会规划、形成关系；你是导演，只能观察和创造条件，不能操控他们的想法。尊重每一个主体的自由意志。这是从 Agent 协作到 Agent 社会的质变。',
        tags: ['Multi-Agent', '社会模拟', '记忆系统', 'Web界面'],
        highlight: true,
        isHero: true,
      },
      {
        name: 'minimax-studio',
        date: '2026-03-24',
        description: 'MiniMax Studio CLI——视频/音频/音乐/拼接全流程工作流。',
        tags: ['MiniMax', 'CLI', '多媒体'],
      },
      {
        name: 'zotero_cli',
        date: '2026-03-30',
        description:
          '为 Claude Code 等 AI Agent 设计的 Zotero 命行工具（Go 语言，v0.0.8，5 个 release）。不是给人用的 CLI，而是给 Agent 用的接口——Agent 可以直接检索文献库、阅读 PDF、管理标注、生成引文。',
        tags: ['Go', 'Zotero', 'AI原生', 'CLI'],
        highlight: true,
      },
      {
        name: 'homebrew-tap',
        date: '2026-03-31',
        description: 'Homebrew Tap，分发自己的 CLI 工具（zotero_cli 等）。',
        tags: ['Homebrew', '分发', 'CLI'],
      },
      {
        name: 'note_wall',
        date: '2026-04-09',
        description: 'Next.js + Supabase + Vercel 在线留言墙。',
        tags: ['Next.js', 'Supabase', 'Vercel'],
      },
      {
        name: 'manim-agent',
        date: '2026-04-10',
        description:
          'AI Agent 数学动画自动生成系统——自然语言输入，端到端产出带配音的 Manim 动画。Agent 不只是处理文本，而是完成完整的创作流程。',
        tags: ['Manim', '数学动画', 'Agent创作', '端到端'],
      },
    ],
    stageInsight:
      'Agent 社会构建者——TrumanWorld 让 Agent 组成有内在动力的社会，manim-agent 让 Agent 完成复杂创作，zotero_cli 为 Agent 提供原生基础设施。从"让 AI 工作"进化到"让 AI 世界自己运转"。',
    side: 'right',
  },
]
