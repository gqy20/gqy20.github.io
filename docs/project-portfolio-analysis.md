# Project Portfolio Analysis and Homepage Direction

Date: 2026-04-23

Source: GitHub repository metadata, README files, root file lists, topics, stars, forks, and recent activity queried with `gh`.

Scope note: the GitHub account currently has 58 repositories visible to the local `gh` session: 38 public and 20 private. This document is safe for the public homepage repository, so private repositories are discussed only as high-level signals without exposing private implementation details.

## Core Finding

The portfolio is not mainly "research tools". It is better understood as:

> AI agents, tool interfaces, and automation systems for real workflows.

The recurring pattern across the repositories is:

1. Turn unstructured intent into an executable workflow.
2. Give AI systems tools and external data access.
3. Automate knowledge work, coding work, research work, media work, or personal productivity.
4. Package those workflows as CLIs, MCP servers, web apps, reports, or agent systems.

That means the homepage should not present a generic personal profile or a flat GitHub project grid. It should present a coherent builder identity: someone designing agentic software that connects models, tools, data, and actions.

## Portfolio Clusters

### 1. Agent Systems and Multi-Agent Experiences

These projects show the clearest future-facing identity.

| Project | Signal | Homepage Role |
| --- | --- | --- |
| `TrumanWorld` | Multi-agent social simulation, generative agents, FastAPI/Next.js, strong concept and highest visual potential. | Flagship. It should be treated as an AI world / agent simulation system, not just a repo. |
| `IssueLab` | GitHub Issues based multi-agent discussion network with digital participants and traceable debate. | Flagship. It proves agent collaboration, governance, and async knowledge work. |
| `mind` | Supporter vs challenger agent conversation for idea generation. | Supporting project under agent collaboration. |
| `manim-agent` | Natural language to Manim animation with render-review-iterate loop and TTS. | Flagship candidate for agentic creation / media automation. |
| `Skills_demo` | Claude Code Skills based adaptive assistant with tool gates and workspace switching. | Strong evidence for AI assistant infrastructure and human-in-the-loop agent UX. |
| `mcp_agent` | Batch MCP testing framework with AI test generation and tool quality scoring. | Infrastructure proof for evaluating tool ecosystems. |

Design implication: the homepage should put "agent systems" first. A visitor should see that the author is experimenting with agents as systems with memory, tools, workflows, evaluation, and interaction design.

### 2. MCP and Tool Interface Layer

These projects are the technical backbone. They should be framed as "tool interfaces for AI agents", not as isolated MCP demos.

| Project | Signal | Homepage Role |
| --- | --- | --- |
| `article-mcp` | Literature search MCP; strongest public MCP by stars. | Representative MCP server. |
| `crawl-mcp` | Web crawling and AI analysis MCP based on crawl4ai and FastMCP. | Key data acquisition tool. |
| `genome-mcp` | Gene information, homolog analysis, evolution analysis, semantic search. | Domain-specific tool layer. |
| `protein-mcp` | Protein structure/data access tools for bioinformatics. | Domain-specific MCP example. |
| `astro_light_pollution` | Astronomy observation and light pollution analysis via FastMCP. | Good proof that MCP can generalize beyond biology. |
| `mcp_web` | Private MCP tool tester. | Private signal: there is work on MCP testing UX, but do not expose details publicly. |
| `mcp_evaluate` | Private MCP evaluation server. | Private signal: tool evaluation and registry thinking. |
| `batch_mcp` | Private tool-calling experiments. | Private signal: early tool-calling exploration. |

Design implication: MCP should be a "capability layer" section. The message should be: "I design tools that make AI systems able to act in real environments."

### 3. Knowledge Work, Research Workflows, and Information Intelligence

This is a major body of work. It should be framed as AI for knowledge workflows, not just academic utilities.

