# Claude Agent SDK 使用指南

> 创建时间: 2026/04/23
> 状态: 规划中

## 背景

参考用户项目中 Claude Agent SDK 的实际使用经验，整理最佳实践，用于实现 GitHub 每日定时总结功能。

## 参考项目

| 项目 | SDK | 关键用法 |
|------|-----|---------|
| `gqy20/Skills_demo` | npm `@anthropic-ai/claude-agent-sdk` ^0.2.63 | `query()` 流式处理、`canUseTool` 权限处理、`buildQueryOptions` 封装、Session 管理 |
| `gqy20/biotools_agent` | pip `claude_agent_sdk` | 单一全栈代理架构、`async for` 迭代、`ClaudeAgentOptions`、`output_format` JSON Schema 验证 |
| `gqy20/rss2cubox` | pip `claude_agent_sdk` | MCP Server 集成、`output_format` 结构化输出、重试逻辑（指数退避）、多 Agent 协作 |
| `gqy20/TrendPluse` | pip `claude_agent_sdk` | **完整生产级模式**：重试机制、超时保护、Metrics 收集、stderr 日志、并发控制、Pydantic 模型验证 |
| `qwibitai/nanoclaw` | npm `@anthropic-ai/claude-agent-sdk` ^0.2.34 | `hooks: { PreCompact, PreToolUse }`、`for await` 迭代、Poll Loop 模式 |

---

## TypeScript SDK 用法（Skills_demo）

### 核心导入

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";
import type { RuntimeSettings } from "../types.js";
```

### 构建运行时环境

```typescript
export function buildRuntimeEnv(settings: RuntimeSettings): Record<string, string | undefined> {
  return {
    ...process.env,
    ANTHROPIC_MODEL: settings.model,
    ANTHROPIC_BASE_URL: settings.baseUrl,
    ANTHROPIC_AUTH_TOKEN: settings.authToken
  };
}
```

### 权限模式

```typescript
export function buildPermissionRuntimeOptions(settings: RuntimeSettings) {
  if (settings.permissionProfile === "accept_edits") {
    return { permissionMode: "acceptEdits" };
  }
  if (settings.permissionProfile === "full_auto") {
    return { permissionMode: "bypassPermissions", allowDangerouslySkipPermissions: true };
  }
  return { permissionMode: "default" };
}
```

### 查询选项构建

```typescript
export function buildQueryOptions(
  workspaceRoot: string,
  settings: RuntimeSettings,
  sessionId: string,
  sdkSessionId: string | undefined,
  extra: Partial<Parameters<typeof query>[0]["options"]> = {}
) {
  const base = {
    cwd: workspaceRoot,
    env: buildRuntimeEnv(settings),
    includePartialMessages: true,
    ...(sdkSessionId ? { resume: sdkSessionId } : { sessionId }),
    ...extra
  };

  if (settings.speedModeEnabled) {
    base.settingSources = [];
    base.thinking = { type: "disabled" };
  } else {
    base.settingSources = ["user", "project", "local"];
  }

  Object.assign(base, buildPermissionRuntimeOptions(settings));
  return base;
}
```

### 执行查询

```typescript
const queryInstance = query({
  prompt: promptForQuery,
  options: buildQueryOptions(workspace.root, settings, sessionId, sdkSessionId, {
    canUseTool: canUseToolHandler
  })
});

for await (const event of queryInstance) {
  if (event.type === "result") { /* 处理结果 */ }
  if (event.type === "tool_use") { /* 处理工具调用 */ }
}
```

### 工具权限处理

```typescript
import { query, type PermissionResult, type PermissionUpdate } from "@anthropic-ai/claude-agent-sdk";

const canUseToolHandler = async (
  toolName: string,
  input?: unknown,
  hookOptions?: { toolUseID?: string; suggestions?: PermissionUpdate[] }
): Promise<PermissionResult> => {
  // MCP 工具默认允许
  if (toolName.startsWith("mcp__")) {
    return { behavior: "allow", updatedInput: input as Record<string, unknown> };
  }
  // 标准权限模式
  if (gateEnabled) {
    return decisionPromise; // 等待用户授权
  }
  return { behavior: "allow", updatedInput: input as Record<string, unknown> };
};
```

---

## Python SDK 用法（biotools_agent）

### 核心导入

```python
from claude_agent_sdk import query, ClaudeAgentOptions
```

### 创建代理配置

```python
options = ClaudeAgentOptions(
    allowed_tools=["Read", "Write", "Edit", "Glob", "Grep", "Bash", "WebSearch", "WebFetch"],
    agents=PROJECT_AGENTS,
    model="sonnet",
    permission_mode="acceptEdits",
    cwd=str(repo_path),
    max_thinking_tokens=200000,
    include_partial_messages=True,
    mcp_servers=mcp_servers,
)
```

### 异步迭代查询

```python
query_iterator = query(prompt=task_prompt, options=options)

