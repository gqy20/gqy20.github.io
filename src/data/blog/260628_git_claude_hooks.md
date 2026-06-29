---
title: "当 AI 开始写代码,hooks 该挂在哪里?——从 git hooks 到 Claude Code hooks 的范式迁移"
type: "tutorial"
date: "2026-06-28"
updated: "2026-06-28"
author: "Qingyu Ge"
tags: ["Claude Code", "Git Hooks", "Agent", "可观测性", "工程实践"]
category: "AI编程"
excerpt: "git hooks 把逻辑挂进版本控制的生命周期,Claude Code hooks 把它挂进 AI 代理的生命周期——两者同源异流。本文从 git hooks 本质讲起,讲清为什么 AI Coding 时代必须有 hooks,再用我真实的 AI_PAD 全事件上报 + cc-insights 可视化系统,拆解如何给 Claude Code 装一套「Agent 的 APM」。"
coverImage: "/blog/260628_git_claude_hooks.jpg"
published: true
id: "260628_git_claude_hooks"
slug: "260628_git_claude_hooks"
---

# 当 AI 开始写代码,hooks 该挂在哪里?——从 git hooks 到 Claude Code hooks 的范式迁移

> git hooks 挂在版本控制的生命周期,Claude Code hooks 挂在 AI 代理的生命周期——同源异流。当一个 agent 开始替你写代码,"在固定时刻注入人类意志"就从锦上添花变成了刚需。

## 1. 背景与动机:一个开发者的两道拦截

先想象一个再普通不过的场景。

你在终端敲下 `git commit -m "fix bug"`,回车,屏幕没有如预期那样吐出 commit hash,而是先蹦出一段红色的报错——`pre-commit` 框架拦住了你:有未格式化的代码、有遗留的 `print` 调试语句、commit message 不符合规范。你骂骂咧咧修完,终于提交成功。

半小时后,你打开 Claude Code,让它「把测试数据库清一下」。它二话不说开始执行 `Bash` 工具,即将跑出一条 `rm -rf` 时,一道无形的闸门落下——你在 `settings.json` 里配的 `PreToolUse` hook 识别出这是危险命令,直接 `deny`,把拒绝原因喂回给 Claude。Claude 悻悻地换了个更安全的方式重试。

**两道拦截,一个共同的名字:hook。**

如果你只是把 git hooks 当成「提交前的格式化工具」、把 Claude Code hooks 当成「AI 的小插件」,那就低估了它们。剥开表面的差异,两者本质是同一个东西:

> 💡 **核心论点**:hook 是一种「**事件驱动的契约接口**」——在某个生命周期的固定时刻,系统把控制权暂时交给你的代码,让你拦截、改写、或仅仅是观察。git hooks 把这个时刻挂在**版本控制的生命周期**上(commit、push、merge);Claude Code hooks 把它挂在 **AI 代理的生命周期**上(工具调用、会话起止、用户输入)。它们同源异流。

为什么这件事在 2026 年特别值得写?因为**代码正在从「人写」变成「AI 写」**。当写代码的从一个谨慎的、会被你盯着的人,变成一个高速、自主、偶尔还会一本正经胡说八道的 agent 时,「在固定时刻注入人类意志」这件事就从「锦上添花」变成了「生死攸关」。而 hook,正是这件事的唯一通用解法。

本文不会只教你「怎么配一个 hook」,而是带你从 git hooks 的底层机制出发,看懂这套思想是如何**整体迁移**到 AI Coding 时代的,以及我自己用一套 hook 系统给 Claude Code 装上了「APM(应用性能监控)」。文中所有配置和脚本都来自我的开源项目。

> 📊 **本文导览**

| 章节 | 一句话主旨 | 阅读时长 |
|------|-----------|---------|
| **1. 背景与动机** | 两道拦截背后的同一套思想 | 3 分钟 |
| **2. Git Hooks 的本质** | 把逻辑挂进版本控制的生命周期 | 5 分钟 |
| **3. 范式迁移** | 当代码由 AI 写,hooks 该挂在哪里 | 3 分钟 |
| **4. Claude Code Hooks 详解** | 事件、输入/输出契约、配置 | 5 分钟 |
| **5. 实战:Agent 的 APM** | 我用 hook 全量上报 + 可视化 Claude 行为 | 4 分钟 |
| **6. 两层防线协同** | git hooks × claude hooks 如何配合 | 2 分钟 |
| **7. 设计哲学** | 写好一个 hook 的五条军规 | 1 分钟 |

---

## 2. Git Hooks 的本质:把逻辑挂进版本控制的生命周期

### 2.1 什么是 git hooks

