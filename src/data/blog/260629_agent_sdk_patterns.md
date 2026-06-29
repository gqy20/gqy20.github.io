---
id: "260629_agent_sdk_patterns"
title: "我用 Claude Agent SDK 搭了 14 个项目,沉淀出 9 个反复出现的模式"
type: "survey"
date: "2026-06-29"
updated: "2026-06-29"
author: "Qingyu Ge"
category: "AI编程"
tags: ["Claude Agent SDK", "Agent", "架构", "工程实践", "可观测性"]
excerpt: "从 biotools_agent、zotero_cli、cc-insights、manim-agent 到 TrumanWorld、werewolf、IssueLab,两年时间 14 个 Agent 项目反复重写同一个骨架。本文不讲用法教程,讲 9 个跨项目、跨语言、跨框架都会撞上的工程模式——其中 3 个(Schema 即 Prompt、事件总线、Trace/Span)是我最希望自己第一次做 Agent 时就看到的。"
coverImage: "/blog/260629_agent_sdk_patterns.jpg"
published: true
slug: "260629_agent_sdk_patterns"
fullContent: true
---

# 我用 Claude Agent SDK 搭了 14 个项目,沉淀出 9 个反复出现的模式

> 从单一 SDK 调用,到能稳定运行的 Agent 系统,中间隔着 9 个我反复重写过的工程模式。这篇不是 API 文档,是一份「第二次做 Agent 之前希望有人递给我的骨架清单」。

## 1. 背景:为什么不是一篇"用法教程"

打开 Claude Agent SDK 的官方文档,你会看到完整的方法签名、参数说明、几个 working example。然后你照着 example 写完第一个项目,提交,部署,跑通。**然后你开始做第二个项目,发现 60% 的代码是从第一个项目复制过来的。**

这是我 2024 年到 2026 年真实的状态:

- 第一个项目是 `biotools_agent`,照着 SDK 文档把 agent 跑起来,大概 3 天。
- 第二个项目是 `zotero_cli`,想给 AI agent 提供一个能直接调用的 CLI,又花了 3 天 —— 但其中 2 天是在**重新发明 `biotools_agent` 里那个 LLM 抽象层**。
- 第三个项目是 `cc-insights`,分析 Claude Code 历史数据,又花了 2 天把同样的事件系统写了一遍。
- 第四个是 `manim-agent`,端到端视频生成。这一次我没从零写,把 `cc-insights` 的 event store 复制过来,做了 schema 化输出。

到了第 14 个项目 (`werewolf-agents`,多 agent 狼人杀),我已经不再思考"这个项目要用 SDK 的哪个 API",而是直接打开一个 starter 仓库,把 9 个骨架文件复制过去再改业务。**单 SDK 的 API 学一周就够了,跨项目的不变骨架要两年才能看全。**

网上不缺 Claude Agent SDK 的"怎么用"教程,缺的是**"做过 N 个项目后哪些坑是通用的"**那份心法。这篇就是后者。

> 📊 **本文导览**

| 章节 | 主旨 | 阅读时长 |
|------|------|---------|
| **1. 背景** | 为什么写这篇、不是什么 | 3 分钟 |
| **2. 为什么是 Claude Agent SDK** | 框架定位 + 一句话选型依据 | 4 分钟 |
| **3. 模式 1:别直接 import SDK** | LLM 抽象层是第一个分叉口 | 5 分钟 |
| **4. 模式 2:JSON 是一等公民** | Agent 时代 CLI 的 I/O 契约 | 5 分钟 |
| **5. 模式 3:Schema 即 Prompt** | Pydantic `Field(description=)` 双源合一 | 7 分钟 |
| **6. 模式 4:工具设计三原则** | 单一职责 / 幂等 / 可逆 | 5 分钟 |
| **7. 模式 5:多 agent 编排** | fan-out 并行 vs pipeline 串行 | 6 分钟 |
| **8. 模式 6:事件先于功能** | 9-type EventType + JSONL EventStore | 7 分钟 |
| **9. 模式 7:Trace/Span** | OpenTelemetry 风格的可观测上下文 | 6 分钟 |
| **10. 模式 8:配置外置** | dev / CI / Actions 三态共存 | 4 分钟 |
| **11. 模式 9:从项目到飞轮** | agent 产出数据 → 改 agent | 4 分钟 |
| **12. 5 条军规** | 收尾 | 2 分钟 |
| **13. 起步** | 复刻我的最小骨架 | 3 分钟 |

---

## 2. 为什么是 Claude Agent SDK

每次开新项目前,我都会被问:"为什么不直接用 LangGraph / Agno / 自己写 asyncio 编排?"

我**不是没用过**。在 14 个项目里:

- `bx-claim-demo` 用过 **LangGraph**(车险理赔的强流程编排)
- `gene-family-agent` 用过 **Agno**(多 agent 农学分析)
- `TrumanWorld` / `werewolf` / `mind` / `IssueLab` 是**自研**多 agent 编排(asyncio + 自定义 message bus)
- 其他 9 个是 **Claude Agent SDK**

主力放在 SDK,不是因为它最强,而是因为它**最贴我 80% 的项目需求**:

> 💡 **为什么以 SDK 为主力**
> 1. **声明式优先**:`AgentDef(description, prompt, tools, model)` 一个 dataclass 就把 agent 描述清楚,启动时直接 `to_dict()` 喂给 SDK —— 这跟 LangGraph 的「先画图」和 Agno 的「先装配 Team」形成对比
> 2. **工具生态完整**:MCP 一等公民,Claude Code 同源,`@tool` 装饰器写一个函数就是工具,不用关心协议层
> 3. **Hooks 是真的挂上了生命周期**:承接上一篇文章讲的范式迁移(详见 26028 钩子文 §4),SDK 的 `PreToolUse`/`PostToolUse` 是我看过的所有框架里**对 hook 暴露最干净**的
> 4. **流式消息能拿全**:`StreamEvent` 把 thinking、tool_use、tool_result、text 全部结构化吐出来,这是后文 §6 事件总线的物质基础

我**不是说 LangGraph/Agno 不好**。当你有**强流程、强状态机**的需求(LangGraph 擅长),或者**有现成多 agent 模板要复用**(Agno 擅长),它们是更好的选择。**但当你想做的是"让 AI 真的去做一件事",Claude Agent SDK 90% 的情况下是最短路径。**

本文后 9 个模式,**有 6 个框架无关**(在 LangGraph/Agno 里你也能用),有 3 个是 Claude Agent SDK 的特色(模式 3 的 `output_format`、模式 6 的 `StreamEvent`、模式 7 的 SDK 内建 trace ID)。我会标清楚。

---

## 3. 模式 1:别直接 import SDK —— LLM 抽象层是第一个分叉口

