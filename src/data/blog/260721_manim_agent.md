---
id: "260721_manim_agent"
title: '打造 AI 数学科普视频生成系统——"智绘科普"项目拆解'
type: "tutorial"
date: "2026-07-21"
updated: "2026-07-21"
author: "Qingyu Ge"
category: "AI编程"
tags: ["Manim", "Claude Agent SDK", "Agent Pipeline", "质量门控", "教育科技"]
excerpt: "从自然语言到带配音的数学动画，完整拆解智绘科普如何通过分阶段 Agent 编排、结构化脚本、Manim 渲染、质量门控、错误自愈和全链路可观测，把不稳定的 AI 生成过程变成可编辑、可验证、可复用的教学视频流水线。"
coverImage: ""
published: true
slug: "260721_manim_agent"
fullContent: false
---

# 打造 AI 数学科普视频生成系统——"智绘科普"项目拆解

> 在线演示：[https://manim.gqy20.top](https://manim.gqy20.top)
> 源码仓库：[https://github.com/gqy20/manim-agent](https://github.com/gqy20/manim-agent)
> 项目版本：manim-agent（Claude Agent SDK + Manim CE + FastAPI + Next.js + PostgreSQL）
> 截图均来自 `https://manim.gqy20.top/tasks/ebb4acfb`（已完成任务：抛物线与二次函数，60s 高清，已配音）。

---

## 1. 定义问题

生成式人工智能降低了内容创作的门槛。从文本生成、图像生成到视频生成，大模型刷新着人们对创作效率的认知。我们想象着让老师们轻松地指挥课本中的知识动起来，把知识点变成有趣的视频，让学生们更好地吸收知识。然而在真实教育场景中，"AI 能生成视频"并不意味着"老师能够用 AI 教学"。

对于数学、物理等数理学科而言，知识表达具有较强的逻辑性和严谨性。课堂上的教学内容不仅要求动画效果美观，更要求知识点准确、推导过程完整、表达节奏符合教学规律。相比娱乐内容追求的新颖性和随机性，教育内容更加需要稳定性、可控性和可复用性。

正是在这样的思考下，"智绘科普"项目团队希望借助大语言模型降低数理科普视频的制作门槛，让教师、学生以及科普创作者能够更加便捷地制作高质量的教学动画。最终，该项目参加首届"小有可为"AI 开源公益挑战赛，并获得"点亮乡村课堂"赛题一等奖。

与传统 AI 视频生成产品不同，团队没有将目标定位为"一键生成视频"，而是希望交付完整的创作过程，包括教学脚本、Manim 动画源码以及最终视频。这样的设计使生成结果具有良好的可编辑性和可维护性，也更加符合教育场景对于内容准确性和可持续迭代的需求。

整个系统采用"大语言模型 + Manim"的技术路线。首先利用大语言模型完成教学脚本生成，再进一步生成符合 Manim 规范的 Python 代码，最后由 Manim 渲染生成数学动画视频，实现从自然语言到教学视频的自动化创作流程。

---

## 2. 整体技术架构

**核心思想是：Agent 编排流水线，Manim 落地动画**。大模型作为 Agent 的"思考内核"被调用，不直接面向用户；Manim 作为 Agent 的"执行工具"被编排，不靠人手动运行。整体工作流：用户输入知识主题 → 规划 Agent 生成 build_spec → 草稿 Agent 写 scene.py → 实现 Agent 跑渲染 + 自检 → 审查 Agent 跑视觉与时序门控 → 合成 Agent 出视频 + 源码 + 脚本。

**为什么不是别的走法？** 三种常被考虑的方案我们都走过、都验证过：

| 走法 | 失败方式 |
|---|---|
| 直接 LLM 一把梭（"一锅出"教学视频） | 失败时不知道哪步出问题，重试要全部重做；同一段脚本跑三次结果不同，可复现性极差 |
| 文生视频模型（类 Sora / Veo） | 一次出片、不可编辑；数学符号常常出错（"勾股定理"打成"勾谷定理"），且无法定位错在哪一帧 |
| 人工流水线（老师 + Manim 工程师协作） | 一个 60s 视频要 2–3 天，产能完全撑不起"乡村课堂"的规模 |

本项目走的是 **Agent 分阶段 + 门控 + 自检 + 可观测**：每一阶段的中间产物（`build_spec / scene.py / 渲染产物 / 审查报告`）都可检查、可修改、可复用；任一阶段失败只需重跑该阶段，失败原因在 debug 视图里可逐字段对照。

**整体架构分四层**：

| 层级 | 职责 | 关键技术 |
|---|---|---|
| 用户层 | 任务提交 / 进度查看 / 产物下载 / Debug 视图 | Next.js 16 + React 19 + Tailwind 4 |
| 编排层 | 任务调度 / 阶段门控 / 错误恢复 / 可观测 | FastAPI + Claude Agent SDK + 8 个 skills |
| 工具层 | 内容生成 / Manim 渲染 / 视觉审查 / 配音合成 | Manim CE + ffmpeg + Qwen3.5-397B-A17B + TTS |
| 数据层 | 任务持久化 / 中间产物落盘 / 视频存储 | PostgreSQL (Neon) + Cloudflare R2 |

![图 2-1 整体技术架构：6 阶段 Agent 编排 + Quality Gate / Repair Retry / Observability 横切关注](/blog/260721_manim_agent_11.png)

---

## 3. 搭建流程

本章分两步走：先把开发工具（3.1）和环境（3.2）装好，再按 3.3–3.5 三阶段把流水线跑通——3.3 把用户输入拆成 `build_spec` JSON，3.4 翻译成 `scene.py`，3.5 跑 Manim 渲染 + 三道质量门；每一步给出可复现的输入、产物与门控判据，照着走完即可跑通基础版本。

---

### 3.1 开发工具：Qoder
开发本项目的过程中，我们也用 **Qoder**（[qoder.com](https://qoder.com/zh)）做过一些辅助工作。Qoder 是一个"智能体编程平台"（[官网](https://qoder.com/zh)），有 Desktop、JetBrains 插件、CLI、Mobile 等多种形态。

本项目里比较顺手的一个用法是：让 Qoder 起后端 `uvicorn backend.main:app --port 8471` 和前端 `pnpm dev --port 3147`，再让它接管浏览器去点 `/tasks/{id}` 的 Logs / Code 标签、`/debug` 切到 2B phase 看 system prompt——相当于让 Agent 把"启动服务 + 操作浏览器 + 看日志/代码/调试视图"这一整条调试链路串起来，开发者只负责追问"为什么这一行 ERR"。

> 文档不展开介绍，感兴趣直接看 [qoder.com/zh](https://qoder.com/zh) 即可。

![图 3-1 Qoder 官网首页](/blog/260721_manim_agent_10.png)

---

### 3.2 环境准备
部署过程以「最小可运行」为目标，三步即可启动：

**1. 系统与运行时**
- Python ≥ 3.12（详见 `.python-version`）
- [Manim Community Edition](https://www.manim.community/) ≥ 0.20.1
- FFmpeg（需在 `PATH` 中可用，Manim 调它合成 mp4）

**2. 依赖与启动**
```bash
git clone https://github.com/gqy20/manim-agent.git && cd manim-agent
uv sync --group dev
uv pip install -e .
make install         # 同时安装前端 Node 依赖
```
也可用传统 `pip install -e ".[dev]"`。Makefile 把后端、前端、测试、lint、清理统一到 `make dev-backend / dev-frontend / test / lint / clean`。

**3. 关键环境变量**
| 变量 | 用途 |
|---|---|
| `ANTHROPIC_API_KEY` | 通过 `claude_agent_sdk` 注入到子进程 |
| `DATABASE_URL` | PostgreSQL（任务持久化，Neon） |
| `R2_*` | Cloudflare R2 上传（可选，`storage/r2_client.py`） |
| `MANIM_AGENT_TEST_MODE=1` | Pipeline inline 执行（仅供测试） |
| `NEXTJS_HOST` / `NEXT_PORT` | Next.js 开发代理地址 |

> **语言模型选型**：本项目运行时调用的语言模型是魔搭社区（[modelscope.cn](https://www.modelscope.cn)）上的 **Qwen/Qwen3.5-397B-A17B**，由模型提供方通过 Anthropic API 兼容网关接入 `claude_agent_sdk`。

**4. 平台兼容提示**
- Windows + Python 3.13 下，子进程需绕开默认 ProactorEventLoop 的兼容性坑位。代码侧已用「独立线程 + 独立 asyncio loop」封装（见 `src/manim_agent/pipeline.py` 与 `AGENTS.md`），使用方无需额外配置。
- 启动顺序：`make dev-backend`（FastAPI: 127.0.0.1:8471）→ `make dev-frontend`（Next.js: localhost:3147）。端口冲突可临时切换 `make dev-frontend FE_PORT=3148`。

---

### 3.3 教学脚本生成
这一步用大语言模型做知识内容的结构化整理。用户输入希望讲解的知识点（牛顿第一定律、勾股定理证明等），模型先生成一份符合教学逻辑的课程脚本，包括教学目标、知识点拆解、动画描述、旁白内容以及每一步动画对应的讲解节奏。

这样的设计主要有两个原因。一是模型直接生成代码容易出现结构混乱的问题，而先生成脚本能够帮助模型建立完整的知识表达框架。二是脚本本身也是一种重要的中间产物，教师可以直接修改脚本，再重新生成动画，提高整个系统的可编辑性。

**脚本的最终形态：结构化 `build_spec`，不是自由文本**

脚本阶段唯一的合法产出是一段 JSON（落地为 `backend/output/{task_id}/phase1_planning.json`），由 `PLANNING_SYSTEM_PROMPT` + Pydantic schema 双重约束。结构如下：

```json
{
  "mode": "concept-explainer",
  "learning_goal": "通过视觉化动画直观理解二次函数 y = ax²+bx+c 的图像——抛物线的形状、参数影响及几何特征。",
  "audience": "初中/高中数学初学者",
  "target_duration_seconds": 60,
  "beats": [
    {
      "id": "beat_001_intro",
      "title": "从最简形式出发",
      "visual_goal": "在坐标系中绘制标准抛物线 y = x²，用描点或平滑曲线方式呈现优美的 U 形曲线",
      "narration_intent": "介绍二次函数的最基本形式 y = x²，它的图像叫做抛物线，像一座对称的山谷",
      "target_duration_seconds": 10.0,
      "required_elements": ["笛卡尔坐标系", "y = x² 抛物线曲线", "原点和对称轴标注"],
      "segment_required": true
    }
    // ... 3–6 个 beat
  ]
}
```

7 个固定键（`id / title / visual_goal / narration_intent / target_duration_seconds / required_elements / segment_required`）写死在 `prompts.py` 与 `PHASE2_SCRIPT_DRAFT_SYSTEM_PROMPT` 里，模型必须严格按 schema 输出。这样做的好处：

- **可校验**：自由文本没法做严格匹配，结构化 JSON 可以直接 Pydantic 解析，字段缺失/类型错误立刻报错。
- **可复用**：JSON 本身就是 Phase 2A 脚本草稿、Phase 2B 实现、Phase 3.5 解说文案、Phase 4 音频编排的共同输入源，所有下游环节共用同一份 build_spec，不会出现"脚本说一套、代码写一套"。
- **可回放**：debug 视图里直接显示该 JSON，调 prompt 时方便逐字段对照。

**beats 是脚本的最小单元**

默认 **3–6 个 beat**，每个 beat 只承载一个新教学点。例如"抛物线"任务的 5 个 beat 是：① 最简形式 ② 系数 a 控制开口 ③ b/c 的平移 ④ 顶点 ⑤ 综合——彼此递进，不重复。每个 beat 的 `target_duration_seconds` 之和应接近 `target_duration_seconds`（允许 ±2s 的容差）。

**脚本 → 代码的边界**

脚本阶段**只决定"讲什么、按什么节奏讲、每个 beat 想要什么视觉"**，**不写 Manim 代码**。具体边界：

| 脚本负责 | 留给 3.4 动画代码生成 |
|---|---|
| `visual_goal`：这个 beat 想呈现什么视觉 | 实际 Manim mobject 选型与编排 |
| `narration_intent`：想讲什么 | 旁白文案细化（由 Phase 3.5 NARRATION_SYSTEM_PROMPT 接管） |
| `target_duration_seconds`：时长目标 | 显式 `run_time + wait` 时序（3.4 的时序门控 80%/60%） |
| `required_elements`：必须出现哪些元素 | 元素怎么动画、用什么组件库 |
| `segment_required`：是否需要独立视频段 | 是否需要按 beat 切分渲染 |

`PLANNING_SYSTEM_PROMPT` 在 prompt 里**显式禁止**模型写代码、编辑文件、运行 shell——这层硬隔离让脚本阶段永远不会越界。

**脚本阶段的质量门**

- **结构门**：`pipeline_gates.apply_phase2_build_spec_defaults` 校验必填字段；`phase1_planning.json` 必须通过 Pydantic 校验后才能进入 3.4。
- **数量门**：beats 数量 3–6，超出会要求合并、过少会要求拆分。
- **可执行门**：每个 beat 的 `visual_goal` 必须能在 Manim CE 里实现——若 LLM 写出"3D 全息交互"这种 Manim 不支持的内容，`phase1_validation` 会拒绝，让模型重写。

**对教师友好的可编辑性**

build_spec 是 JSON，也是 `.json` 文件。教师想改"把第 3 个 beat 的时长从 14s 改成 18s"或者"把第 5 个 beat 的视觉目标换成另一种呈现"，直接编辑 `phase1_planning.json` 然后点重跑就行，不需要再调模型。Phase 3.5 解说文案、Phase 4 音频编排也都基于这个 JSON 派生，编辑一处、全链路同步。

> 脚本阶段是整个流水线里"最像产品而不是工程"的一环——它把 LLM 的自由发挥压缩到一个可校验、可编辑、可复用的结构化形态，下游所有环节才有共同语言。

---

### 3.4 动画代码生成
代码生成不是「让模型自由写」，而是 **Phase 1 规划 → Phase 2A 草稿 → Phase 2B 实现** 三段式，每段都有边界：

**Phase 1 规划（不写代码）**
- Prompt：`PLANNING_SYSTEM_PROMPT`
- 唯一产出：`build_spec`（JSON），包含 `learning_goal / audience / target_duration_seconds / beats[]`。
- beats 字段严格用 `id / title / visual_goal / narration_intent / target_duration_seconds / required_elements / segment_required` 七个键。
- 默认 3–6 个 beat，每个 beat 只承载一个新教学点。

**Phase 2A 脚本草稿（不渲染）**
- Prompt：`PHASE2_SCRIPT_DRAFT_SYSTEM_PROMPT`
- 读取一次 `/scene-build` skill（`plugins/manim-production/skills/scene-build/SKILL.md`），按其中的 beat-first 结构、CJK 文本处理、动画模式、组件库用法写 `scene.py`。
- **时序门控**：每个 beat 显式 `run_time + wait` 之和 ≥ 该 beat 目标时长的 80%；整个脚本显式时序 ≥ 目标总时长的 60%。不达标则继续编辑脚本，不得以"偏差"形式上报。
- 唯一产出：`phase2_script_draft`（含 `scene_file / scene_class / source_code / beat_timing_seconds`）。

**Phase 2B 渲染实现（写代码 + 渲染 + 自检）**
- Prompt：`IMPLEMENTATION_SYSTEM_PROMPT`
- 拿到已通过的脚本草稿后：读 `/scene-build` 编码 → 执行 Manim 渲染 → 跑 `/layout-safety` 几何审计 → 抽帧让 `/render-review` 视觉审查。
- 任一阻塞问题被检出 → 修复 `scene.py` → 重渲染 → 重跑审计，直至全部通过。

下图展示了「抛物线」任务最终通过 Code 标签页呈现的 `scene.py`（含 `ParabolaScene` 类的完整定义、beat 编排与渲染命令）：

![图 3-3 任务详情页 Code 标签：模型生成的 scene.py](/blog/260721_manim_agent_02.png)

> **关键认识**：模型写的代码仍是 Python，必须能被 Manim 真正执行。「分段」+「门控」+「自检」共同把"AI 写代码"的不确定性压缩到工程可接受的范围内。

---

### 3.5 自动渲染动画
"自动渲染"在本项目里被显式扩展为 **三道质量门 + 失败返工回路**：

**第一道门：Manim 渲染**
- 入口：`python -m manim_agent "..." -o output.mp4`（`__main__.py`），或在流水线内通过 `segment_renderer.py` 调 Manim CE。
- 质量档：`high / medium / low` 对应 `-qh / -qm / -ql`。
- 输出落 `backend/output/{task_id}/` 下，由 `hooks.py` 强制约束。

**第二道门：layout-safety 几何审计**
- 实现：`scripts/layout_safety.py`（AABB 包围盒重叠检测），由 `pipeline_layout_audit.py` 在 Phase 2B 末尾调用。
- 强制要求：含 ≥ 2 个 mobject 的每个 beat 都必须跑 `--refine` 精化模式；视觉上"看起来不密集"也不能跳过。

**第三道门：render-review 视觉审查**
- 实现：`render_review.py` 调 ffmpeg 从 `final.mp4` 抽帧到 `phase2b_review_frames/`，按 `/render-review` skill 的逐帧评估标准对每张图跑 vision 分析。
- 产出：`approved / blocking_issues / suggested_edits`。

**失败返工回路**
- 任一道门发现阻塞问题 → 触发 `phase2_script_repair_prompt`（`pipeline_phases12.build_phase2_script_repair_prompt`）→ 修改 `scene.py` → 重渲染 → 重跑三道门，直至全部通过。
- 结构化输出如果缺失，由 `dispatcher.py` 通过文件系统扫描回退生成 `PipelineOutput`，不因 SDK 抖动而整条流水线失败。

下图来自「抛物线」任务的实际日志。可以看到 Phase 2B 渲染实现阶段出现了 **5 次失败 / 5 次自愈**：先是 `Render ParabolaScene with manim at high quality` 失败，然后是 `Re-render with correct import path` → `Re-render after fixing GrowFromArrow → GrowArrow` → `Re-render after fixing set_stroke dash_length issue` → `Re-render after fixing Flash radius parameter` → `Run layout-safety audit with correct script path`，最终落到 `Extract 6 sample frames at beat boundaries` 通过自检：

![图 3-4 渲染实现阶段的 5 ERR + 5 OK 自愈过程](/blog/260721_manim_agent_03.png)

> 这正是工程化 AI 系统的常态：**模型第一遍几乎不会写对**。系统的价值不在于"让模型一次成"，而在于"出错时能自动定位、自动修复、并留下证据"。

---

## 4. 约束模型

整个项目开发过程中，提示词调优是重中之重。

起初，团队尝试直接让模型生成 Manim 代码，但很快发现大模型虽然具有较强的代码生成能力，却并不了解 Manim 动画对于规范性和稳定性的要求，经常出现调用不存在的 API、动画逻辑过于复杂、对象坐标混乱等问题。

因此，团队逐渐将提示词从"开放生成"调整为"受约束生成"，通过增加大量规则来限制模型的输出范围，提高代码成功运行的概率。

这一环节主要进行了以下几类约束：

### 4.1 Agent 角色分层
为了让"既懂数学又懂 Manim"的模型在不同阶段表现出恰当的能力边界，本项目对 Agent 做了 **角色分层**。所有 system prompt 集中在 `src/manim_agent/prompts.py`：

| Phase | system prompt 常量 | 角色定位 | 严格禁止 |
|---|---|---|---|
| 全局 | `SYSTEM_PROMPT` | 专业的 Manim 动画工程师 + 教育内容创作者（含 Manim Coding Guidelines） | 用 `import`/包检查/`ls`/`find` 探测插件 |
| Phase 1 规划 | `PLANNING_SYSTEM_PROMPT` | 教学场景规划师 | 写代码、编辑文件、运行 shell |
| Phase 2A 草稿 | `PHASE2_SCRIPT_DRAFT_SYSTEM_PROMPT` | beat-first 脚本草稿 | 渲染、跑布局审计、跑音频合成 |
| Phase 2B 实现 | `IMPLEMENTATION_SYSTEM_PROMPT` | 渲染实现 + 自检 | 重新设计 beats / 跑音频合成 / 跑混流 |
| Phase 3 审查 | `RENDER_REVIEW_SYSTEM_PROMPT` | 渲染审查 | 修改文件、修复实现 |
| Phase 3.5 解说 | `NARRATION_SYSTEM_PROMPT` | 口语化解说生成 | 写或改代码 |

外加 4 个预设模式后缀（`PRESET_SUFFIXES`）：`educational / presentation / proof / concept`，按场景再追加行为要求。同一段 system prompt 切片在不同 phase 复用，是"让单一 Agent 表现出多面性"的关键。

下图截自 debug 视图（`/tasks/ebb4acfb/debug`），左侧 phases 栏可见 5 个 phase 全部归档，中间主区域切到 2B Render Implementation phase + system tab，**就是 Phase 2B 实际跑的那份 system prompt**：

![图 4-1 Debug 视图：2B Render Implementation 阶段的 system prompt](/blog/260721_manim_agent_05.png)

> 这种"可读、可回放、可对比"的 prompt 持久化机制，让提示词调优不再是"改一个不可见的字符串"，而是有据可查的工程任务。

### 4.2 代码规范约束
模型对 Manim 的代码生成有 7 条硬性规范，写在 `SYSTEM_PROMPT` 的 Manim Coding Guidelines 与 `/scene-build` skill 中：

1. **强制 CE 版导入**：`from manim import *`，不使用 ManimCairo / ManimGL 的私有 API。
2. **命名约定**：Scene 类名 PascalCase，构造方法固定为 `construct`；主类默认 `GeneratedScene`（除非用户明确指定）。
3. **文件命名**：主 Manim 脚本统一 `scene.py`，便于流水线按约定读取。
4. **配色与字号**：使用 `BLUE / RED / GREEN / YELLOW / WHITE` 等常量；字号 24–48 之间，确保可读性。
5. **质量与降噪**：渲染加 `-v WARNING`；质量档 `-qh / -qm / -ql` 与 CLI 的 `high/medium/low` 一一对应。
6. **节奏与拆分**：复杂动画拆为多 beat，每个 beat 只承载一个新教学点；显式使用 `Wait()` 控制节奏。
7. **写盘边界**：所有文件**只能写任务目录**（`backend/output/{task_id}/`），由 `hooks.py` 的 `PreToolUseHookSpecificOutput` 强制约束；越界写入会被静默拒绝。

### 4.3 动画复杂度限制
"复杂度限制"在本项目里不是凭感觉的经验值，而是 **三条可量化的硬门控**：

**门控 1：时序门控（时间维度）**
- 每个 beat 显式 `run_time + wait` 之和 ≥ 该 beat 目标时长的 80%。
- 整个脚本显式时序 ≥ 目标总时长的 60%。
- 不达标则继续编辑 `scene.py`，**禁止把未达标项以"偏差"形式上报**。

**门控 2：几何门控（空间维度）**
- `pipeline_layout_audit.py` + `scripts/layout_safety.py` 跑 AABB 重叠检测。
- 含 ≥ 2 个 mobject 的每个 beat 都必须跑 `--refine` 精化模式。
- 输出 `overlap_report`，与 `/layout-safety` skill 的判定规则联检。

**门控 3：结构门控（契约维度）**
- `pipeline_gates.apply_phase2_build_spec_defaults` 与 `merge_result_summaries` 校验实现输出与 `build_spec` 是否一致。
- `implementation_contract_issue` 在结构对不上时给出结构化拒绝。

下图是「抛物线」任务 Phase 3 阶段的日志，包含 5 个 ERR 自愈完成后的 [REVIEW] 行：`Duration check passed: 51.4s vs target 60s` —— **时序门控 60% 阈值通过，4.3 复杂度限制在这一行被实际验证**：

![图 4-2 时序门控 + 错误恢复的实测证据](/blog/260721_manim_agent_04.png)

### 4.4 错误恢复机制
「让 AI 写代码也能稳定交付」的关键，是一套 **三层防御 + 自动修复回路**：

**第一层：入口防御（hooks 拦截）**
- `hooks.py` 在 `PreToolUse` 阶段拦截 Agent 越界写文件 / 危险命令（删除、`rm -rf`、跨任务目录、读其它任务中间产物）。
- 任何越界操作被静默拒绝并产出结构化 JSON 反馈给 Agent。

**第二层：渲染防御（layout-safety + render-review）**
- 见 3.5 节：Phase 2B 末尾跑三道门，输出 `blocking_issues` 列表。

**第三层：结构防御（contract issue）**
- `pipeline_gates.implementation_contract_issue` 校验实现输出与 `build_spec` 是否一致；不一致时整次实现被拒绝，要求重做。

**修复回路**
- 任一层发现阻塞问题 → `phase2_script_repair_prompt` 接收 issue 列表 → 产出修订版 `scene.py` → 重渲染 → 重跑三道门。
- 所有中间产物（脚本、分析报告、抽帧、debug 文件）落 `backend/output/{task_id}/`，失败可回到任意中间步骤。

**降级策略**
- SDK 结构化输出偶尔缺失时，`dispatcher.py` 仍能通过文件系统扫描产出 `PipelineOutput`，流水线不会卡死。
- `prompt_debug.py` 把每个 phase 的 prompt artifact 落盘，配合 debug 视图可回放任意任务的完整轨迹。

错误恢复 + 复杂度门控的实测证据见 4.3 配图（上半 5 个 `[ERR]` 自愈、下半 `[REVIEW] Duration check passed: 51.4s vs target 60s`）。

### 4.5 Agent 插件化与 skills 系统

上面（1）-（4）的所有 prompt 模板、工具封装、质量门控都集中在 `plugins/manim-production/` 下，作为"可替换插件"对待。整套结构按 agent skills 规范组织——每个 skill 是一份带 YAML frontmatter 的 SKILL.md，外加可选的 `scripts/` 与 `components/`。LLM 看到 SKILL.md 就"变成"那个 skill。

**本项目内置的 8 个 skill**（位于 `plugins/manim-production/skills/`）：

| skill | 职责 | 对应阶段 |
|---|---|---|
| `scene-plan` | 把用户主题拆成 `build_spec.json` | Phase 1 规划 |
| `scene-direction` | 决定每个 beat 的视觉节奏 | Phase 1 规划 |
| `scene-build` | 按 build_spec 写 `scene.py` 草稿 | Phase 2A 草稿 |
| `manim-production` | 调 Manim 跑渲染 | Phase 2B / 3 |
| `layout-safety` | AABB 越界检测 | Phase 2B 末尾门控 |
| `render-review` | 渲染后审查 | Phase 3 末尾 |
| `narration-sync` | 配音与 beat 对齐 | Phase 3.5 / 4 |
| `intro-outro` | 头尾字幕 | Phase 5 |

`components/` 目录下是 8 个 skill 共享的 Python 工具（`layouts.py` / `formula_display.py` / `text_helpers.py` 等），相当于"skill 能调用的标准库"。

**想替换为自己的领域？三步走**：

1. **只换 prompt（最小改动）**：复制 `plugins/manim-production/skills/<某个>/SKILL.md`，改 YAML 里的 `name` / `description` 和 Markdown 主体为自己的领域描述，不动 `components/` 和 `src/manim_agent/`。
2. **新增 skill（中等改动）**：在 `plugins/<你的领域>-production/skills/<新 skill>/` 下新建一份 SKILL.md（可加 `scripts/` 放 LLM 调用的 Python），在主 `SKILL.md` 的描述里把新 skill 列出来，让 dispatcher 自动发现。
3. **整套换掉（换学科 / 换领域）**：
   - 把 `plugins/manim-production/` 整个删掉
   - 新建 `plugins/<你的领域>-production/`
   - 保留 `src/manim_agent/`（pipeline 编排、hooks、debug 视图、`prompt_debug.py` 都不动）
   - 修改 `phase1_planning.json` 的 schema 适配你的领域产出物
   - 在 `src/manim_agent/pipeline.py` 的 phase 列表里调整阶段名

**为什么这样切分？** `src/manim_agent/` 是"通用 Agent 工程脚手架"（拆阶段 / 多 Agent / 门控 / 可观测 / 修复回路），跟具体领域无关；`plugins/<领域>-production/` 是"领域知识"（prompt + 工具 + 共享组件），跟学科相关。两者解耦后：

- 做一个"AI 数学题讲解"项目 → 改 `plugins/math-production/`
- 做一个"AI 历史动画"项目 → 改 `plugins/history-production/`
- 做一个"AI 物理演示"项目 → 改 `plugins/physics-production/`

底层脚手架一行都不用动。

> **关于 Claude Agent SDK 的取舍**：本项目 Agent 层用 Claude Agent SDK 直接接 Anthropic API，是因为协议层最稳、调试最熟。但这个选择有两个明显的代价需要权衡：
> - **内存占用较高**——Claude Agent SDK 需要单独启动 Claude Code 进程作为子进程执行 Agent，单任务峰值常驻 500MB–1GB 内存，对小内存部署环境不友好；
> - **Claude Code 不是开源的**——Agent 的执行环境是闭源的，LLM 实际执行的代码、文件读写、shell 命令对开发者不是完全可审计的。
>
> 可控性上需要靠 `hooks.py` 的 `PreToolUse` 拦截 + `dispatcher.py` 的结构化输出校验来兜底。如果你的项目对内存敏感或要求执行环境完全可审计，可以切换到 [AgentScope](https://github.com/agentscope-ai/agentscope)（阿里开源、Apache 2.0，Qwen / DeepSeek 等国内模型有原生支持）。

---

## 5. 解决问题

整个项目开发过程中，需要不断提高系统生成结果的稳定性。方法论层面的核心是 **Agent 编排**——把单一 LLM 调用拆成多 Agent 分阶段协作 + 门控 + 自我修复 + 全量可观测，这也是下面三节要展开的三条主轴。

例如，大模型生成代码时经常会调用不存在的 Manim 接口。虽然代码逻辑正确，但由于 API 名称错误，程序无法正常运行。针对这一问题，我们一方面在 Prompt 中增加了接口限制，另一方面整理了 Manim 官方常用组件列表，引导模型优先使用经过验证的动画对象，从而明显提高了生成成功率；此外，由于动画属于程序生成，不同模型对于空间布局和对象位置的理解也存在差异，有些动画虽然能够正常运行，但视觉效果并不符合教学要求，因此我们进一步限制了动画复杂度，减少自由生成的空间，使模型更多采用标准化的动画模板，提高了整体一致性。

**针对上述两类痛点，我们沿三条主轴工程化解决：**

### 5.1 AI 生成代码本质不可靠

直接对应原文"调用不存在的 Manim 接口""动画逻辑过于复杂、对象坐标混乱"两条核心痛点。整个流水线每一阶段都设了硬门控，模型写得不对就回炉重做，而不是放任 LLM 自由发挥。

| 阶段 | 典型问题 | 修复方向 | 代表性 commit |
|---|---|---|---|
| Phase 1 规划 | 结构化输出不稳（字段缺失 / 类型错乱） | 收紧 system prompt 输出解析 + 多次修复重试 | [117df41](https://github.com/gqy20/manim-agent/commit/117df41), [d831f31](https://github.com/gqy20/manim-agent/commit/d831f31) |
| Phase 2A 草稿 | 一次写崩，`scene.py` 跑不通 | 引入脚本草稿阶段 + 失败时跑 repair prompt | [c171ef6](https://github.com/gqy20/manim-agent/commit/c171ef6), [3b49f8a](https://github.com/gqy20/manim-agent/commit/3b49f8a), [faf5b9f](https://github.com/gqy20/manim-agent/commit/faf5b9f) |
| Phase 2B 实现 | 实现与 `build_spec` 契约不符（beat 数对不上、`required_elements` 漏元素） | 收紧实现契约校验 + 显式保留 2B 阶段产物 | [46cdac5](https://github.com/gqy20/manim-agent/commit/46cdac5), [681ea02](https://github.com/gqy20/manim-agent/commit/681ea02), [7d57835](https://github.com/gqy20/manim-agent/commit/7d57835) |
| Phase 3 审查 | 跑得通但视觉不齐（元素重叠 / 轴标签错位） | `layout-safety` 升级为自动门控 + 失败强制 retry | [ddee769](https://github.com/gqy20/manim-agent/commit/ddee769), [3c5b817](https://github.com/gqy20/manim-agent/commit/3c5b817), [ffd3db5](https://github.com/gqy20/manim-agent/commit/ffd3db5) |

### 5.2 跨平台与基础设施稳定性

不是 AI 本身的错，是 AI 跑在真实环境里的"水土不服"。本地 Windows、云端 Railway、Mac 开发机各有各的坑，靠一次性补丁逐个填。

| 典型问题 | 修复方向 | 代表性 commit |
|---|---|---|
| 音画不对齐（配音时长与画面错位） | 字幕时间戳归一到 beat 边界 + 配音对齐 visual timing | [310fa3b](https://github.com/gqy20/manim-agent/commit/310fa3b), [888abef](https://github.com/gqy20/manim-agent/commit/888abef) |
| Windows 下 ffmpeg 反斜杠导致合成失败 | Windows 路径标准化 + 字幕路径转义 | [fc3eb40](https://github.com/gqy20/manim-agent/commit/fc3eb40), [6d38285](https://github.com/gqy20/manim-agent/commit/6d38285), [5ce0150](https://github.com/gqy20/manim-agent/commit/5ce0150) |
| `/create` 页"理解内容"按钮解析失败 / 超时 | 加固超时与重试 + 解析容错 | [5db4616](https://github.com/gqy20/manim-agent/commit/5db4616), [7adeaa3](https://github.com/gqy20/manim-agent/commit/7adeaa3), [56c33b3](https://github.com/gqy20/manim-agent/commit/56c33b3) |
| 容器 shell CRLF 报错 + R2 schema 模块被打进镜像 | 强制 LF 行尾 + Railway ignore 规则 | [96130d0](https://github.com/gqy20/manim-agent/commit/96130d0), [3d3d9ab](https://github.com/gqy20/manim-agent/commit/3d3d9ab), [21c5492](https://github.com/gqy20/manim-agent/commit/21c5492) |

### 5.3 可观测 + 可维护性

LLM pipeline 跨多阶段，失败时不知道哪一步出问题——**比修 bug 更难的是先看见 bug**。我们用两层基础设施把流水线从黑盒变成可追溯、可复盘的工程资产。

| 典型问题 | 修复方向 | 代表性 commit |
|---|---|---|
| SDK 内部步骤不可见 | 补全 trace/span 模型 + 事件持久化 | [b1619b1](https://github.com/gqy20/manim-agent/commit/b1619b1) |
| 调试定位靠猜 | prompt debug 视图 + 12 类问题归档 | [9804e37](https://github.com/gqy20/manim-agent/commit/9804e37), [59b70e5](https://github.com/gqy20/manim-agent/commit/59b70e5), [e03c2a8](https://github.com/gqy20/manim-agent/commit/e03c2a8) |
| Prompt 散乱（中英混杂、注释分散） | 8 个 plugin skill + 全 pipeline prompt 中文化 | [d970a94](https://github.com/gqy20/manim-agent/commit/d970a94), [15aaa27](https://github.com/gqy20/manim-agent/commit/15aaa27) |

> 完整提交记录见 [github.com/gqy20/manim-agent/commits/master](https://github.com/gqy20/manim-agent/commits/master)。

---

## 6. 给参赛者的建议

下面 3 个 idea 不是我们做过、验证过的项目，**而是结合「小有可为」四个方向（养老 / 孤独症 / 无障碍）给出的参赛推荐**——每个都天然需要多 Agent 协作、能用开源模型落地，且按"项目名 / 赛道 / 痛点 / 核心 Agent 架构 / 为什么 Agent 驱动 / 关键技术点"展开，可直接拿去做立项书。

### 6.1 晚安电台：独居老人智能陪伴

- **痛点**：独居老人夜间孤独感强，需要"有人陪说话"但又不能全靠护工；同时子女最关心的是"今天父母情绪和身体怎么样"。
- **一句话定位**：一个能记住老人近况、陪聊天、异常自动告警的"晚间电台"。
- **核心 Agent 架构**（4 个 Agent）：
  - **长期记忆 Agent**：维护老人近 N 天的关键事件（子女探望 / 用药 / 心情 / 睡眠），写入向量库 + 时间线；
  - **对话 Agent**：基于记忆 + 当前情绪调整回应语，约束"不重复、不说教、不催促睡觉"；
  - **安全兜底 Agent**：检测关键句（"摔倒了 / 胸口疼 / 不想活了"等），触发家属短信 / 社区联络；
  - **每日简报 Agent**：把当天对话聚成 ≤ 200 字简报，每天早上发给子女。
- **为什么是 Agent 驱动**：长上下文记忆 + 情绪识别 + 安全兜底是**单一 prompt 装不下的**——一个模型既陪聊又做风险判断，输出会矛盾；必须 Agent 分工。
- **关键技术点**：
  - 主模型：Qwen3.5-397B-A17B（长对话记忆 + 情绪感知）；
  - 多模态：ASR（识别老人方言语音）+ TTS（柔和女声 / 慢速男声可切换）；
  - 工程化重点：安全 Agent **必须正则 + 关键词双轨**，避免漏报；每日简报必须能让子女点回"原话片段"，便于核实。
- **MVP 估计**：2-3 周可完成单机版 Web + 微信小程序语音入口。

### 6.2 社交剧本：孤独症儿童情景演练

- **痛点**：孤独症儿童需要反复演练高频社交情境（"去超市买面包 / 主动跟小朋友打招呼 / 看医生"），但家长不会拆解步骤、不知道下一步该怎么引导。
- **一句话定位**：把"社交情境"变成可演练、可复盘、可个性化调整的剧本游戏。
- **核心 Agent 架构**（4 个 Agent）：
  - **情境理解 Agent**：从家长语音 / 照片中识别"今天要演练的情境"和"孩子的当前水平"；
  - **剧本生成 Agent**：按孩子认知水平生成 5-7 步对话剧本（含图示 + 文字），每步都有"如果孩子说 X，就引导 Y"的决策点；
  - **演练 Agent**：平板 / 大屏上模拟对话角色，按孩子回应**动态调整**剧本分支；
  - **家长教练 Agent**：每天给家长发一条 1 句话的具体建议（"今天练完后夸他主动问了价格这一句"），并归档孩子的进步轨迹。
- **为什么是 Agent 驱动**：每个孤独症孩子的触发点 / 表达方式都不同，必须**长期跟踪 + 个性化生成**；剧本必须能根据孩子当天的情绪和表现**动态调整难度**。
- **关键技术点**：
  - 主模型：Qwen3.5-397B-A17B（剧本生成 + 决策点逻辑）+ Qwen-VL（识别人脸情绪）；
  - 工程化重点：演练 Agent 的"决策点"必须白盒化——家长能看到"如果孩子说 X → 引导 Y"的规则集，便于人工干预；
  - 数据安全：孩子的所有对话 / 图像必须本地存储，不上云。
- **MVP 估计**：3 周可完成"买面包"一个情境的端到端 demo。

### 6.3 我看看：无障碍实时解释

- **痛点**：视障 / 老年低视力 / 阅读障碍人群，遇到菜单、说明书、医院检查单、公交站牌时，无法快速理解内容。
- **一句话定位**：拍一下，说人话。
- **核心 Agent 架构**（4 个 Agent）：
  - **场景识别 Agent**：用 VLM 识别"这是菜单 / 处方 / 说明书 / 站牌 / 通知公告"等场景；
  - **OCR + 改写 Agent**：按场景抽取关键信息，并按用户理解水平（可在设置里改"年龄段 / 识字量"）改写成 1-2 句口语；
  - **语音合成 Agent**：调开源 TTS（CosyVoice / ChatTTS）朗读；
  - **追问对话 Agent**：用户可以语音追问"这是哪种药？我能吃吗？"，Agent 用结构化模板回答 + 提示"如需专业意见请咨询医生"。
- **为什么是 Agent 驱动**：场景太多 + 用户差异太大，**必须让 Agent 现场判断"这是什么 + 用户需要什么"才能给出可用的解释**——单一 prompt 无法覆盖所有组合。
- **关键技术点**：
  - 主模型：Qwen-VL-OCR（识别场景 + 文字）+ Qwen3.5-397B-A17B（改写 + 追问）；
  - 工程化重点：医疗 / 处方类场景必须**显式提示"非专业意见"**；改写 Agent 的输出长度必须按场景约束（菜单 ≤ 30 字、说明书 ≤ 100 字）。
- **MVP 估计**：1-2 周可完成"菜单 + 说明书"两个高频场景的 PWA。

**写在最后**：3 个 idea 都基于同一种工程范式——把"一个 LLM 一次完成所有事"换成"一组 Agent 分阶段协作 + 门控 + 自我修复 + 全量可观测"，即 manim-agent 自己沉淀下来的方法论。完整代码、commit 记录和 prompt 文件已开源在 [github.com/gqy20/manim-agent](https://github.com/gqy20/manim-agent)。

---

## 7. 总结

回顾整个项目，团队的收获不仅是一套 AI 视频生成系统，更是在实践过程中不断重新理解教育场景的真实需求。

技术的发展为内容创作带来了前所未有的可能性，但在教育领域，真正重要的并不是生成速度有多快、动画效果有多炫，而是能否帮助教师更稳定、更准确地表达知识，帮助学生更容易理解知识。

因此，"智绘科普"团队最终选择了一条更加偏向工程化和可控性的技术路线。将大模型负责内容理解，将程序动画负责知识表达，通过"脚本—代码—动画"的方式，把整个生成过程拆解成多个可以修改、可以验证、可以复用的中间环节。

希望本文能够帮助更多参赛者快速理解整个项目的技术实现逻辑，完成属于自己的第一个 AI 公益应用。更重要的是，希望大家能够在掌握基础流程之后，不断结合自己的专业背景和实际需求，探索更多真正具有应用价值的创新方向。
