const portfolioConfig = {
  tracks: [
    { id: 'all', label: '全部项目', shortLabel: '全部' },
    { id: 'featured', label: '代表系统', shortLabel: '代表' },
    { id: 'agent-systems', label: '智能体系统', shortLabel: '智能体' },
    { id: 'tool-interfaces', label: '工具接口', shortLabel: '接口' },
    { id: 'knowledge-work', label: '知识工作', shortLabel: '知识' },
    { id: 'automation', label: '自动化流程', shortLabel: '自动化' },
    { id: 'ai-devtools', label: 'AI 开发工具', shortLabel: '开发工具' },
    { id: 'domain-tools', label: '领域应用', shortLabel: '领域' }
  ],
  featured: ['TrumanWorld', 'zotero_cli', 'TrendPluse', 'IssueLab'],
  fallbackTrackByCategory: {
    MCP工具: 'tool-interfaces',
    AI应用: 'agent-systems',
    科研工具: 'knowledge-work',
    Web开发: 'automation',
    开发工具: 'ai-devtools',
    个人项目: 'automation'
  },
  projects: {
    TrumanWorld: {
      track: 'agent-systems',
      narrative: {
        title: '一个有记忆的 AI 小镇',
        summary: '居民会记住经历、规划行动、形成关系；观察者只能改变环境，不能直接操控想法。',
        problem: '单次聊天很难体现长期记忆、关系变化和环境演化。',
        built: ['记忆循环', '计划流程', '角色互动', '观察者机制', 'Web 界面'],
        aiRole: 'AI 居民根据记忆和环境生成行动，而不是被用户直接操控。'
      }
    },
    zotero_cli: {
      track: 'knowledge-work',
      narrative: {
        title: '让智能体操作真实文献库',
        summary: 'Claude Code 和 Codex 可以检索 Zotero、阅读 PDF、管理标注并生成引用。',
        problem: '知识工作不能停留在回答问题，智能体需要进入真实资料库。',
        built: ['Go CLI', 'Zotero 接口', 'PDF 阅读流程', '引用生成'],
        aiRole: 'AI 通过命令行接口读取、整理和复用文献上下文。'
      }
    },
    TrendPluse: {
      track: 'automation',
      narrative: {
        title: '捕捉 AI 生态趋势',
        summary: '从 GitHub 动态中追踪 AI 编程和智能体生态，用模型生成结构化洞察。',
        problem: '开源生态变化太快，需要持续采集、过滤和总结信号。',
        built: ['采集流程', '模型分析', '趋势报告', '自动更新'],
        aiRole: 'AI 从项目动态中提取趋势、归纳变化并生成报告。'
      }
    },
    IssueLab: {
      track: 'agent-systems',
      narrative: {
        title: '用 Issue 组织多智能体讨论',
        summary: '把观点交锋、数字分身和异步协作放进 GitHub Issues 的可追踪环境。',
        problem: '多智能体协作需要留下过程，而不是只输出最终结论。',
        built: ['讨论流程', '角色设定', '协作记录', 'GitHub Issues 接口'],
        aiRole: 'AI 以不同角色参与讨论，并把观点演化保留下来。'
      }
    },
    'article-mcp': {
      track: 'tool-interfaces',
      narrative: {
        title: '让智能体检索论文',
        summary: '把文献检索封装成 MCP 工具，让智能体稳定获取论文、摘要和全文上下文。',
        problem: '智能体需要可靠访问文献库，而不是依赖一次性搜索结果。',
        built: ['MCP Server', '文献检索', '摘要获取', 'PyPI 分发'],
        aiRole: 'AI 通过工具接口获取研究上下文，并把检索结果带回工作流。'
      }
    },
    mind: { track: 'agent-systems' },
    'manim-agent': { track: 'automation' },
    'crawl-mcp': { track: 'tool-interfaces' },
    mcp_agent: { track: 'tool-interfaces' },
    pdfget: { track: 'knowledge-work' },
    SLAIS: { track: 'knowledge-work' },
    pub2tts: { track: 'knowledge-work' },
    rss2cubox: { track: 'automation' },
    'cc-insights': { track: 'ai-devtools' },
    Skills_demo: { track: 'ai-devtools' },
    cc_plugins: { track: 'ai-devtools' },
    biotools_agent: { track: 'ai-devtools' },
    'genome-mcp': { track: 'domain-tools' },
    'protein-mcp': { track: 'domain-tools' },
    astro_light_pollution: { track: 'domain-tools' },
    'minimax-studio': { track: 'automation' },
    justdo: { track: 'automation' },
    flywheel: { track: 'automation' },
    'quick-py': { track: 'ai-devtools' }
  }
}

export default portfolioConfig