我见过的所有"写到一半想重写"的 agent 项目,**几乎都栽在同一个坑**:业务代码里散落着 `import anthropic` 或 `import openai` 或 `from claude_agent_sdk import query, ClaudeAgentOptions`,直接调用 SDK。

为什么不?

- **测试性**:业务逻辑和 SDK 强耦合,unit test 必须 mock SDK,边际成本指数上升
- **可替换性**:某天想从 Claude 切到 Qwen、Ollama、本地模型,要全项目 grep 替换
- **可观测性**:SDK 的错误、retry、token 消耗你看不到,因为调用散在 17 个地方

正确的做法:**在 SDK 之上加一层 LLM 抽象**。`biotools_agent` 里的 `AIAnalyzer`(`ai_analyzer_adapter.py`)就是例子:

```python
# biotools_agent/src/ai_analyzer_adapter.py
class AIAnalyzer:
    """AI分析器统一接口,使用 Claude Code SDK 代理模式"""

    def __init__(self, config_override: dict = None):
        self.config_override = config_override or {}
        self.analyzer = AgentAIAnalyzer(self.config_override)

    def analyze_repository_content(self, repo_path: Path, repo_info, authors):
        # 任何业务方调这一个方法,不知道底下是 SDK 还是 HTTP
        return anyio.run(
            self.analyzer.analyze_repository_content, repo_path, repo_info, authors
        )
```

整个项目里**只有 `AgentAIAnalyzer` 知道 SDK 的存在**。其他 12 个模块只跟 `AIAnalyzer` 打交道 —— 测试时换成一个 stub,生产时切到 SDK,改 model 改到 1 行。

> ⚠️ **第一性原理**:Agent 项目的可维护性,80% 取决于"换 LLM / 换 SDK 的成本"。这一层偷懒,后面所有模式(配置、事件、Trace)的成本都会翻倍。

### 3.1 抽象层的最小契约

不管你用什么语言,LLM 抽象层至少要回答这五个问题:

| 问题 | 抽象层应该提供 |
|------|---------------|
| 我有一个 prompt,给我一个 completion | `complete(prompt, **opts) -> str` |
| 我要流式拿到 token | `stream(prompt) -> Iterator[Token]` |
| 输出要严格符合这个 schema | `complete_with_schema(prompt, schema) -> Model` |
| 我想知道这次调用花了多少钱、几个 token | `UsageReport` 返回对象 |
| 出错了/被 rate limit 了,我要能 retry | 内部封装 retry,业务方不感知 |

5 个问题,5 个方法。看着简单,但你能看到 `manim-agent` 的 `llm_client`、`zotero_cli` 的 backend 层,本质都是这五件事的具体实现。

### 3.2 一个反例:SDK 装饰器在哪儿

> 🔥 **常见错误**:`@claude_tool` 装饰器是不是就把工具注册好了?还需要 LLM 抽象层干嘛?

需要。装饰器解决的是"**工具如何被 SDK 看到**"的问题,LLM 抽象层解决的是"**业务逻辑如何不依赖 SDK**"的问题。两者不是替代关系。

我的项目里通常这样分层:

```
业务模块 (analyze_repo, render_video, query_literature)
        ↓ 调
LLM 抽象层 (AIAnalyzer, CompletionService)    ← 业务只看到这一层
        ↓ 调
SDK 适配层 (ClaudeSDKAdapter, OpenAIAdapter)  ← 唯一允许 import SDK 的地方
        ↓ 调
Claude Agent SDK / OpenAI SDK / 本地模型
```

**5 个项目以后,我会用代码 review 卡死"业务模块里出现 import SDK 直接调用"——这是个简单规则,但挡住的麻烦是指数级的。**

---

## 4. 模式 2:JSON 是一等公民 —— Agent 时代 CLI 的 I/O 契约

如果说模式 1 是"对内"的解耦,模式 2 是"对外"的契约。

`zotero_cli` 是我做的最"硬核"的一个 CLI —— 它**同时面向两种用户**:人类(我自己在终端敲)和 AI agent(Claude Code 自动调)。这两种用户的 I/O 需求完全相反:

| 用户 | 输入偏好 | 输出偏好 |
|------|---------|---------|
| **人类** | 自然语言、模糊关键词 | 表格、彩色、有进度条 |
| **AI agent** | 结构化字段、严格 schema | JSON / YAML,无装饰 |

如果我写两份代码,噩梦。如果我写一份"人类友好"的代码,agent 拿到一堆 ANSI 颜色码要花 30 行代码 strip 掉。

正确做法:**结构化数据是源头,人类友好的渲染是装饰层**。看 `zotero_cli` 的 find 命令怎么做的:

```go
// zotero_cli/internal/cli/parse_args_find.go
type findParsedArgs struct {
    Opts          backend.FindOptions
    JSONOutput    bool      // ←--json
    Snippet       bool      // ←--snippet
    QueryProvided bool
}

func parseFindArgs(args []string) (findParsedArgs, error) {
    for i := 0; i < len(args); i++ {
        switch args[i] {
        case "--json":
            jsonOutput = true
        case "--snippet":
            snippet = true
        // ... 业务参数
        }
    }
}
```

每一条命令都有 `--json` 开关。**默认输出是面向人类的(表格 + 颜色)**,**`--json` 一开,只输出结构化数据**:

```bash
# 人类用
$ zot find "CRISPR" --fulltext
┌─────┬──────────────────────┬────────┬──────┐
│ Key │ Title                │ Year   │ Cite │
├─────┼──────────────────────┼────────┼──────┤
│ A1B │ CRISPR-Cas9 in 2024  │ 2024   │ 142  │
└─────┴──────────────────────┴────────┴──────┘

# Agent 用
$ zot find "CRISPR" --fulltext --json
[
  {"key":"A1B","title":"CRISPR-Cas9 in 2024","year":2024,"citations":142}
]
```

> 💡 **核心设计原则**:面向人类的"漂亮"是**装饰**层,面向 agent 的"可解析"是**契约**层。装饰是给契约加注释,而不是相反。

### 4.1 为什么这模式在 Claude Agent SDK 生态特别重要

Claude Code(以及 Codex、Cursor)读你的 CLI 时,**第一步是把 stdout 喂给 LLM**。如果 stdout 是带 ANSI 颜色码的表格:

1. 你的 CLI 要先去掉颜色码(`strip-ansi`),否则 token 数翻 3 倍
2. LLM 要花额外的 reasoning 理解表格结构,准确性下降
3. 输出的 JSON 经常被表格渲染破坏 —— 你以为 schema 严格,实际上 `--json` 在某个分支没生效

`--json` 一开,这些问题全消失。**`zotero_cli` 的 README 里我把这条放在"AI Agent 集成"小节第一条,所有想用 CLI 接 Claude Code 的项目都该先看这条。**

### 4.2 一对相关 flag:`--snippet` 和 `--fulltext`

为 agent 优化还要做一件事:**给 agent 提供"按需展开"的开关**,而不是一次性把全量数据倒给它。

