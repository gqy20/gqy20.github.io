---
# ════════════════════════════════════════════════
# 博客文章 frontmatter 模板
# 用法:复制本文件 → 改名为 YYMMDD_词1_词2_词3.md(创建日期_标题关键词,≤3 个英文词、全小写、_ 分隔) → 填写字段 + 写正文
# 注意:展示层读取 src/data/blog/index.json 的元数据(不是这里的 frontmatter);
#      frontmatter 仅作编辑参考,两处请保持一致。
# ════════════════════════════════════════════════
id: "260628_my_topic"          # = 文件名(去 .md)。文件名 / id / slug / 封面图 四者同名
title: "文章标题"
type: "survey"            # 必填。survey=深度调研/原理解析 | tutorial=实操教程/how-to
date: "2026-01-01"        # 首次发布日期
updated: "2026-01-05"     # 最近更新日期(可选;与 date 相同时不显示"更新于")
author: "Qingyu Ge"
category: "AI应用"        # 主题分类
tags: ["标签1", "标签2", "标签3", "标签4", "标签5"]   # ⚠️ 最多 5 个:选最核心、最具体的;去掉太泛(LLM/AI)和与 category 重复的
excerpt: "一句话摘要,显示在博客列表卡片。"
coverImage: "/blog/260628_my_topic.jpg"   # 可选。封面缩略图,放 public/blog/ 下,与文章同名
published: true           # false 则不展示
slug: "260628_my_topic"      # URL slug,与 id/文件名一致 → /blog/260628_my_topic
---

# 文章标题

> 可选的引言/导读。

## 一级小节

正文支持标准 Markdown 与 GitHub Flavored Markdown。
所有 `##`、`###` 会自动进入右侧 TOC 目录。

## 规范速查

- **文件命名**:`YYMMDD_词1_词2_词3.md`(创建日期_≤3 个英文词、全小写、_ 分隔)。**文件名 = id = slug = 封面图名**,四者一致(如 `260628_git_claude_hooks`);正文内多张插图用 `YYMMDD_词_词_01.png` 带序号
- **type**:必填。`survey`(调研对比/选型/原理解析)或 `tutorial`(步骤/实操/how-to)
- **tags**:**最多 5 个**,具体、有区分度;别用"LLM""AI"这种泛词,别和 category 重复
- **updated**:改过文章就更新;等于 date 时列表/详情不显示"更新于"
- **readTime / wordCount**:都由 `npm run sync-blog` 从正文自动统计(350 字/分),frontmatter 不写