async for message in query_iterator:
    if hasattr(message, "result"):
        result = message.result
    if hasattr(message, "error"):
        error = message.error
```

---

## Python SDK 用法（rss2cubox）

### MCP Server 配置

```python
from claude_agent_sdk import query, ClaudeAgentOptions

server = create_sdk_mcp_server(
    name="insights-tools",
    version="1.0.0",
    tools=[read_signals_file, read_webpage],
)

options = ClaudeAgentOptions(
    system_prompt=SYSTEM_PROMPT,
    allowed_tools=["mcp__insights-tools__*", "Skill"],
    mcp_servers={"insights-tools": server},
    permission_mode="acceptEdits",
    max_turns=100,
    cwd=Path.cwd(),
    output_format={"type": "json_schema", "schema": GLOBAL_OUTPUT_SCHEMA},
)
```

### 带重试的查询

```python
for attempt in range(MAX_RETRIES + 1):
    async for message in query(prompt=prompt, options=options):
        if isinstance(message, ResultMessage):
            if message.structured_output:
                result = message.structured_output
            elif message.result:
                result = json.loads(message.result)
```

---

## Python SDK 生产级模式（TrendPluse）

TrendPluse 展示了完整的生产级 Agent 用法模式。

### Agent Runner 完整实现

```python
from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage
from pydantic import ValidationError
import asyncio

class IssueAgentRunner:
    def __init__(
        self,
        retry_max_attempts: int = 3,
        retry_wait_seconds: float = 1.0,
        total_timeout_seconds: float = 900.0,
        max_concurrency: int = 4,
        max_turns: int = 50,
        max_budget_usd: float = 10.0,
    ) -> None:
        self.retry_max_attempts = retry_max_attempts
        self.retry_wait_seconds = retry_wait_seconds
        self.total_timeout_seconds = total_timeout_seconds
        self.max_concurrency = max_concurrency
        self.max_turns = max_turns
        self.max_budget_usd = max_budget_usd

    async def analyze_file(self, input_path: Path, output_path: Path) -> str:
        for attempt in range(1, self.retry_max_attempts + 1):
            try:
                validated = await self._run_with_total_timeout(
                    self._run_single_round_analysis(input_path)
                )
                return self._serialize(validated)
            except ValidationError as exc:
                logger.warning(f"输出校验失败，准备重试: attempt={attempt}")
                if attempt >= self.retry_max_attempts:
                    raise
                if self.retry_wait_seconds > 0:
                    await asyncio.sleep(self.retry_wait_seconds)

    async def _run_agent_query(self, prompt: str) -> str:
        options = ClaudeAgentOptions(
            allowed_tools=["Read"],
            output_format=self._build_output_format(),
            stderr=self._handle_cli_stderr,
            max_turns=self.max_turns,
            max_budget_usd=self.max_budget_usd,
        )

        async for message in query(prompt=prompt, options=options):
            if isinstance(message, ResultMessage):
                if message.structured_output is not None:
                    return json.dumps(message.structured_output)
                if message.result:
                    return message.result

    def _build_output_format(self) -> dict:
        return {
            "type": "json_schema",
            "schema": IssueAgentReport.model_json_schema(),
        }

    async def _run_with_total_timeout(self, coroutine) -> Any:
        async with asyncio.timeout(self.total_timeout_seconds):
            return await coroutine
```

### 并发控制

```python
async def analyze_directory(self, input_dir: Path, output_dir: Path):
    semaphore = asyncio.Semaphore(self.max_concurrency)

    async def _analyze_single(input_path: Path):
        async with semaphore:
            await self.analyze_file(input_path, output_path)

    results = await asyncio.gather(*[_analyze_single(path) for path in files])
```

### Metrics 收集

```python
from trendpluse.models.agent_usage import AgentRunMetrics