| Project | Signal | Homepage Role |
| --- | --- | --- |
| `zotero_cli` | AI-native Zotero CLI for Claude Code/Codex; search, read PDFs, manage annotations, citations. | Flagship. This is one of the strongest signals for AI agents operating real knowledge systems. |
| `pdfget` | Search and batch download papers with schema-first JSON output for scripts and agents. | Strong automation utility. |
| `SLAIS` | PDF literature analysis and insight system. | Early but important knowledge-analysis lineage. |
| `pub2tts` | PubMed retrieval, translation, journal enhancement, TTS. | Good example of turning literature into accessible media. |
| `ZoteroFlow` | AI literature recommendation, analysis, semantic search, PDF reading. | Early knowledge-work product exploration. |
| `evo-flywheel` | Automated collection, LLM analysis, and reports for evolutionary biology literature. | Strong "AI research flywheel" example. |
| `rss2cubox` | RSS to Cubox with AI filtering, agent deep analysis, global insights. | Excellent example of personal information automation. |
| `TrendPluse` | AI analysis of GitHub trends, especially AI coding and agents. | Flagship for intelligence/report generation. |
| `llms_txt` | Configurable ingest, validation, classification, scoring, skill generation pipeline. | Supporting infrastructure for AI-readable web content. |

Design implication: the homepage should include "AI for knowledge workflows" as a major application domain. This cluster is large enough to support a dedicated page later.

### 4. Automation, CLI Products, and Personal Operating Systems

These show that the work is not only research-facing. There is a strong CLI/product automation tendency.

| Project | Signal | Homepage Role |
| --- | --- | --- |
| `minimax-studio` | Go CLI for clip, planning, voice, music, stitch, and full video workflows. | Flagship for media automation and AI application workflow. |
| `justdo` | AI-enhanced task CLI with user profiling and web UI. | Personal productivity automation. |
| `flywheel` | Todo CLI with JSON output, locking, StatsD option. | Supporting CLI craft signal. |
| `process-tracker` | Go process monitoring with web UI and statistics. | Automation / observability utility. |
| `homebrew-tap` | Distribution channel for CLI tools. | Packaging and distribution signal. |
| `quick-py` | Copier template for standardized Python projects. | Engineering workflow/tooling signal. |
| `note_wall` | Next.js/Supabase note wall. | General web app capability, lower priority for AI positioning. |

Design implication: "automation systems" should be a first-class positioning phrase. The site should show that the author can package AI ideas into runnable tools, not just prototypes.

### 5. AI Coding and Developer Workflow

This is another coherent direction, especially if the future work targets agent development.

| Project | Signal | Homepage Role |
| --- | --- | --- |
| `cc-insights` | Go tool for Claude Code usage analysis, visualization, pattern discovery, recommendations. | Strong evidence for AI coding observability. |
| `ai_coding` | AI coding guide and workflow documentation. | Writing/learning signal. |
| `cc_plugins` | Claude Code research plugins with analysis workflows and structured thinking. | Developer/research workflow extensions. |
| `codex_test` | Agent SDK interaction experiments. | Early experiment, lower homepage priority. |
| `biotools_agent` | Claude Agent SDK based repository analyzer for bioinformatics tools. | Agentic code/repo analysis applied to domain tools. |

Design implication: the homepage should include "AI coding workflow" or "agent development tooling" as a capability. `cc-insights`, `Skills_demo`, and `cc_plugins` can prove this better than generic GitHub stats.

## Public Project Inventory

### Flagship or Near-Flagship Candidates

| Project | Why It Matters |
| --- | --- |
| `TrumanWorld` | Most conceptually distinct. It suggests imagination, agent architecture, simulation, and product storytelling. |
| `IssueLab` | Strongest multi-agent collaboration / digital participant concept. |
| `zotero_cli` | Best bridge between AI agents and a real user workflow. Very aligned with "agents operating tools". |
| `TrendPluse` | Shows automated intelligence/report generation around AI coding and agent ecosystem. |
| `manim-agent` | Strong example of agentic creative automation with feedback loop. |
| `article-mcp` | Most mature public MCP signal by stars and topic. |
| `genome-mcp` | Strong domain MCP example, but should be framed as "domain tool interface". |
| `cc-insights` | Good AI coding observability story. |
| `minimax-studio` | Strong AI media workflow / CLI product signal. |

### Strong Supporting Projects