```bash
# 第一步:只给标题和 key,让 agent 决定读哪些
$ zot find "CRISPR" --json --snippet
[{"key":"A1B","title":"CRISPR-Cas9...","snippet":"gene editing..."}]

# 第二步:agent 选定 key 后,再拉全文
$ zot show A1B --json --fulltext
{"key":"A1B","title":"...","fulltext":"...30 KB..."}
```

这两步的**总 token 比直接 `--full --json` 少一个数量级**。这是 agent 时代的"分页",传统 CLI 不会这么设计。

### 4.3 Skills 文档是对契约的补充

最后说一句:`zotero_cli` 在 `.claude/skills/` 下放了 Skills 文档(自动发现机制),告诉 Claude Code 哪些命令支持 `--json`、哪些支持 `--fulltext`。**CLI 的契约 + Skills 的元数据 = agent 完整可消费。** 这是 SDK 生态的一个隐藏宝藏,后面会单独写一篇。

---

## 5. 模式 3:Schema 即 Prompt —— 让 Pydantic `Field(description=)` 双源合一

这是全文最值钱的模式。**我在 14 个项目里见过无数人写 agent 的时候,把"提示词"和"输出格式"当两件事维护,最后两边对不上,debug 到崩溃。** `manim-agent` 给我看到一个极其优雅的解法,值得所有 agent 项目抄作业。

### 5.1 传统做法:提示词和 schema 两套

大多数 agent 项目的输出结构,长这样:

```python
# 提示词
SYSTEM_PROMPT = """
请分析这个仓库并返回 JSON,格式如下:
{
  "build_spec": {
    "mode": "短模式标签,例如 proof-walkthrough",
    "learning_goal": "单句学习目标",
    "beats": [
      {
        "id": "如 beat_001_intro",
        "title": "人类可读的小节标题",
        "narration_intent": "...",
        "target_duration_seconds": 数字
      }
    ]
  }
}
"""

# 校验
def validate_output(raw_json: str) -> dict:
    return json.loads(raw_json)  # 只能相信 prompt
```

**痛点**:如果 `beats` 字段名改成了 `sections`,提示词要改、schema 要改、文档要改、单元测试要改。**4 个地方,1 个改错就翻车。**

### 5.2 manim-agent 的解法:Field(description=) 一行字当两份用

看 `manim-agent/src/manim_agent/schemas/phase1_planning.py`:

```python
class BuildSpecBeat(BaseModel):
    id: str = Field(description="Stable beat identifier such as beat_001_intro.")
    title: str = Field(description="Human-readable beat title.")
    visual_goal: str = Field(description="Primary visual outcome for this beat.")
    narration_intent: str = Field(description="Short narration intent aligned to this beat only.")
    target_duration_seconds: float = Field(
        ge=0,
        description="Target beat duration in seconds.",
    )
    required_elements: list[str] = Field(
        default_factory=list,
        description="Visual elements that must be present for this beat.",
    )
```

注意每一行 `Field(description=...)`。这一行字,既是:
1. **Pydantic 的字段文档**(给开发者看的)
2. **喂给 SDK 的 JSON Schema 的字段描述**(给 LLM 看的)

怎么做到?因为 Claude Agent SDK 的 `output_format` 参数**直接收 Pydantic 模型**。看 `schemas/__init__.py` 里的注释:

> *"The installed claude_agent_sdk expects the schema at the top-level"*

意思是说:你定义一个 Pydantic 模型,直接传给 SDK,SDK 内部会做两件事:
1. 把模型转成 JSON Schema,作为对 LLM 的输出约束
2. 用 Pydantic 校验 LLM 的输出,失败时自动 retry

**提示词不是手写的,是从 schema 自动生成的。** 这就是"Schema 即 Prompt"。

### 5.3 注册中心:让所有 phase 的 schema 可发现

`manim-agent` 一共 5 个 phase,每个 phase 都有自己的输出 schema。`PhaseSchemaRegistry` 统一管理:

```python
# manim-agent/src/manim_agent/schemas/__init__.py
class PhaseSchemaRegistry:
    _SCHEMAS: dict[str, type[Phase1PlanningOutput | Phase2ScriptDraftOutput | ...]]

    @classmethod
    def output_format_schema(cls, phase: str) -> dict:
        """Get JSON schema for a specific phase (喂给 SDK)."""
        model = cls.get_model(phase)
        return model.model_json_schema()

    @classmethod
    def get_model(cls, phase: str):
        return cls._SCHEMAS[phase]
```

业务代码查这个注册中心就能拿到任何 phase 的 schema,**不用关心 schema 存在哪个文件**。同时这个 schema 既能:
- 喂给 SDK 当 `output_format`
- 在 dispatcher 里做运行时校验
- 在前端用 ajv 校验返回的 JSON
- 在 CI 里做回归测试

> 💡 **核心洞察**:**同一份 schema,被 SDK 用、被前端用、被 CI 用、被文档用、被单元测试用 —— 单一数据源。** 这是 agent 项目的"DRY 终极版"。

### 5.4 反向用法:从 SDK 拿到 schema 后,前端能省一半代码

这个洞察我反复用了 3 个项目:

1. 后端 Pydantic 模型定义了 `BuildSpec`(包含 `beats: list[BuildSpecBeat]`)
2. `BuildSpec.model_json_schema()` 自动生成标准 JSON Schema
3. 前端 TypeScript 直接用 `json-schema-to-typescript` 转成 `.d.ts` 类型
4. 前端 ajv 在运行时校验任何从 API 来的 JSON

**以前:** 前端手写 TS interface,后端手写 Pydantic,后端手写 prompt 提示词,3 份重复代码,改一处要同步 3 处。
**现在:** 后端写一份 Pydantic,3 个地方自动同步,改一处生效 3 处。

`manim-agent` 的 dispatcher 注释里有一句特别精炼的总结:

> *"消费 Claude Agent SDK 消息流,提取结构化信息并输出实时日志。"*

**"提取结构化信息"** —— 这是关键。SDK 给的是 `StreamEvent`,里面嵌着 `ToolUseBlock`、`TextBlock`、`ThinkingBlock`,需要**根据 phase 的 schema 把内容解析成强类型**。`Field(description=)` 让这一步零成本。

### 5.5 这模式的可移植性

Schema 即 Prompt 在 Claude Agent SDK 上是**一等公民**(SDK 的 `output_format` 原生支持)。在 LangGraph / Agno 上**也能用**,但需要自己写一个"把 Pydantic 转成 provider-specific schema"的小适配器 —— 通常 30 行代码搞定,但要做一次。

> 🎯 **判断标准**:如果你的 agent 项目里,提示词和输出 schema 在两个地方维护,**那就是反模式**。无论用什么 SDK,都应该用这个模式把两份合一份。

---

## 6. 模式 4:工具设计三原则 —— 单一职责 / 幂等 / 可逆