async for message in query(prompt=prompt, options=options):
    if isinstance(message, ResultMessage):
        metrics = AgentRunMetrics.from_sdk_result(
            model=self.model,
            session_id=message.session_id,
            num_turns=message.num_turns,
            duration_ms=message.duration_ms,
            duration_api_ms=message.duration_api_ms,
            total_cost_usd=message.total_cost_usd,
            usage=message.usage,
        )
```

### stderr 日志处理

```python
def _build_stderr_handler(self):
    stderr_lines: list[str] = []

    def _handle(message: str) -> None:
        stderr_lines.append(message.strip())
        if len(stderr_lines) > self.stderr_tail_lines:
            del stderr_lines[:-self.stderr_tail_lines]
        logger.debug("Issue Agent SDK stderr: %s", message)

    return _handle
```

---

## nanoclaw Hooks 用法（TypeScript）

### PreCompact - 归档转录本

```typescript
import { query, HookCallback, PreCompactHookInput, PreToolUseHookInput } from '@anthropic-ai/claude-agent-sdk';

function createPreCompactHook(): HookCallback {
  return async (input) => {
    const preCompact = input as PreCompactHookInput;
    const transcriptPath = preCompact.transcript_path;
    const sessionId = preCompact.session_id;

    // 归档到 conversations/
    const conversationsDir = '/workspace/group/conversations';
    const date = new Date().toISOString().split('T')[0];
    const filename = `${date}-${sessionId}.md`;

    fs.mkdirSync(conversationsDir, { recursive: true });
    fs.writeFileSync(path.join(conversationsDir, filename), markdown);

    return {};
  };
}
```

### PreToolUse - 清理 secrets

```typescript
const SECRET_ENV_VARS = ['ANTHROPIC_API_KEY', 'CLAUDE_CODE_OAUTH_TOKEN'];

function createSanitizeBashHook(): HookCallback {
  return async (input) => {
    const preInput = input as PreToolUseHookInput;
    const command = preInput.tool_input.command;
    const unsetPrefix = `unset ${SECRET_ENV_VARS.join(' ')} 2>/dev/null; `;

    return {
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        updatedInput: { ...preInput.tool_input, command: unsetPrefix + command }
      }
    };
  };
}
```

### 使用 Hooks

```typescript
for await (const message of query({
  prompt: stream,
  options: {
    hooks: {
      PreCompact: [{ hooks: [createPreCompactHook()] }],
      PreToolUse: [{ matcher: 'Bash', hooks: [createSanitizeBashHook()] }]
    }
  }
})) { }
```

---

## GitHub Daily Summary 实现

### 技术方案

1. GitHub Actions 定时触发（每天一次）
2. 使用 Claude Agent SDK 的 `query()` 函数
3. Agent 调用 GitHub API 获取用户所有项目
4. 分析变更：commits、PRs、issues 等
5. 生成结构化 JSON 输出

### JSON 输出格式

```json
{
  "date": "2026-04-23",
  "summary": {
    "total_commits": 15,
    "projects_updated": 5,
    "new_projects": 0,
    "total_stars": 20,
    "total_prs": 2,
    "total_issues": 3
  },
  "projects": [
    {
      "name": "gqy20.github.io",
      "commits": 3,
      "changes": ["feat: add new animation", "fix: resolve bug"],
      "category": "web"
    }
  ],
  "growth": {
    "skills": ["React", "TypeScript"],
    "domains": ["Web Development", "AI Tools"]
  }
}
```

### Python 实现（生产级）

```python
# scripts/github-daily-summary.py
import asyncio
import json
from datetime import datetime, timezone
from pathlib import Path
from pydantic import BaseModel, Field
from claude_agent_sdk import ClaudeAgentOptions, ResultMessage, query

class DailySummaryResult(BaseModel):
    date: str
    summary: dict = Field(description="总体统计")
    projects: list[dict] = Field(description="项目变更列表")
    growth: dict = Field(description="技能和领域成长")