git hooks 的定义朴实得惊人([官方文档](https://git-scm.com/docs/githooks)):**放在 hooks 目录里的可执行脚本,会在 git 执行的特定时刻被触发**。仅此而已。

默认的 hooks 目录是 `$GIT_DIR/hooks/`(也就是项目里的 `.git/hooks/`),里面通常躺着一堆 `.sample` 文件——那是 git 自带的示例,去掉后缀、加上可执行权限就能用。你也可以用 `git config core.hooksPath` 把 hooks 目录指到别处,这是后面所有现代化框架的基石。

一个 git hook 脚本能拿到三种输入:

- **命令行参数**:比如 `commit-msg` 会收到存放提交信息的临时文件路径;
- **标准输入(stdin)**:比如 `pre-push` 会从 stdin 读到要推送的 ref 列表;
- **环境变量**:git 会导出 `GIT_DIR`、`GIT_WORK_TREE` 等,方便 hook 内部再调用 git 命令。

而它怎么「拦住」你?靠**退出码(exit code)**:

> ⚠️ **退出码契约**:绝大多数「pre-」类 hook,只要**以非零状态退出,就会阻断**当前 git 操作。`pre-commit` 退出 1,这次 commit 就不会发生;`pre-push` 退出 1,这次 push 就会被取消。

唯一的后门是 `--no-verify`——给 `git commit` / `git merge` / `git push` 加上它,可以绕过对应的 hook。「我知道我在干嘛,别拦我」的逃生通道。

### 2.2 客户端 hooks 全景

git 的 hook 分**客户端(client-side)**和**服务端(server-side)**两类。客户端 hook 在你本地仓库触发,最常用的有这些:

| Hook | 触发时机 | 能否阻断 | 典型用途 |
|------|---------|---------|---------|
| `pre-commit` | `git commit` 之前,获取提交信息之前 | ✅ 非零退出则阻断 | 代码检查、格式化、敏感信息扫描 |
| `prepare-commit-msg` | 准备好默认提交信息后、编辑器启动前 | ✅ 阻断 | 自动生成 commit message(如分支名) |
| `commit-msg` | 编辑器保存提交信息后 | ✅ 阻断(可 `--no-verify`) | 校验 commit message 规范 |
| `post-commit` | commit 完成之后 | ❌ 仅通知 | 发通知、触发 CI |
| `pre-merge-commit` | merge 成功后、提交前 | ✅ 阻断(可 `--no-verify`) | merge 前的最后检查 |
| `pre-push` | `git push` 之前 | ✅ 非零退出则阻断 | 阻止推送未通过测试的代码 |
| `pre-rebase` | `git rebase` 之前 | ✅ 阻断 | 防止 rebase 已推送的分支 |
| `post-checkout` | checkout/switch 之后 | ❌ 仅通知 | 切换分支后自动 `npm install` |
| `post-merge` | `git merge`/`git pull` 之后 | ❌ 仅通知 | 合并后同步依赖 |
| `post-rewrite` | `git commit --amend` / rebase 之后 | ❌ 仅通知 | 重建被改写的提交索引 |

这套设计的精妙之处在于:**前缀就是语义**。`pre-` 是「事前可拦截」,`post-` 是「事后只能通知」;`-commit` 挂在提交,`-push` 挂在推送。望文生义,无需查文档。

### 2.3 服务端 hooks

服务端 hook 在远程仓库(GitHub/GitLab/Gitea 的服务端)触发,你能用它做**团队级、绕不过的**管控——因为它们跑在服务器上,客户端的 `--no-verify` 对它们无效:

- `pre-receive`:推送到达服务端、更新任何 ref 之前触发,**一次推送只跑一次**,从 stdin 读所有待更新的 ref。非零退出则整笔推送被拒。
- `update`:每个 ref 更新前各触发一次,能对单个分支做精细控制(比如禁止 force push 到 `main`)。
- `post-receive`:全部 ref 更新完毕后触发,典型用途是**触发 CI、发 webhook 通知、部署**。

> 💡 这正是 GitHub Actions、GitLab CI 的底层精神来源——一次 push 触发一次流水线,本质就是一个更强大、更标准的 `post-receive`。

### 2.4 痛点与演进:`.git/hooks` 是个「孤岛」

git hooks 有个致命的设计缺陷:**`.git/hooks` 不进版本控制**。

这意味着你在自己机器上精心配好的 `pre-commit`,同事 clone 下来之后**根本不存在**。团队规范沦为「靠口头约定」,很快就会形同虚设。

于是社区造了一堆轮子来填补这个缺口,演进路线非常清晰:

| 方案 | 语言生态 | 核心思路 |
|------|---------|---------|
| [**husky**](https://typicode.github.io/husky/) | Node/前端 | `npm` 安装时自动把 hooks 写进 `.git/hooks` |
| [**lefthook**](https://github.com/evilmartians/lefthook) | 通用 | 单一配置文件,并行执行,跨语言 |
| **simple-git-hooks** | Node | 极简,零依赖 |
| **pre-commit** | Python,但**跨语言** | 声明式 `.pre-commit-config.yaml`,自动管理 hook 环境 |

其中 [**pre-commit framework**](https://pre-commit.com/)(注意,它和 git 自带的 `pre-commit` hook 是两回事)是格局最大的一类——它用一个**声明式的 yaml 配置**描述「我要跑哪些检查」,然后自动把这些检查安装成 git hooks,而且每个 hook 跑在隔离的环境里,不会污染你的项目依赖。配置进版本控制,clone 下来 `pre-commit install` 一下,全团队立刻拥有相同的护栏。

### 2.5 真实案例:我的 `quick-template` 模板里的 git hooks

我不讲抽象例子,直接看我开源的 [`quick-template`](https://github.com/gqy20/quick-template)(一个基于 Copier 的多语言项目模板)里,Python 模板预置的 `.pre-commit-config.yaml`:

```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v6.0.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
      - id: check-json
      - id: check-merge-conflict
      - id: debug-statements

  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.14.10
    hooks:
      - id: ruff
        args: [--fix, --exit-non-zero-on-fix]
      - id: ruff-format

  - repo: https://github.com/rhysd/actionlint
    rev: v1.7.10
    hooks:
      - id: actionlint
        args: [-shellcheck=]

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.14.1
    hooks:
      - id: mypy
        additional_dependencies:
          - pyproject.toml
          - rich>=13.0.0
        args: [--config-file=pyproject.toml]
```

逐段拆解:

- **第一个 repo**:`pre-commit-hooks` 这个官方仓库提供的一堆「卫生检查」——清行尾空格、修文件末尾换行、校验 yaml/json 合法性、拦大文件、拦遗留的 merge 冲突标记、拦 `breakpoint()` 调试语句。这是任何项目的「最低卫生标准」。
- **第二个 repo**:`ruff`,当下最快的 Python linter + formatter,`--fix` 自动修、`--exit-non-zero-on-fix` 保证「即使自动修了也要让本次提交失败」,逼你重新 `git add`。
- **第三个 repo**:`actionlint`,校验 GitHub Actions 的 workflow 文件——CI 配置也是代码,也能 lint。
- **第四个 repo**:`mypy`,静态类型检查。

> 💡 **注意一个细节**:每个 repo 都钉死了 `rev`(版本号)。这是 pre-commit framework 的精髓——**所有 hook 的版本跟着你的配置走**,全团队、CI、你本机跑的是完全一致的检查。这正是原始 `.git/hooks` 做不到的「可复现」。

这就是 2026 年现代化的 git hooks:声明式、可分享、跨语言、版本钉死。但请记住它的**能力边界**——所有这些检查,都只能在 `git commit` / `git push` 那一瞬间触发。

而问题来了:**当 AI 帮你写代码,这一瞬间来得太晚了。**

---

## 3. 范式迁移:当代码不再由人写,hooks 该挂在哪里?

### 3.1 git hooks 抓不住 AI

设想你让 Claude Code 给一个模块加个新功能。在你按下回车到你最终 `git commit` 之间,它可能已经:

- 用 `Read` 翻了十几个文件;
- 用 `Edit` / `Write` 修改了二十多个文件;
- 用 `Bash` 跑了 `npm install`、跑了测试、可能还跑了它自己写的临时脚本;
- 用 `WebFetch` 去查了几个文档。

而你的 `pre-commit` hook,对这一整段过程**完全盲视**。它只在最后那一声 `git commit` 时才醒来,瞪一眼 diff,放过或拦截。如果 AI 中途已经删错了文件、跑飞了命令、把密钥写进了代码——`pre-commit` 可能根本察觉不到(它只看「将要被提交的内容」),或者等它发现时,损害早就发生了。

> ⚠️ **核心矛盾**:git hooks 的触发点(版本控制事件),和 AI 写代码的「危险高发区」(工具调用过程),在时间轴上是**错位**的。agent 的风险诞生在过程里,而 git hooks 只守在终点。

我们需要一种新的 hook,挂在**离 agent 行为更近**的地方。

### 3.2 Claude Code hooks:把钩子挂到「代理行为生命周期」

Claude Code 的 hook 机制,正是对这个需求的回答。它把钩子点从「git 生命周期」整体迁移到了「**AI 代理的生命周期**」——每一次工具调用、每一次用户输入、每一个会话的起止,都可以挂载 hook。

如果你已经熟悉 git hooks,理解 Claude Code hooks 几乎是瞬间的事,因为两者的事件几乎是**一一对应**的:

| git hooks 事件 | Claude Code hooks 事件 | 对应的「生命周期」 |
|---------------|----------------------|------------------|
| `pre-commit`(提交前检查) | `PreToolUse`(工具执行前) | 事前拦截 |
| `commit-msg`(校验提交信息) | `UserPromptSubmit`(用户输入前) | 校验/改写输入 |
| `post-commit`(提交后通知) | `PostToolUse`(工具执行后) | 事后观察 |
| `pre-push`(推送前最后审查) | `Stop`(agent 回复结束前) | 收尾前最后审查 |
| `post-checkout`(环境准备) | `SessionStart`(会话开始) | 初始化环境 |
| —(无对应) | `SubagentStop`(子代理结束) | 子任务收尾 |

看懂这张表,你就抓住了本文的全部要义:**这不是一个新工具,而是同一套思想在一条新生命线上的重演。** hook 的本质没变(事件驱动 + 退出码契约 + 可执行脚本),变的只是「事件从哪来」。

### 3.3 护栏(guardrail)理论:为什么 AI Coding 时代必须 hooks

为什么这件事重要到值得单写一章?因为 agent 有三个让人不省心的特性:

1. **速度快**:它一秒能调好几次工具,人类根本来不及逐条盯;
2. **自主性强**:你给了它目标,它自己决定调用什么工具、改什么文件;
3. **会一本正经地胡说**:它可能「自信地」跑出一条它以为对、实则危险的命令。

面对这样的执行体,「在固定时刻注入人类意志」就成了刚需。而 hook,正是这个「注入点」。按作用我把 hook 能干的事分成三类——它也是后面所有实战的纲领:

> 💡 **hook 的三类护栏**
> - 🚫 **拦截危险**:在 `PreToolUse` 拦下 `rm -rf`、拦下对 `.env` 的写入、拦下 `sudo`;
> - 📥 **注入上下文**:在 `SessionStart` 自动加载项目背景、在 `UserPromptSubmit` 给 prompt 补充当前时间或规范;
> - 👁️ **可观测**:在 `PostToolUse` 把每次工具调用记录下来,把「黑盒 agent」变成「可审计的 agent」。

下面三章,就是围绕这三类护栏,用真实代码展开。

---

## 4. Claude Code Hooks 详解:事件、契约与配置

### 4.1 配置在哪:三层 settings + 插件

Claude Code 的 hook 配置写在 settings 文件里([官方文档](https://docs.claude.com/en/docs/claude-code/hooks)),有四个来源(优先级从低到高):

- `~/.claude/settings.json` —— 用户级,对你所有项目生效;
- `.claude/settings.json` —— 项目级,跟着仓库走,团队共享;
- `.claude/settings.local.json` —— 本地项目级,**不提交**,放个人偏好;
- 企业托管策略(enterprise managed policy)—— 最高优先级。

配置的骨架是「**事件 → matcher(可选) → hooks 数组**」:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/check-style.sh",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

讲三个要点:

- **matcher**:用正则匹配工具名,**只有 `PreToolUse` 和 `PostToolUse` 这两个事件支持**。`Write|Edit` 表示匹配写文件类工具,`mcp__.*` 能匹配所有 MCP 工具,`*`(或留空)匹配全部。
- **`$CLAUDE_PROJECT_DIR`**:Claude Code 注入的环境变量,指向项目根目录。用它引用项目内的 hook 脚本,无论 Claude 当前在哪个子目录都能正确找到。
- **timeout**:单个 hook 命令的超时(秒),超了会被取消,**但不影响其他 hook**。

> 💡 **MCP 工具的命名**:`mcp__<服务名>__<工具名>`,比如 `mcp__article-mcp__search_literature`。你的 hook 可以用 `mcp__article-mcp__.*` 精确拦截某个 MCP 服务的所有工具调用。

下面是 `Skills_demo` 项目里的真实配置(节选),它同时演示了多事件、多 matcher、多个 hook 共存:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          { "type": "command", "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/check-pdf-updates.sh", "timeout": 5 },
          { "type": "command", "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/intent-detect.sh", "timeout": 10 },
          { "type": "command", "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/update-status.sh", "timeout": 5 }
        ]
      }
    ],
    "SessionStart": [
      {
        "hooks": [
          { "type": "command", "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/session-start.sh", "timeout": 10 },
          { "type": "command", "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/fix-reasoning.sh", "timeout": 15 }
        ]
      }
    ],
    "PostToolUse": [
      { "matcher": "Write|Edit", "hooks": [
          { "type": "command", "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/track-skills-change.sh", "timeout": 5 },
          { "type": "command", "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/capture-reasoning.sh", "timeout": 3 }
      ]},
      { "matcher": "TaskCreate|TaskUpdate", "hooks": [
          { "type": "command", "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/detect-task-complete.sh", "timeout": 5 }
      ]}
    ]
  }
}
```

注意 `PostToolUse` 下有**两组 matcher**:`Write|Edit` 触发文件变更追踪,`TaskCreate|TaskUpdate` 触发任务完成检测。同一个事件按工具类型分流到不同的 hook,这正是 matcher 的价值——精细控制「谁的事谁管」。

### 4.2 九大官方事件全景

这是写 Claude Code hook 最重要的参考表。**官方一共只有 9 个事件**(见[官方文档](https://docs.claude.com/en/docs/claude-code/hooks),我把它们按「代理生命周期」的先后排了序):

| 事件 | 触发时机 | 能否阻断 | 支持 matcher | 典型用途 |
|------|---------|---------|:----------:|---------|
| `SessionStart` | 新会话开始或恢复 | ❌(stderr 仅提示用户) | ✅(source) | 加载项目上下文、装依赖 |
| `UserPromptSubmit` | 用户提交 prompt 后、Claude 处理前 | ✅ 可擦除 prompt | ❌ | 校验输入、注入上下文/时间 |
| `PreToolUse` | 工具参数生成后、执行前 | ✅ 可拦截工具调用 | ✅(工具名) | 拦危险命令、自动批准只读 |
| `PostToolUse` | 工具成功执行后 | ⚠️ 可反馈给 Claude | ✅(工具名) | 格式化、追踪变更、记录 |
| `Notification` | Claude 需要权限/空闲超时 | ❌ | ❌ | 桌面通知 |
| `Stop` | 主 agent 回复结束前 | ✅ 可阻止停止 | ❌ | 收尾审查、跑测试 |
| `SubagentStop` | 子代理(Task)结束前 | ✅ 可阻止停止 | ❌ | 子任务收尾 |
| `PreCompact` | 上下文压缩前 | ❌ | ✅(manual/auto) | 压缩前保存关键信息 |
| `SessionEnd` | 会话结束 | ❌ | ❌ | 清理、落盘统计 |

记住这张表的「能否阻断」列,它是 hook 能力的边界:`SessionStart` 只能注入不能拦;`UserPromptSubmit` / `PreToolUse` / `Stop` 是三个真正能「踩刹车」的事件;`PostToolUse` 拦不住(木已成舟),但能把反馈喂给 Claude 让它自己改。

### 4.3 输入契约:从 stdin 读 JSON

和 git hooks 三种输入方式不同,Claude Code hooks **统一从 stdin 读取一个 JSON**。公共字段有 `session_id`、`transcript_path`、`cwd`、`permission_mode`、`hook_event_name`,再加上各事件的专有字段。

`PreToolUse` 收到的 JSON 长这样:

```json
{
  "session_id": "abc123",
  "hook_event_name": "PreToolUse",
  "tool_name": "Bash",
  "tool_input": {
    "command": "rm -rf /tmp/data"
  }
}
```

`PostToolUse` 则多一个 `tool_response`,告诉你工具执行的结果:

```json
{
  "hook_event_name": "PostToolUse",
  "tool_name": "Write",
  "tool_input": { "file_path": "/path/to/file.py", "content": "..." },
  "tool_response": { "filePath": "/path/to/file.py", "success": true }
}
```

> 💡 **关键洞察**:hook 拿到的不是模糊的「事件发生了」,而是**结构化的、带完整参数的上下文**。`tool_input.command` 让你能精确判断这条命令危不危险;`tool_input.file_path` 让你能精确判断这个文件该不该写。这是比 git hooks 更丰富的输入,也是为什么 Claude Code hooks 能做更精细的护栏。

### 4.4 输出契约:退出码 + JSON

hook 怎么「表达态度」?两条路:简单的用退出码,高级的用 JSON。

**退出码契约**(和 git hooks 一脉相承,但语义更细):

| 退出码 | 含义 | 行为 |
|:-----:|------|------|
| `0` | 成功 | stdout 进入 transcript(`UserPromptSubmit`/`SessionStart` 则进入上下文) |
| `2` | **阻断错误** | **stderr 会被喂回给 Claude**,让它自动处理 |
| 其他 | 非阻断错误 | stderr 仅给用户看,执行继续 |

注意 `exit 2` 的精妙:你的报错信息会被**当作反馈交给 Claude 本身**,于是 Claude 会「看到」你为什么不让它干这件事,并尝试换一种方式。这是 git hooks 没有的闭环——git hooks 的报错是给人看的,Claude Code hooks 的报错是给 AI 看的。

**JSON 输出**能做更精细的控制,不同事件支持的字段不同:

- `PreToolUse`:`{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow|deny|ask","permissionDecisionReason":"..."}}` —— 直接决定工具调用是放行、拒绝、还是弹窗问用户。
- `PostToolUse`:`{"decision":"block","reason":"..."}` —— 工具已跑完,但你可以让 Claude 知道「这次结果有问题」。
- `UserPromptSubmit`:`{"decision":"block","reason":"..."}` 擦除并拒绝 prompt,或用 `additionalContext` 给 prompt 偷偷塞上下文。
- `Stop`:`{"decision":"block","reason":"..."}` —— 阻止 Claude 停下来,要求它继续(比如「测试还没过,别停」)。
- `SessionStart`:`{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"..."}}` —— 把项目背景注入会话。

> 💡 最强大的模式是 **`PreToolUse` 的 `permissionDecision`**:你可以在 hook 里写一段判断逻辑,对安全的只读操作返回 `allow`(跳过权限系统,加速),对危险操作返回 `deny`(直接拦截并告知原因),对模糊操作返回 `ask`(交给用户决定)。这等于用代码**自定义了一套权限策略**。

### 4.5 真实案例:用 20 行 bash 写一个 hook

理论讲完,看一个我真实在用的 hook——`detect-task-complete.sh`,它挂在 `PostToolUse` 的 `TaskUpdate` matcher 上,作用是「当某个任务被标记为 completed 时,自动扫描它产出的技能、标记为可升级」:

```bash
#!/bin/bash
# Hook: 检测任务完成并标记技能升级待处理
# 触发时机: TaskUpdate 将任务状态设为 completed 时

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"
init_colors
check_jq || exit 0   # 没装 jq 就静默放行,不阻断主流程

# 1. 读 stdin,解析 JSON
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // ""')
TASK_ID=$(echo "$INPUT" | jq -r '.tool_input.taskId // ""')
NEW_STATUS=$(echo "$INPUT" | jq -r '.tool_input.status // ""')

# 2. 只处理 TaskUpdate 且状态为 completed 的情况,否则放行
if [ "$TOOL_NAME" != "TaskUpdate" ] || [ "$NEW_STATUS" != "completed" ]; then
  exit 0
fi

# 3. 扫描该任务产出的 k_ 技能目录
K_SKILLS=()
for skill_dir in "$SKILLS_DIR"/${TASK_ID}_*; do
  if [ -d "$skill_dir" ] && [ -f "$skill_dir/SKILL.md" ]; then
    K_SKILLS+=("$(basename "$skill_dir")")
  fi
done
[ ${#K_SKILLS[@]} -eq 0 ] && exit 0

# 4. 原子更新任务文件,标记 upgrade_pending
SKILLS_JSON=$(printf '%s\n' "${K_SKILLS[@]}" | jq -R . | jq -s .)
atomic_json_update "$TASKS_FILE" \
    --arg tid "$TASK_ID" --argjson skills "$SKILLS_JSON" \
    '.tasks[$tid].upgrade_pending = true | .tasks[$tid].upgrade_candidates = $skills'

# 5. 输出提示(stdout 进入 transcript),正常退出
echo -e "${GREEN}📋 任务完成,已记录可升级技能${NC}"
echo -e "${BLUE}可升级技能${NC}: ${K_SKILLS[*]}"
exit 0
```

这个脚本几乎是一个 **hook 编写的标准骨架**,五个步骤拆开看:

1. **读输入**:`cat` 读 stdin,`jq` 解析出 `tool_name` 和 `tool_input` 里的字段;
2. **守卫判断**:不是我要管的事件就 `exit 0` 放行——这极其重要,hook 必须对「不相关」的事件保持静默;
3. **业务逻辑**:扫描文件系统,找到这个任务产生的技能;
4. **副作用**:用原子操作更新一个 JSON 任务文件;
5. **输出**:`echo` 到 stdout(进入 transcript 给用户看),`exit 0`(非阻断)。

> ⚠️ **注意它的「不阻断」哲学**:这是个 `PostToolUse` hook,工具(`TaskUpdate`)已经执行完了,拦也拦不住。所以它选择「不拦,只观察+记录副作用」——这正是 `PostToolUse` 类 hook 的正确姿态:做善后,不做拦截。

记住这个五步骨架(读输入 → 守卫 → 逻辑 → 副作用 → 输出),你就能写出 90% 的 Claude Code hook。

---

## 5. 实战:我用 hooks 给 Claude Code 装了一套「Agent 的 APM」

这一章讲我怎么用 hook,把 Claude Code 从一个黑盒,变成一个**全程可观测的系统**。

### 5.1 痛点:AI agent 是个黑盒

重度用了几个月 Claude Code 之后,我最深的痛点不是「它不够聪明」,而是「**我不知道它到底干了什么**」。

一个会话结束,Claude 修改了几十个文件、跑了几十条命令、调了几次 MCP 工具——但我只能看到最终结果。它在哪里卡了 3 分钟?哪类工具调用最频繁?哪个 session 烧的 token 最多?哪些操作反复失败?**一无所知。**

这就好比跑一个后端服务,却没有 metrics、没有日志、没有 tracing。你能忍受吗?不能。那为什么能忍受 agent 是黑盒?

### 5.2 方案:全事件上报 + 可视化

我的解法是:用 hook 把 Claude Code 的**每一次关键事件都上报出去**,落库,再用一个独立的工具可视化。

核心就是一段几乎「订阅了一切」的 hook 配置(下面是泛化版,真实路径已替换):

```json
{
  "hooks": {
    "UserPromptSubmit": [{ "hooks": [{ "type": "command",
        "command": "AI_PAD_SOURCE=claude_code bash \"$HOME/.ai-pad/hooks/sender.sh\"" }] }],
    "SessionStart":     [{ "hooks": [{ "type": "command",
        "command": "AI_PAD_SOURCE=claude_code bash \"$HOME/.ai-pad/hooks/sender.sh\"" }] }],
    "PreToolUse":  [{ "matcher": "*", "hooks": [{ "type": "command",
        "command": "AI_PAD_SOURCE=claude_code bash \"$HOME/.ai-pad/hooks/sender.sh\"" }] }],
    "PostToolUse": [{ "matcher": "*", "hooks": [{ "type": "command",
        "command": "AI_PAD_SOURCE=claude_code bash \"$HOME/.ai-pad/hooks/sender.sh\"" }] }],
    "Stop":        [{ "hooks": [{ "type": "command",
        "command": "AI_PAD_SOURCE=claude_code bash \"$HOME/.ai-pad/hooks/sender.sh\"" }] }]
  }
}
```

我把这套系统叫 **AI_PAD**(可以理解成一个「AI 活动数据采集器」)。它的数据流非常清晰:

```
Claude Code 事件 ──hook 触发──▶  sender.sh ──HTTP──▶  落库  ──▶  cc-insights 可视化
```

`sender.sh` 收到 stdin 里的 JSON,补上时间戳和来源标记,异步发到一个本地服务。注意是**异步上报、立即 `exit 0`**——这是可观测类 hook 的铁律:**绝不能让「记录」拖慢「执行」**(见第 7 节)。

### 5.3 一个有趣的发现:hook 是「开放契约」

在写这套系统时,我发现了一件有意思的事。我的配置里,除了官方那 9 个事件,还出现了 `PostToolBatch`、`PostToolUseFailure`、`PermissionRequest`、`PermissionDenied` 这样的**事件名**。

但如果你翻官方文档,会发现——**它们并不存在**。

这不是 bug,而是一个深刻的设计特性的体现:**Claude Code 的 hook 是一个开放的契约**。它只规定了「事件名 → 一组 hook」这样的结构,以及「stdin 给 JSON、退出码/JSON 返回」这样的协议。至于「事件名叫什么」「谁来产生事件」,并没有被锁死。

> 💡 **hook 是开放契约**:正因为它的协议极简(一个 JSON 进、一个退出码/JSON 出),任何人都可以在这层契约之上**扩展自己的事件总线**。AI_PAD 把「一批工具调用结束」「工具调用失败」「权限请求」「权限被拒」也抽象成事件,从而能比官方默认事件更细粒度地描述 agent 的行为。这是 git hooks 做不到的——git 的事件是写死在 git 二进制里的,你只能用 git 给你的那几个。

换句话说:**git hooks 是一个「你只能订阅」的闭口系统;Claude Code hooks 是一个「你可以扩展」的开口系统。** 这个差异,折射出两种工具截然不同的设计哲学——git 是「确定的、封闭的版本控制工具」,而 Claude Code 是「可编程的、开放的代理运行时」。

### 5.4 cc-insights:把 hook 数据变成洞察

光采集不分析,等于没采集。于是我写了 [`cc-insights`](https://github.com/gqy20/cc-insights)(Go 实现)——它读取 hook 上报的数据,渲染成图表。

里面有两个和 hook 直接相关的组件:

- **`EventHookChart`**:按事件类型(`PreToolUse` / `PostToolUse` / `Stop` ...)统计触发频次,让你一眼看出 agent 最「活跃」在哪个环节;
- **`HookStatChart`**:按工具名(`Bash` / `Write` / `Edit` / `mcp__*`)统计,看出 agent 最依赖哪些工具。

有了这些,那些原本无形的疑问就有了答案:「这个 session 大部分时间花在了反复 `Bash` 跑测试上」「`Write` 调用次数异常高,说明 agent 在大量重写而非增量编辑」「`Task` 子代理的 `SubagentStop` 频次和 token 消耗强相关」。

> 💡 **这就是「AI Agent 的 APM」**。后端有 Datadog、SkyWalking 做应用性能监控;CI 有 GitHub Actions 的运行时长统计;而 AI agent 时代,我们用 **hook + 一个采集器 + 一个看板**,给 agent 装上同样的可观测性。把这套和第 2 节的 git `post-receive` 通知对比一下:git 的可观测是「一次推送触发一次通知」的离散事件;Claude Code 的可观测是「全链路、全工具调用」的连续观测——**维度从「一个 commit」升级到了「整个 agent 行为」**。

---

## 6. git hooks × Claude Code hooks:两层防线如何协同

讲到现在,你可能会问:既然有了 Claude Code hooks,还要 git hooks 吗?**要,而且两者必须协同。** 它们守的是不同的关卡,缺一不可。

### 6.1 一个完整工作流的两层防线

想象一条从「Claude 开始写代码」到「代码进入主干」的完整流水线,两层 hook 各司其职:

```
Claude 写代码
   │
   ├─▶ 【agent 行为层】PostToolUse hook:每次 Write/Edit 后检查、追踪
   │      └─ 作用域:agent 的每一次操作,实时
   │
   ├─▶ Claude 自己执行 git commit
   │      │
   │      └─▶ 【代码质量层】pre-commit hook:lint、格式化、类型检查
   │             └─ 作用域:将要进入版本库的 diff
   │
   └─▶ git push
          │
          └─▶ 【最终闸门】pre-push / 服务端 hook:测试、权限、CI
                 └─ 作用域:将要进入远程仓库的提交
```

- **agent 行为层**(Claude Code hooks)管「**过程**」:拦危险操作、注入上下文、记录行为。它的特点是**实时、细粒度、只对当前会话的 agent 生效**。
- **代码质量层**(git hooks)管「**产物**」:不管是谁(人 or AI)提交的代码,到了 commit 这一刻,都要过同样的 lint/format/测试。它的特点是**延迟、统一、对所有人强制生效**。

为什么两层都要?因为 agent 行为层的 hook 只对「开了 Claude Code 的人」有效;而团队里总有人用别的工具、或者 agent 偶尔绕过了 hook。**git hooks 是最后那道「不分来源、一律平等」的底线。** 这也是为什么我的 `quick-template` 模板里,会**同时**预置 `.pre-commit-config.yaml` 和 `.claude/` 目录——一个项目从模板生成出来,就同时拥有了两层防线。

### 6.2 两者对比:何时用谁

| 维度 | git hooks | Claude Code hooks |
|------|-----------|-------------------|
| **触发主体** | git 命令(commit/push) | agent 工具调用/会话事件 |
| **检查对象** | 即将入库的代码 diff | agent 的每一次行为 |
| **拦截能力** | 阻断 commit/push | 阻断工具调用、改写输入 |
| **生效范围** | 所有人(含 CI) | 仅开 Claude Code 的人 |
| **跨团队共享** | 进版本控制即可 ✅ | 进 `.claude/settings.json` 即可 ✅ |
| **可观测性** | 弱(只有 commit 日志) | 强(全链路事件) |
| **超时风险** | 拖慢 commit | 60s 超时 + 阻塞主循环 |

### 6.3 反模式:别在 hook 里做重活

最后提醒一个最常见的坑——**hook 里干重活**。

- git 端:有人在 `pre-commit` 里跑全量测试套件,结果每次 `git commit` 都要等两分钟,大家忍无可忍开始无脑 `--no-verify`。hook 一旦拖慢主流程,就形同虚设。
- Claude Code 端:官方默认每个 hook **60 秒超时**,且 hook 是**串行阻塞**主循环的。你要是在 `PostToolUse` 里同步调一个慢 API,agent 就会卡在那里干等。

> ⚠️ **铁律**:hook 必须快、必须轻。需要重活(全量测试、慢 API、大模型调用)时,把任务**异步化**——hook 只负责「丢一个任务到队列」,然后立刻 `exit 0`。我的 `sender.sh` 就是这么做的:采集到事件后异步上报,瞬间返回,绝不阻塞 Claude 的执行。

---

## 7. 设计哲学:写好一个 hook 的五条军规

不管 git hooks 还是 Claude Code hooks,写好一个 hook 的原则是相通的。这是我在十几个项目里反复验证的五条:

1. **⚡ 快**:hook 跑在关键路径上,必须毫秒级返回。能用缓存就别重新计算,能异步就别同步。**一个慢 hook 会毁掉整个工作流。**
2. **📢 可失败**:hook 失败时,要么明确阻断并给出**可读的原因**(给用户/给 AI),要么静默放行——最忌讳「半失败、不说话」,留下难以排查的诡异行为。
3. **🔁 幂等**:同一个事件可能被触发多次(尤其 Claude Code 的工具调用)。你的 hook 副作用必须是幂等的——重复执行不应产生重复记录或累计错误。
4. **👁️ 可观测**:hook 自己也要记日志。否则 hook 出了问题,你连「是哪个 hook、在哪一步、为什么」都不知道,调试地狱。
5. **🔒 最小权限**:这是安全底线——用**绝对路径**调用脚本、**跳过敏感文件**(`.env`、`.git/`、密钥目录)、**引号包裹所有变量**(`"$VAR"` 而非 `$VAR`)、检查路径穿越(`..`)。官方文档也反复强调这一点,因为 **hook 会自动执行任意 shell 命令**——它是能力,也是攻击面。

> 💡 **一句话总结这五条**:hook 是「在高速公路上设置的检查站」——它必须快(不堵车)、准(该拦才拦)、稳(反复跑也不出错)、亮(自己有监控)、严(不放过危险品)。

---

## 8. 总结:hooks 是人机协作的契约语言

回到开篇那个开发者被两道拦截的故事。现在你应该能看清——那两道拦截不是巧合,而是**同一种思想在两个时代的投影**。

git hooks 让一个团队对齐了「**代码质量**」:无论谁提交,都要过同样的 lint、同样的测试。它把团队规范固化成了不可绕过的(好吧,`--no-verify` 可绕过的)检查站。

Claude Code hooks 让人类对齐了「**AI 行为**」:无论 agent 多自主、多快速,在关键的时刻,它都必须接受人类预先写好的意志——什么不能做、做完要汇报、危险要停下。

**而「hook」这个机制本身,就是人机协作的契约语言。**

当 AI agent 越来越多地替我们写代码、跑运维、做决策,我们最需要的不是更强的模型,而是一套**可靠的、可审计的、可扩展的接口**,让我们能定义「什么能做、什么不能做、做完要知道」。hook,就是这套接口。git 在 2005 年用 `.git/hooks` 给了我们第一版;Claude Code 在 2025 年用 `settings.json` 的 hooks 给了我们针对 AI agent 的第二版;而我在 2026 年用 AI_PAD 证明了——**因为它是一个开放契约,所以第三版、第四版,可以由我们每个人自己写。**

下次当你给项目加一个 hook,不管是在 `.pre-commit-config.yaml` 里加一行,还是在 `.claude/settings.json` 里加一段,记得:你写的不是一段脚本,而是**你和代码执行者(人或 AI)之间的一份契约**。

> 🚀 写好它。

---

## 参考链接

**官方文档**
- [Git Hooks 官方文档(githooks)](https://git-scm.com/docs/githooks) —— 所有 git hooks 的权威定义
- [Pro Git: Customizing Git - Git Hooks](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks) —— 客户端/服务端 hooks 详解
- [Claude Code Hooks Reference](https://docs.claude.com/en/docs/claude-code/hooks) —— 9 大事件与输入/输出契约
- [pre-commit framework](https://pre-commit.com/) —— 声明式、跨语言的 git hooks 管理框架

**本文引用的我的开源项目**
- [`quick-template`](https://github.com/gqy20/quick-template) —— 文中 `.pre-commit-config.yaml` 与「同时预置两层防线」模板的来源
- [`Skills_demo`](https://github.com/gqy20/Skills_demo) —— 文中真实 `settings.json` hook 配置与 `detect-task-complete.sh` 的来源
- [`cc_plugins`](https://github.com/gqy20/cc_plugins) —— Claude Code 插件/hook 脚本集合
- [`cc-insights`](https://github.com/gqy20/cc-insights) —— 第 5 节「Agent 的 APM」可视化工具(Go)