`biotools_agent` 上线半年后,我把它的工具集拆过 3 次。前两次拆错了,第三次才稳下来 —— 不是拆得不够细,是拆得不对。拆工具不是"为了解耦而解耦",它有三条硬规则。

### 6.1 单一职责:一个工具做一件事,且只做一件事

第一个项目里我犯的错是给 agent 装"瑞士军刀"工具,比如 `analyze_repo` 一口气返回项目元数据 + 代码质量评分 + 安全扫描结果 + 性能特征。后来想加"只跑安全扫描"的入口,改不动 —— 因为这函数被 4 个调用方依赖。

`biotools_agent` 重构后,工具按"能返回的字段"切分,而不是按"业务场景"切分:

```python
# 错误示范(我自己写的,现在看是反模式)
@tool
def analyze_repo(url: str) -> dict:
    """返回项目的所有维度分析。"""
    return {"meta": ..., "quality": ..., "security": ..., "perf": ...}

# 正确切分
@tool
def get_repo_metadata(url: str) -> RepoMetadata: ...
@tool
def run_security_scan(url: str) -> SecurityReport: ...
@tool
def run_quality_analysis(url: str) -> QualityReport: ...
```

为什么?Agent 决定"我下一步要不要看 security"时,**输入越窄它越准**。给它一个返回 17 个字段的大对象,LLM 经常忘记某个字段存在;给它一个返回 3 个字段的小对象,它每次都看完整。

> 💡 **判断标准**:如果一个工具的 docstring 包含"和"、"以及"、"或者",它大概率违反单一职责。

### 6.2 幂等:Agent 会反复调,工具要能扛住

Agent 跑长任务时,**重复调用是常态**:网络超时重试、Agent 自己 forgot 上下文、人为 retry。`zotero_cli` 的 `add-tag` 工具第一版设计:

```bash
# 第一版:zot add-tag --items K1 --tag "to-read"
# 重复执行:tag 出现多次?数据库报唯一键冲突?Agent 报错?
```

正确做法是 **set semantics**(把 tag 当集合,不重复添加):

```go
// zotero_cli/internal/backend/tags.go (伪代码示意)
func AddTag(items []string, tag string) error {
    for _, item := range items {
        // 用 INSERT ... ON CONFLICT DO NOTHING,确保重复调用安全
        _, err := db.Exec(`
            INSERT INTO item_tags (item_key, tag) VALUES (?, ?)
            ON CONFLICT DO NOTHING
        `, item, tag)
        if err != nil { return err }
    }
    return nil
}
```

调用一次、调用十次,结果一致。**Agent 写错了循环、写了 retry,都不用你担心。**

> ⚠️ **幂等检查清单**:
> - 工具读操作:天然幂等
> - 工具写操作:必须有 `ON CONFLICT` / `WHERE NOT EXISTS` / 版本号检查
> - 工具发外部副作用(发邮件、扣款、调外部 API):**没法幂等就别暴露给 agent**

### 6.3 可逆:写操作默认禁删,版本号乐观锁

最后一条最关键 —— 也是 agent 时代独有的新规则。

传统 API 设计的金科玉律是"CRUD 全开"。但当**调用方是 LLM 而不是人**时,`DELETE` 是定时炸弹。LLM 看到一条记录,觉得它"应该被删",就调了 `DELETE` —— 它不知道这条记录有 7 个外键关联。

`zotero_cli` 的处理是**写操作分层**:
- **读操作**:`find` / `show` / `export` —— 全开,无限制
- **增量写**:`add-tag` / `update` —— 允许,但带版本号乐观锁
- **危险写**:`delete` / `remove-tag` / `move` —— **默认关闭**,需要显式 `--allow-destructive` 才生效

```bash
# 默认拒绝
$ zot remove-tag --items K1 --tag "old"
✗ 拒绝:删除操作需要显式 --allow-destructive 标志
  这是为 AI agent 安全设计的:防止误删

# 显式开启(警告醒目)
$ zot remove-tag --items K1 --tag "old" --allow-destructive
⚠ 警告:此操作不可逆,确认? [y/N] y
✓ done
```

版本号乐观锁的代码模式:

```python
# 伪代码
def update_item(key: str, fields: dict, expected_version: int) -> Result:
    """如果当前 version != expected_version,拒绝更新(避免覆盖并发修改)。"""
    affected = db.execute("""
        UPDATE items SET version = version + 1, fields = ?
        WHERE key = ? AND version = ?
    """, fields, key, expected_version)

    if affected == 0:
        return Result(success=False, error="version_conflict,需要重读")
    return Result(success=True, new_version=expected_version + 1)
```

**Agent 拿到 `version_conflict` 错误,正确的行为是重读 + 重试,不会盲目覆盖**。

> 🔥 **军规**:任何写操作,先问自己三遍:"LLM 调错了我能 undo 吗?Agent 写错了循环我能发现吗?并发跑两个 agent 互相覆盖了我能侦测吗?"任何一个答否,这个工具就不该暴露给 agent。

---

## 7. 模式 5:多 agent 编排的两种姿势 —— fan-out vs pipeline

第 5 个项目之后,我开始做"多 agent"类系统(`TrumanWorld`、`werewolf`、`IssueLab`、`mind`)。**多 agent 编排听起来高大上,实际只有两种基本姿势**,所有项目都是它们的组合或变体。

### 7.1 姿势 A:fan-out 并行 —— Agent 各自独立,主 agent 汇总

典型场景:`TrumanWorld`(小镇多 AI 居民)—— 每个 AI 居民独立思考、独立行动,主 agent 周期性"巡场"汇总状态。

```python
# TrumanWorld 风格(伪代码)
async def tick(self):
    # 1. 广播当前世界状态给所有 agent
    world_state = await self.get_world_state()

    # 2. 并行触发所有 agent 思考
    decisions = await asyncio.gather(*[
        agent.observe_and_decide(world_state)
        for agent in self.agents
    ])

    # 3. 仲裁 + 应用
    for agent, decision in zip(self.agents, decisions):
        if self.arbiter.allows(decision):
            await self.world.apply(agent, decision)
```

**特征**:
- 每个 agent 独立思考,互不调用
- 主 agent 做仲裁(决定哪个 decision 落地)
- 适合"对同一个输入有多个视角"的场景
- **强可扩展**:加 agent 改一行 `gather` 的列表

**Claude Agent SDK 对应物**:`Task` 工具,主 agent 委派子任务给子 agent。

### 7.2 姿势 B:pipeline 串行 —— 上一阶段的输出是下一阶段的输入

典型场景:`manim-agent` 的 5 阶段流水线 —— phase1 规划 → phase2 写代码 → phase3 渲染审查 → phase3.5 旁白 → phase4 TTS → phase5 合成。