| Project | Role |
| --- | --- |
| `pdfget` | Literature acquisition automation. |
| `SLAIS` | Literature analysis lineage. |
| `pub2tts` | Literature to voice / multimodal knowledge workflow. |
| `rss2cubox` | AI information filtering and insight pipeline. |
| `crawl-mcp` | Web context retrieval for agents. |
| `protein-mcp` | Domain MCP example. |
| `astro_light_pollution` | Non-bio domain MCP example. |
| `Skills_demo` | Skills/tool-gate/agent UI signal. |
| `mcp_agent` | MCP ecosystem evaluation/testing signal. |
| `biotools_agent` | Agent SDK applied to repository analysis. |
| `cc_plugins` | Claude Code extension/plugin workflow signal. |
| `justdo` | Personal task automation and profiling. |
| `quick-py` | Engineering template/productization signal. |

### Lower Homepage Priority

| Project | Reason |
| --- | --- |
| `gqy20.github.io` | Site infrastructure, not portfolio content. |
| `gqy20` | Profile/README repo, not a product. |
| `homebrew-tap` | Important as distribution support, but not a featured project. |
| `note_wall` | Web app capability, but not central to AI/agent direction. |
| `codex_test` | Experiment rather than mature portfolio item. |
| `llms_txt` | Useful infrastructure, but needs clearer outcome before homepage prominence. |
| `process-tracker` | Utility, not central to AI positioning. |
| `ZoteroFlow` | Related to `zotero_cli`; avoid splitting attention unless it has a clear current status. |
| `note-gen-image-sync` | Sync artifact; hide. |
| `docker_image_pusher` | Fork; do not use as personal flagship. |
| `zotero-arxiv-daily` | Fork; can be inspiration lineage, not featured work. |

## What the Current Homepage Still Misses

1. It says "AI systems, agents, and workflows", but the project evidence is not yet mapped to the real clusters above.
2. The current workflow map is generic. It should be anchored in actual systems: TrumanWorld, IssueLab, zotero_cli, TrendPluse, manim-agent, MCP servers.
3. It underplays application diversity: literature, coding, media, information filtering, bioinformatics, astronomy, productivity.
4. It still uses GitHub-style metadata in places where product/system outcomes would be stronger.
5. It does not separate "flagship systems" from "supporting tools" and "experiments".

## Recommended Homepage Strategy

### Positioning

Use a sharper sentence:

> Building AI agents and automation systems for real workflows.

Chinese supporting line:

> 我关注 AI 如何进入真实工作流：理解任务、调用工具、处理上下文、执行动作，并通过反馈持续改进。

This is broader and more accurate than "research tools", and more concrete than "AI systems".

### First View

The first viewport should communicate three ideas immediately:

1. Agent systems
2. Tool interfaces
3. Workflow automation

Suggested hero structure:

```text
Qingyu Ge
Building AI agents and automation systems for real workflows.

Agent simulations / MCP tool layers / AI-native knowledge work / coding automation
```

Avoid leading with project counts or stars. Use those as background credibility only.

### Main Sections

1. **Hero**
   Clear identity and two actions: "View systems" and "Read build notes".

2. **Featured Systems**
   4 to 6 selected systems:
   - `TrumanWorld`: multi-agent simulation
   - `IssueLab`: agent discussion network
   - `zotero_cli`: AI-native knowledge CLI
   - `TrendPluse`: trend intelligence pipeline
   - `manim-agent`: agentic video/animation creation
   - `article-mcp` or `genome-mcp`: tool interface layer

3. **Capability Stack**
   Not a generic workflow map. Use actual capabilities:
   - Agent orchestration
   - Tool and MCP interfaces
   - Knowledge retrieval
   - Workflow automation
   - Evaluation and observability
   - Productized CLI/Web delivery

4. **Application Fields**
   Show that the same approach transfers across domains:
   - Developer productivity: `cc-insights`, `Skills_demo`, `cc_plugins`
   - Knowledge and research work: `zotero_cli`, `pdfget`, `SLAIS`, `pub2tts`
   - Information intelligence: `TrendPluse`, `rss2cubox`, `evo-flywheel`
   - Creative/media workflows: `manim-agent`, `minimax-studio`
   - Domain tools: `genome-mcp`, `protein-mcp`, `astro_light_pollution`

