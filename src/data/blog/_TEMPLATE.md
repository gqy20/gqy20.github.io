---
# ════════════════════════════════════════════════
# 博客文章 frontmatter 模板
# 用法:复制本文件 → 改名为 <id>.md → 填写字段 + 写正文
# 注意:展示层读取 src/data/blog/index.json 的元数据(不是这里的 frontmatter);
#      frontmatter 仅作编辑参考,两处请保持一致。
# ════════════════════════════════════════════════
id: "my-post"
title: "文章标题"
type: "survey"            # 必填。survey=深度调研/原理解析 | tutorial=实操教程/how-to
date: "2026-01-01"        # 首次发布日期
updated: "2026-01-05"     # 最近更新日期(可选;与 date 相同时不显示"更新于")
author: "Qingyu Ge"
category: "AI应用"        # 主题分类
tags: ["标签1", "标签2", "标签3", "标签4", "标签5"]   # ⚠️ 最多 5 个:选最核心、最具体的;去掉太泛(LLM/AI)和与 category 重复的
excerpt: "一句话摘要,显示在博客列表卡片。"
coverImage: "/blog/my-post.jpg"   # 可选。封面缩略图,放 public/blog/ 下
published: true           # false 则不展示
slug: "my-post"           # URL slug,通常与 id 一致
---

# 文章标题

> 可选的引言/导读。

## 一级小节

正文支持标准 Markdown 与 GitHub Flavored Markdown。
所有 `##`、`###` 会自动进入右侧 TOC 目录。

## 规范速查

- **type**:必填。`survey`(调研对比/选型/原理解析)或 `tutorial`(步骤/实操/how-to)
- **tags**:**最多 5 个**,具体、有区分度;别用"LLM""AI"这种泛词,别和 category 重复
- **updated**:改过文章就更新;等于 date 时列表/详情不显示"更新于"
- **readTime / wordCount**:都由 `npm run sync-blog` 从正文自动统计(350 字/分),frontmatter 不写