```python
# manim-agent 风格
async def run_pipeline(self, user_input: str) -> Video:
    spec = await self.phase1_planning(user_input)         # → BuildSpec
    code = await self.phase2_implementation(spec)          # → RenderedSegments
    review = await self.phase3_render_review(code)         # → FrameAnalysis
    narration = await self.phase3_5_narration(spec, review)
    audio = await self.phase4_tts(narration)               # → AudioFiles
    return await self.phase5_mux([code, audio])            # → FinalVideo
```

**特征**:
- 强顺序:后一步消费前一步的输出
- 每一步有独立的 schema(就是模式 3 的 PhaseSchemaRegistry)
- 适合"流程可拆解、阶段可独立测试"的场景
- **强可测试**:每一步可以 mock 掉前一步的输出单独跑

**Claude Agent SDK 对应物**:`query()` 多次调用,每次用上一轮的 `ResultMessage` 作下一轮的 context。

### 7.3 怎么选:任务独立性 vs 强依赖

| 维度 | fan-out | pipeline |
|------|---------|----------|
| **任务独立性** | 强(每个 agent 独立) | 弱(必须按序) |
| **并行度** | 高(N 倍加速) | 1(没法并) |
| **状态复杂度** | 简单(每 agent 独立) | 复杂(要管中间产物) |
| **debug 难度** | 低(可单跑任一 agent) | 中(需重放上游) |
| **适合场景** | 模拟、评审、并行尝试 | 流程化生产、ETL |
| **典型项目** | TrumanWorld, werewolf | manim-agent, gearbox |

**混合使用是常态**。`manim-agent` 的 phase3 渲染审查里,内部就是 fan-out:同时跑 "美学评估 agent" + "技术正确性 agent" + "可读性 agent",汇总成 `FrameAnalysis`。**外层 pipeline,内层 fan-out** —— 这是经典组合。

### 7.4 SDK 内的"轻量多 agent"

如果你不需要 TrumanWorld 那种强模拟,只想"让一个 agent 委派子任务给另一个",Claude Agent SDK 的 `Task` 工具是**最轻量的解法**:

```python
# SDK 内的委派(伪代码)
@tool
async def delegate_research(topic: str) -> str:
    """把研究任务委派给子 agent。"""
    async for msg in query(
        prompt=f"研究 {topic} 的最新进展,返回 3 条关键信息",
        options=ClaudeAgentOptions(model="haiku")  # 子 agent 用更便宜的模型
    ):
        if isinstance(msg, ResultMessage):
            return msg.result
```

**主 agent 决定何时委派,子 agent 跑独立任务,主 agent 拿结果**。这就是 80% 项目需要的"多 agent",不需要 asyncio.gather 也不需要 message bus。

---

## 8. 模式 6:事件先于功能 —— 9-type EventType + JSONL EventStore

`manim-agent` 上线第 2 周,我加了 `LogViewer` 前端组件,想"实时显示 agent 在做什么"。然后发现:agent 的 `StreamEvent` 流里有 thinking、tool_use、tool_result、text、error 各种类型,**如果直接转发给前端,前端要写一堆 `if/else` 分支,改一个事件类型要同步前后端**。

我**花了 3 天**把整个事件系统重构。重构成什么?

### 8.1 9 个事件类型,1 个枚举,1 个 payload 模型

```python
# manim-agent/src/manim_agent/pipeline_events.py
class EventType(str, Enum):
    LOG = "log"               # 纯文本日志(向后兼容)
    STATUS = "status"           # 任务状态变更
    ERROR = "error"             # 错误
    TOOL_START = "tool_start"     # 工具调用开始
    TOOL_RESULT = "tool_result"   # 工具调用完成
    THINKING = "thinking"         # 思考/推理块
    PROGRESS = "progress"         # 进度(token/轮次/耗时)
    TRACE_SPAN = "trace_span"     # Trace/Span 进入或退出
    PHASE_BOUNDARY = "phase_boundary"  # Phase 边界
```

**9 个不多不少**。少了:会有事件类型被勉强归到 "LOG" 里变模糊;多了:前端 switch case 写到手抽筋。

每个类型有它**专属的 Pydantic payload 模型**:

```python
class ToolStartPayload(BaseModel):
    tool_use_id: str
    name: str                              # Write / Bash / Edit / Read ...
    input_summary: dict[str, Any]

class ToolResultPayload(BaseModel):
    tool_use_id: str                       # ← 配对到 tool_start
    name: str = ""
    is_error: bool = False
    content: Optional[str] = None
    duration_ms: Optional[int] = None      # ← 关键:耗时统计
    error_type: Optional[str] = None       # ← execution / permission / timeout / interrupt

class ProgressPayload(BaseModel):
    turn: int
    total_tokens: int
    tool_uses: int
    elapsed_ms: int
    estimated_cost_cny: Optional[float]    # ← 费用估算
    # ... 各种 token / cost 字段
```

`PipelineEvent` 是**统一的包装**,所有事件都走同一条数据通路:

```python
class PipelineEvent(BaseModel):
    event_id: str
    type: EventType
    timestamp_ms: int
    task_id: str                           # ← 多任务隔离
    phase: Optional[str] = None
    payload: dict[str, Any]                # ← 上面那些 payload 序列化后塞这里
```

> 💡 **核心设计**:**事件类型是封闭枚举,具体 payload 用 dict[str, Any]**。这平衡了"类型安全"(enum 不会拼错)和"灵活扩展"(加新字段不改 enum)。

### 8.2 JSONL append-only 持久化

事件不能只活在内存里 —— agent 跑完一个长任务,前端断开、用户刷新,**所有上下文就丢了**。`manim-agent` 的 `EventStore` 把每个事件追加到 `{task_id}.jsonl` 文件:

```python
# manim-agent/src/manim_agent/event_store.py
class EventStore:
    def __init__(self, store_dir: str | Path = "events"):
        self._store_dir = Path(store_dir)
        self._store_dir.mkdir(parents=True, exist_ok=True)
        self._counts: dict[str, int] = {}
        self._lock = threading.Lock()

    def append(self, task_id: str, event: PipelineEvent) -> None:
        path = self._store_dir / f"{task_id}.jsonl"
        serialized = event.model_dump_json(by_alias=True)
        with self._lock:
            with open(path, "a", encoding="utf-8") as f:
                f.write(serialized + "\n")
            self._counts[task_id] = self._counts.get(task_id, 0) + 1
```

**为什么 JSONL 而不是 SQLite**?
- **append-only** 永远 O(1),不需要事务
- **每行一个事件**,grep 友好(`grep "TOOL_RESULT" events/abc.jsonl | wc -l`)
- **跨语言友好**:任何语言都能读 JSONL,SQLite 还要 driver
- **天然支持 tail**:前端的 LogViewer 用 SSE 或长轮询,服务端 `tail -f` 即可

**3 个项目以后**,我所有 agent 项目都用这个模式。**事件文件**成了 agent 的"事实日志",比 SDK 自己的 transcript 干净 10 倍。