class GitHubSummaryAgent:
    def __init__(
        self,
        max_turns: int = 30,
        max_budget_usd: float = 3.0,
        retry_max_attempts: int = 2,
    ):
        self.max_turns = max_turns
        self.max_budget_usd = max_budget_usd
        self.retry_max_attempts = retry_max_attempts

    async def run(self) -> DailySummaryResult:
        prompt = self._build_prompt()
        result_text = await self._run_with_retry(prompt)
        return DailySummaryResult.model_validate_json(result_text)

    def _build_prompt(self) -> str:
        return """请分析 gqy20 (https://github.com/gqy20) 今天的所有 GitHub 活动：

1. 使用 Bash 调用 GitHub API 获取用户公开仓库列表
2. 获取每个仓库最近 24 小时的提交记录
3. 统计总提交数、更新项目数、Stars 变化、PRs、Issues
4. 总结技术栈和领域变化

输出严格 JSON 格式：
{
  "summary": {"total_commits": 0, "projects_updated": 0, ...},
  "projects": [...],
  "growth": {"skills": [...], "domains": [...]}
}"""

    async def _run_with_retry(self, prompt: str) -> str:
        options = ClaudeAgentOptions(
            allowed_tools=["Bash", "WebFetch"],
            output_format={"type": "json_schema", "schema": DailySummaryResult.model_json_schema()},
            max_turns=self.max_turns,
            max_budget_usd=self.max_budget_usd,
        )

        for attempt in range(1, self.retry_max_attempts + 1):
            async for message in query(prompt=prompt, options=options):
                if isinstance(message, ResultMessage):
                    if message.structured_output:
                        return json.dumps(message.structured_output)
                    if message.result:
                        return message.result

            if attempt < self.retry_max_attempts:
                await asyncio.sleep(2 ** attempt)  # 指数退避

        raise RuntimeError("Failed to get summary after retries")

async def main():
    agent = GitHubSummaryAgent()
    result = await agent.run()

    output_path = Path(__file__).parent.parent / "src" / "data" / "daily-summary.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(result.model_dump_json(indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Summary written to {output_path}")

if __name__ == "__main__":
    asyncio.run(main())
```

### TypeScript 实现（参考 Skills_demo）

```typescript
// scripts/github-daily-summary.ts
import { query } from "@anthropic-ai/claude-agent-sdk";
import { writeFileSync } from "fs";

async function main() {
  let result = "";

  for await (const message of query({
    prompt: `分析 gqy20 今天的所有 GitHub 活动...`,
    options: {
      cwd: process.cwd(),
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
      allowedTools: ["Bash", "WebFetch"],
      thinking: { type: "disabled" },
    }
  })) {
    if (message.type === "result") {
      result = (message as { result?: string }).result || "";
    }
  }

  const summary = JSON.parse(result);
  writeFileSync("src/data/daily-summary.json", JSON.stringify(summary, null, 2));
  console.log(`Daily summary written for ${summary.date}`);
}

main().catch(console.error);
```

---

## GitHub Actions 工作流

### Python 版本（推荐）

```yaml
name: Daily GitHub Summary
on:
  schedule:
    - cron: '0 8 * * *'  # 每天 UTC 8点 (=北京时间16点)
  workflow_dispatch:

jobs:
  summary:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: pip install claude-agent-sdk pydantic
      - name: Run Claude Agent Summary
        run: python scripts/github-daily-summary.py
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
      - name: Commit summary
        run: |
          git config --local user.email "github-actions[bot]@users.noreply.github.com"
          git config --local user.name "github-actions[bot]"
          git add src/data/daily-summary.json
          git diff --staged --quiet || git commit -m "docs: update daily summary"
          git push
```

### TypeScript 版本

```yaml
name: Daily GitHub Summary
on:
  schedule:
    - cron: '0 8 * * *'
  workflow_dispatch:

jobs:
  summary:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm install @anthropic-ai/claude-agent-sdk
      - name: Run Claude Agent Summary
        run: npx tsx scripts/github-daily-summary.ts
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
      - name: Commit summary
        run: |
          git config --local user.email "github-actions[bot]@users.noreply.github.com"
          git config --local user.name "github-actions[bot]"
          git add src/data/daily-summary.json
          git diff --staged --quiet || git commit -m "docs: update daily summary"
          git push
```

---

## 实现文件

**新建文件**:
- `scripts/github-daily-summary.py` 或 `scripts/github-daily-summary.ts` - Claude Agent SDK 脚本
- `src/data/daily-summary.json` - 每日总结数据（提交到 repo）
- `.github/workflows/daily-summary.yml` - 定时工作流

## 验证方式

- 手动触发 GitHub Actions 工作流
- 检查 `src/data/daily-summary.json` 是否正确生成
- 验证 JSON 格式和内容完整性