5. **Tool Layer**
   A compact MCP/tool map:

   ```text
   Literature -> article-mcp / pdfget / zotero_cli
   Web context -> crawl-mcp
   Biology -> genome-mcp / protein-mcp
   Astronomy -> astro_light_pollution
   Coding -> cc-insights / cc_plugins
   Media -> minimax-studio / manim-agent
   ```

6. **Build Notes**
   Rename blog to "Build Notes" and publish fewer but stronger notes around:
   - How I design agent workflows
   - Why MCP is useful as an agent tool layer
   - Building AI-native CLI tools
   - From prompt experiments to repeatable automation
   - What I learned building multi-agent simulations

## Visual Design Direction

The design should feel like an agent systems lab, not a template portfolio.

Recommended style:

- Typography-led, not avatar-led.
- Calm grid background is fine, but avoid decorative glow as the main identity.
- Use system diagrams and capability maps.
- Use dense but readable cards for systems.
- Prefer "case study" cards over GitHub repo cards.
- Keep navigation minimal.
- Reduce stars/language prominence. Put outcomes, mechanisms, and workflows first.

Avoid:

- Big personal avatar as the main visual.
- Generic "projects / blog / contact" portfolio feeling.
- Treating every repository equally.
- Over-indexing on "科研工具" as the top-level identity.

## Proposed Information Architecture

### Home

Purpose: establish the identity and show flagship systems.

Sections:

1. Hero
2. Featured Systems
3. Capability Stack
4. Application Fields
5. Tool Layer
6. Build Notes
7. Contact

### Systems

Replace or supplement "Projects" with "Systems".

Filters:

- Agent Systems
- MCP and Tools
- Knowledge Work
- AI Coding
- Automation
- Domain Applications

Each item should show:

- Problem
- AI role
- Tools/data involved
- Output
- Status
- Links

### Build Notes

Rename blog from a generic blog to a working log.

Recommended categories:

- Agent Design
- MCP and Tooling
- AI Coding
- Automation
- Case Studies

## Project Card Template

Use this structure for homepage cards:

```text
Project name
One-line system statement

What it automates:
...

How AI is used:
...

Interface:
CLI / MCP / Web / Report / Agent system

Status:
Prototype / Published package / Active system / Experiment
```

This is much stronger than:

```text
Language / stars / release
```

## Suggested Featured Project Copy

### TrumanWorld

Multi-agent simulation where AI residents live, remember, plan, and interact inside a constructed town. A strong flagship for agent worlds and social simulation.

### IssueLab

An issue-driven multi-agent discussion network for traceable debate, digital participants, and async collaboration.

### zotero_cli

An AI-native Zotero command-line interface that lets coding agents search, read, cite, and operate a real literature library.

### TrendPluse

An automated intelligence pipeline for tracking AI coding tools and agent ecosystem signals across GitHub.

### manim-agent

An agentic creation workflow that turns natural language into Manim animations through code generation, rendering, review, iteration, and voice.

### article-mcp

A literature retrieval MCP server that turns biomedical literature search into an agent-callable tool.

## Implementation Plan

### Phase 1: Reframe Existing Homepage

1. Change hero headline to "Building AI agents and automation systems for real workflows."
2. Replace the current workflow nodes with capability nodes tied to actual projects.
3. Rename "Selected Experiments" to "Featured Systems".
4. Update cards to use system-oriented copy.
5. Rename "Build Log" to "Build Notes".

### Phase 2: Redesign Projects Page

1. Add project classification metadata.
2. Add flagship/supporting/hidden priority.
3. Replace repo-grid emphasis with system cards.
4. Add filters based on capability and application domain.

### Phase 3: Add Case Study Pages

Start with:

1. TrumanWorld
2. IssueLab
3. zotero_cli
4. manim-agent

Each case study should explain:

- Problem
- System architecture
- AI/agent role
- Tooling and data
- What worked
- What is next

## Final Design Principle

The homepage should make the visitor think:

> This person is building the connective tissue between AI models and real work.

That is the strongest through-line across the projects.