### 8.3 dispatcher:把 SDK 流翻译成内部事件

最后一个关键模块是 dispatcher —— 它消费 SDK 的 `StreamEvent`,翻译成 `PipelineEvent` 推给 EventStore 和 SSE。

```python
# manim-agent/src/manim_agent/dispatcher.py
from claude_agent_sdk import (
    AssistantMessage, StreamEvent, TextBlock,
    ThinkingBlock, ToolUseBlock, ToolResultBlock,
)

async def dispatch_message(self, msg: Message, task_id: str):
    if isinstance(msg, AssistantMessage):
        for block in msg.content:
            if isinstance(block, TextBlock):
                await self.emit(task_id, EventType.LOG, {"text": block.text})
            elif isinstance(block, ThinkingBlock):
                await self.emit(task_id, EventType.THINKING, {
                    "thinking": block.thinking,
                    "preview": block.thinking[:100] + "...",
                })
            elif isinstance(block, ToolUseBlock):
                await self.emit(task_id, EventType.TOOL_START, {
                    "tool_use_id": block.id,
                    "name": block.name,
                    "input_summary": self._summarize(block.input),
                })
            elif isinstance(block, ToolResultBlock):
                await self.emit(task_id, EventType.TOOL_RESULT, {
                    "tool_use_id": block.tool_use_id,
                    "content": self._truncate(block.content, max=2000),
                    "is_error": block.is_error,
                })
```

**dispatcher 之外没有任何模块直接 import SDK 消息类型**。这条边界把"SDK 协议层"和"业务事件层"干净分开。

> 🎯 **这条边界的价值**:**SDK 升级时不破坏业务**。SDK 0.x 升到 1.0,消息格式变了?改 dispatcher 一个文件就完事,业务模块一个字符都不动。

### 8.4 这模式为什么是 Claude Agent SDK 特色

`StreamEvent` 把 thinking、tool_use、tool_result、text 全部结构化吐出来 —— 这是 Claude Agent SDK 相对 LangGraph / Agno 的**最大差异化优势**。其他框架要么只给 final result(没过程可观测),要么要你装额外的 tracing 库。**SDK 协议层 + dispatcher + 9-type 事件 + JSONL 持久化 = 开箱即用的可观测性**。

---

## 9. 模式 7:Trace/Span 让 Agent 透明 —— OpenTelemetry 风格

模式 6 解决了"agent 在做什么"的细粒度可观测。模式 7 解决"**哪些步骤是同一个请求**"和"**调用链长什么样**"的粗粒度可观测。

### 9.1 为什么需要 trace 模型

`manim-agent` 的 pipeline 有 5 个 phase,每个 phase 内部又跑 10+ 个 tool call。**出问题时用户问:"我的视频生成任务卡哪了?"** 如果只有事件流,你看到一个 `TOOL_START: Write` 后面什么都没有 —— 不知道这是 phase2 还是 phase3,不知道是不是 phase1 的计划被搞砸了,不知道根因在哪儿。

`manim-agent` 引入了 OpenTelemetry 风格的 trace/span 模型:

```python
# manim-agent/src/manim_agent/pipeline_trace.py
@dataclass
class TraceSpan:
    trace_id: str                          # ← 整次任务的唯一 ID
    span_id: str = ""
    parent_span_id: Optional[str] = None   # ← 父子关系
    name: str = ""
    phase: Optional[str] = None
    start_ms: int
    end_ms: Optional[int] = None
    status: SpanStatus = SpanStatus.OK      # ok / error / cancelled
    tags: dict[str, Any] = field(default_factory=dict)
```

**关键设计**:
- `trace_id` 整次任务唯一(UUID4)
- `span_id` 单个区间唯一,可嵌套(`parent_span_id` 串成树)
- `start_ms` / `end_ms` / `duration_ms` 自动计算
- `tags` 是开放的 metadata(`{"phase": "phase1_planning", "model": "sonnet"}`)

### 9.2 span_context():让 trace 不打扰业务

手动管 `span.close()` 太烦,`manim-agent` 写了 `span_context()` 上下文管理器:

```python
# 用法
with span_context(trace_id=trace_id, name="phase1_planning", phase="phase1") as span:
    spec = await self.phase1_planning(user_input)
    span.set_tag("beat_count", len(spec.build_spec.beats))
# span 自动 close,自动发射 TRACE_SPAN 事件
```

**背后机制**:基于 `ContextVar` 而不是全局变量,**协程/异步任务安全**:

```python
# pipeline_trace.py
_current_span: contextvars.ContextVar[Optional[TraceSpan]] = ContextVar(
    "current_span", default=None
)

@contextlib.contextmanager
def span_context(trace_id: str, name: str, **tags):
    parent = _current_span.get()
    parent_id = parent.span_id if parent else None

    span = TraceSpan(
        trace_id=trace_id,
        parent_span_id=parent_id,
        name=name,
        tags=tags,
    )
    token = _current_span.set(span)
    try:
        yield span
    except Exception as e:
        span.close(status=SpanStatus.ERROR)
        span.set_tag("error", str(e))
        raise
    finally:
        if span.end_ms is None:
            span.close()
        _current_span.reset(token)
        emit_event(span)  # ← 自动发到 EventStore
```

**上下文管理器内嵌上下文管理器,自动形成父子树**:

```python
with span_context(trace_id=trace, name="phase3_render_review", phase="phase3") as outer:
    with span_context(trace_id=trace, name="aesthetic_check") as inner1:
        ...  # inner1.parent_span_id == outer.span_id
    with span_context(trace_id=trace, name="technical_check") as inner2:
        ...  # inner2.parent_span_id == outer.span_id
```

### 9.3 前端一棵树,后端一棵树

Trace 数据通过 EventStore 持久化,前端 LogViewer 拿到后能渲染成**可折叠的树**:

```
▼ phase1_planning (1.2s, ok)
  ├─ get_repo_metadata (0.3s, ok)
  ├─ ai_analysis (0.8s, ok)
  └─ commit_spec (0.1s, ok)
▼ phase2_implementation (45.6s, ok)
  ├─ write_code (12.3s, ok)
  ├─ render_segment_1 (8.4s, ok)
  └─ render_segment_2 (9.1s, ok)
▶ phase3_render_review (in progress)
```

**用户问"卡哪儿了"**,看树就知道:phase3 在跑,前两个 phase 都 ok,**问题在 phase3 内部**,继续点开 phase3 树。

### 9.4 跟上一篇文章的关系

这个 trace 模型跟 26028 钩子文讲的 `PreToolUse` / `PostToolUse` 是**互补的**:
- **钩子**(26028) → 拦截/改写 SDK 行为
- **Trace**(本篇) → 观测 SDK 行为

`manim-agent` 的钩子层(详见 `hooks.py`)就是从 `claude_agent_sdk.types` 导入 `PreToolUseHookSpecificOutput` 等,**配合 trace 一起工作**:钩子拦截到危险命令时,既 deny SDK,又发一个 `TRACE_SPAN` 事件(`status=ERROR, tags={"reason": "dangerous_command"}`)。**这是 SDK 给的"组合拳"**,大部分框架没有这么干净的对接。

---

## 10. 模式 8:配置外置 + 环境矩阵

第 7 个项目以后,我把所有 agent 项目的配置分成三层,跨项目复用:

### 10.1 三层配置

```python
# biotools_agent/src/config.py
class AppConfig:
    # 第 1 层:硬编码默认值(代码里)
    DEFAULT_MODEL = "sonnet"
    DEFAULT_MAX_TOKENS = 4096
    DEFAULT_TIMEOUT_S = 120

    # 第 2 层:env.example 模板(给开发者看的)
    # ANTHROPIC_API_KEY=
    # MODELSCOPE_API_KEY=
    # SUPABASE_URL=
    # SUPABASE_ANON_KEY=

    # 第 3 层:.env 文件(实际运行值,不进 git)
```

**为什么三层**?
- 第 1 层让代码"开箱即用",新人 clone 下来能跑
- 第 2 层让"应该配置什么"显式可见,新人不会漏
- 第 3 层让"实际值"隔离,不会泄漏到 git

### 10.2 三种运行环境

`biotools_agent` 的同一份代码跑在三种环境里,行为略有不同:

| 环境 | 触发 | 输出方式 | 模型 | 备注 |
|------|------|---------|------|------|
| **本地开发** | `biotools-agent analyze <url>` | 本地 HTML/MD/JSON | `sonnet` | 实时打印进度 |
| **GitHub Actions** | `workflow_dispatch` 触发 | 上传 Artifacts | `haiku` | 节省成本,批量跑 |
| **CI 测试** | `npm test` / `pytest` | 不调 LLM,只跑单测 | — | mock 掉 AIAnalyzer |

**关键代码**:

```python
# biotools_agent/src/main.py
def analyze(repo_url: str, ..., env_file: Optional[str] = None):
    if env_file:
        config = ConfigManager(env_file)
    else:
        config = config_manager
    # ... 用 config 跑后续流程
```

**在 GitHub Actions workflow 里**(`biotools-analysis.yml`):

```yaml
- name: Run analysis
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
    MODELSCOPE_API_KEY: ${{ secrets.MODELSCOPE_API_KEY }}
    SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  run: |
    biotools-agent analyze ${{ inputs.repo_url }} --output ./report
```

**在单测里**:

```python
# tests/test_github_analyzer.py
def test_github_analyzer(monkeypatch):
    # mock 掉 AIAnalyzer,不让它真调 LLM
    monkeypatch.setattr(ai_analyzer_adapter, "AIAnalyzer", MockAnalyzer)
    ...
```

**5 个项目以后**,我的标准 starter 模板里这三种环境配置是 default include 的。**新项目第一周就在正确轨道上,不会"我本地能跑 CI 挂了"反复重写。**

### 10.3 一句话:配置跟随代码,但 values 跟随环境

> 🎯 **军规延伸**:`.env.example` 跟随代码 commit,`.env` 永远不进 git,**环境之间的差异(模型/超时/批量)显式写在 config 而不是散在 if 分支里**。

---

## 11. 模式 9:从项目到飞轮 —— Agent 自己改 Agent

最后一个模式,也是最难落地的。**前 8 个模式是让一个项目"稳定运行"。模式 9 是让多个项目之间形成正反馈飞轮。**

### 11.1 gearbox 的设计思想

`gearbox` 是我 2025 年初做的项目,核心想法:

```
                    ┌──────────────┐
                    │              │
                    ↓              │
       GitHub Issue/PR  →  Agent 跑数据
                    │              │
                    ↓              │
              训练数据 / 反馈信号  │
                    │              │
                    ↓              │
              改进 Agent 本身  ────┘
```

**agent 的运行数据**(成功的 PR、失败的 review、用户反馈)回流成训练数据,**改 agent 本身**。这是 OpenAI Devin / Claude Code / Codex 这类 AI Coding 工具的**隐藏的护城河** —— 不只是模型强,是数据飞轮强。

### 11.2 在我的项目里,这模式怎么落地

不是每个项目都需要完整飞轮。但**简化的飞轮**任何项目都能做:

**环节 1:留痕**
- `cc-insights` 收集 Claude Code 的所有 tool call,做成本/质量分析 → **数据留下来**
- `biotools_agent` 把每次分析结果存 Supabase → **领域数据留下来**
- `manim-agent` 的 EventStore 存所有 pipeline 事件 → **过程数据留下来**

**环节 2:分析**
- `cc-insights` 的输出本身就是分析报告
- `biotools_agent` 可以看"哪些类型的项目分析质量差" → 识别模型弱点
- `manim-agent` 可以看"哪个 phase 最常 timeout" → 识别工程瓶颈

**环节 3:反馈**
- 把分析结论**写进 agent 的 prompt**(`biotools_agent` 实际有根据反馈微调过 `BIOTOOLS_ANALYZER_AGENT` 的 prompt)
- 把分析结论**写进工具集**(`zotero_cli` 早期没有 `find --fulltext`,从用户使用模式里发现需求才加的)

**环节 4:循环**
- agent 跑新数据 → 产生新留痕 → 新分析 → 新反馈 → agent 更好

### 11.3 飞轮的最小可行实现

如果你刚开始一个新项目,**第一天就做这两件事**:
1. **每个 agent 运行都生成 event log**(就是模式 6)
2. **每周花 1 小时看 event log**,找规律

> 🔥 **大多数 agent 项目死在第 6 个月,不是因为模型不行,而是因为开发者从来没看过自己 agent 的运行数据。** 你不观察它,它就观察不了你,改进无从谈起。

---

## 12. 5 条军规

写完 9 个模式,最后压舱的 5 条军规。这 5 条不是从框架里推出来的,是从 14 个项目里**踩坑踩出来**的:

> **1. Agent 的每个决策点都要可观测。**
> LLM 决定调哪个工具、传什么参数、放弃还是继续 —— 这些决策**不能只活在 LLM 的 context 里**。模式 6 + 7 是在做这件事。
>
> **2. 任何写操作都要可逆或可审。**
> Agent 写文件、调 API、改数据库 —— 写之前想清楚能不能 undo,不能 undo 就要留 audit log(谁、何时、什么内容、为什么)。模式 4.3 是在做这件事。
>
> **3. 工具宁可少而精,不要多而杂。**
> 17 个返回大对象的工具,LLM 永远学不会用;3 个返回窄对象的工具,LLM 第一次就懂。**每加一个工具,你都在替 LLM 加重上下文负担**。模式 4.1 是在做这件事。
>
> **4. 配置文件跟随代码,不要反过来。**
> 代码改了配置不改,12 个环境里 11 个跑挂 —— 这是 agent 项目的头号杀手。模式 8 是在做这件事。
>
> **5. 把"用户"和"Agent"当成两个独立消费者。**
> 同一段输出,人类要好看、Agent 要好解析。**默认输出给人类,`--json` 给 agent**。模式 2 是在做这件事。

**14 个项目里,这 5 条我至少在 8 个项目里违反过,每次违反都付出 2-3 周代价**。如果你只能记住一件事,记住第 1 条:**没观测,就没改进。**

---

## 13. 起步:复刻我的最小骨架

如果你想从零开始一个 agent 项目,这是我 14 个项目沉淀出来的**最小可工作骨架**(9 个模式各对应 1-2 个文件):

```
my-agent-project/
├── src/
│   ├── llm/                  # 模式 1:LLM 抽象层
│   │   ├── adapter.py         #   - 唯一允许 import SDK 的地方
│   │   └── __init__.py        #   - 对外暴露统一接口
│   ├── tools/                 # 模式 4:工具集
│   │   └── *.py               #   - 每个文件一个工具
│   ├── schemas/               # 模式 3:结构化输出
│   │   ├── __init__.py        #   - SchemaRegistry 统一查找
│   │   └── phase1_output.py   #   - Field(description=) 双源合一
│   ├── events/                # 模式 6:事件总线
│   │   ├── event_types.py     #   - EventType 枚举 + payload 模型
│   │   ├── event_store.py     #   - JSONL append-only
│   │   └── dispatcher.py      #   - SDK 消息 → 内部事件
│   ├── trace/                 # 模式 7:Trace/Span
│   │   └── span.py            #   - span_context() + ContextVar
│   ├── pipeline/              # 模式 5:多 agent 编排
│   │   └── orchestrator.py    #   - fan-out / pipeline 实现
│   ├── cli/                   # 模式 2:JSON-first CLI
│   │   └── main.py            #   - 所有命令支持 --json
│   └── config.py              # 模式 8:配置
├── .env.example               #   - 三层配置
├── tests/
│   └── test_*.py              #   - mock LLM 抽象层,只测业务
└── README.md
```

**约 1500-2000 行代码,这就是 14 个项目里我**反复复用**的最小骨架。**

### 起步路径

如果你想动手,推荐这个顺序(我带新人的标准流程):

1. **第 1 天**:搭 `llm/adapter.py` + 一个最简单的 `claude_agent_sdk.query()` 调用,跑通 hello world
2. **第 2 天**:加 `events/event_types.py` + `event_store.py`,把第 1 天的调用包成事件
3. **第 3 天**:加 `schemas/`,做一个 `Field(description=)` 模型 + `output_format` 参数,让 LLM 输出受 schema 约束
4. **第 4 天**:加 `trace/span.py`,用 `span_context()` 包住第 3 天的逻辑
5. **第 5 天**:加 `cli/main.py`,写一个命令支持 `--json`
6. **第 6-7 天**:加第一个 `tools/*.py`,把它接到 CLI
7. **第 2 周开始**:加 `pipeline/orchestrator.py`,做多阶段/多 agent
8. **第 2 周后**:看 event log,找改进点,启动飞轮(模式 9)

**7 天一个最小可工作 demo,2 周一个可投产的 v0.1。** 这套节奏我在 4 个项目上验证过。

### 起步骨架的开源计划

我会把这套骨架抽成一个独立的 starter repo,叫 `agent-starter`(暂定名),预计 7 月初开源。届时本文会更新链接。**如果你想第一时间收到通知,RSS 订阅就是最简单的方式**(本站已上线 RSS,详见 [从 git hooks 到 Claude Code hooks 的范式迁移](/blog/260628_git_claude_hooks) 一文末尾)。

---

## 参考链接

**本文涉及的 14 个 Agent 项目**

| 项目 | 模式 | 一句话 |
|------|------|--------|
| [`biotools_agent`](https://github.com/gqy20/biotools_agent) | 1、3、4、8 | 生物信息仓库深度分析,声明式 agent + LLM 抽象层典范 |
| [`zotero_cli`](https://github.com/gqy20/zotero_cli) | 2 | AI 原生 Zotero CLI,`--json` 一等公民 + Skills 自动发现 |
| [`manim-agent`](https://github.com/gqy20/manim-agent) | 3、6、7、5 | 端到端视频生成,5 阶段 pipeline + EventStore + TraceSpan |
| [`cc-insights`](https://github.com/gqy20/cc-insights) | 6、7 | Claude Code 使用诊断,事件流分析 + 本地 Dashboard |
| [`TrumanWorld`](https://github.com/gqy20/TrumanWorld) | 5 | AI 居民小镇,fan-out 风格多 agent 模拟 |
| [`werewolf`](https://github.com/gqy20/werewolf) | 5 | Claude Code 狼人杀 GM,跨实例编排 |
| [`werewolf-agents`](https://github.com/gqy20/werewolf-agents) | 5 | TypeScript 版多 agent 狼人杀 |
| [`IssueLab`](https://github.com/gqy20/IssueLab) | 5 | GitHub Issues 多智能体科研讨论网络 |
| [`mind`](https://github.com/gqy20/mind) | 5 | AI agents 协作创新 |
| [`gearbox`](https://github.com/gqy20/gearbox) | 9 | GitHub 仓库自动化飞轮系统 |
| [`bx-claim-demo`](https://github.com/gqy20/bx-claim-demo) | §2 对照 | LangGraph + FastAPI 车险理赔(框架对照) |
| [`gene-family-agent`](https://github.com/gqy20/gene-family-agent) | §2 对照 | Agno 框架农学基因家族分析(框架对照) |
| [`cc_plugins`](https://github.com/gqy20/cc_plugins) | 钩子 | Claude Code 插件集合(模式 6 钩子) |
| [`Skills_demo`](https://github.com/gqy20/Skills_demo) | §2 | Claude Code Skills 演示 |

**关联阅读**

- [从 git hooks 到 Claude Code hooks 的范式迁移](/blog/260628_git_claude_hooks) —— 模式 6/7 钩子部分的前置知识
- [2026 开源知识库 RAG 方案深度调研](/blog/260627_rag_kb_survey) —— 14 个项目里 8 个用到了 RAG,选型逻辑见此文

**外部参考**

- [Claude Agent SDK 官方文档](https://docs.claude.com/en/api/agent-sdk/overview) —— API 真相之源
- [OpenTelemetry Trace/Span 模型](https://opentelemetry.io/docs/concepts/signals/traces/) —— 模式 7 的设计参照
- [Pydantic Field](https://docs.pydantic.dev/latest/concepts/fields/) —— 模式 3 的双源合一基石
- [本文 RSS / Atom feed](/rss.xml) —— 后续 `agent-starter` 开源时第一时间通知
