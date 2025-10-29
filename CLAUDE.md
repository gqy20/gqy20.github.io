# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 React + Vite 的现代化个人主页项目，展示 Qingyu Ge 的个人信息、项目和博客。项目使用 GitHub Actions 自动部署到 GitHub Pages。

## 技术架构

- **前端框架**: React 18 + Vite
- **路由**: React Router DOM (HashRouter 用于 GitHub Pages 兼容性)
- **动画**: Framer Motion
- **样式**: CSS3 + CSS Variables + Tailwind CSS v4
- **组件**: 使用自定义 Badge、Button 等组件
- **博客**: react-markdown + remark-gfm + rehype-highlight
- **图标**: React Icons
- **部署**: GitHub Pages + GitHub Actions

## 核心开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器 (http://localhost:5173 或 http://你的局域网IP:5173)
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 手动部署到 GitHub Pages
npm run deploy
```

## 项目架构

### 组件结构
- `src/App.jsx`: 主应用，包含路由配置和深色模式状态
- `src/components/`: 所有 React 组件
  - `Navbar.jsx`: 导航栏，包含深色模式切换
  - `Hero.jsx`: 首页英雄区域，包含动态统计数据
  - `Projects.jsx`: 项目展示页面，使用 ProjectDetailModal 弹窗
  - `Blog.jsx`: 博客列表页面
  - `BlogPost.jsx`: 博客详情页面
  - `ParticleBackground.jsx`: 粒子背景效果
  - `MarkdownRenderer.jsx`: Markdown 渲染组件
  - `Badge.jsx`, `Button.jsx`: 可复用 UI 组件

### 数据管理
- `src/data/projects.json`: GitHub 项目数据（通过脚本自动更新）
- `src/data/blog/index.json`: 博客文章索引
- `src/data/blog/*.md`: 博客文章内容

### 样式系统
- `src/App.css`: 全局样式和 CSS 变量定义
- `tailwind.config.js`: Tailwind CSS 配置，与 CSS 变量集成
- `postcss.config.js`: PostCSS 配置

### 自动化
- `.github/workflows/deploy.yml`: 自动部署到 GitHub Pages
- `.github/workflows/update-data.yml`: 每6小时自动更新 GitHub 项目数据
- `scripts/update-projects.js`: GitHub API 数据获取脚本

## 重要配置

### Vite 配置特点
- 使用 HashRouter 确保 GitHub Pages 兼容性
- 支持 Markdown 文件作为资源
- PostCSS 集成

### GitHub Pages 配置
- **必须使用 GitHub Actions 作为部署源**（不是分支部署）
- 保留 `.nojekyll` 文件
- `CNAME` 文件用于自定义域名

### Tailwind CSS 集成
项目使用 CSS 变量系统，Tailwind 配置为读取现有的 CSS 变量：
- `--primary-color`, `--primary-dark`
- `--bg-color`, `--text-color`
- `--border-color`, `--accent-color`

## 常见开发任务

### 添加新项目
1. 项目数据通过 GitHub API 自动获取，手动在 `projects.json` 中添加
2. 或者在 `scripts/update-projects.js` 中配置要包含的仓库

### 添加新博客文章
1. 在 `src/data/blog/` 创建新的 `.md` 文件
2. 更新 `src/data/blog/index.json` 添加文章元数据
3. 支持标准 Markdown 和 GitHub Flavored Markdown

### 修改颜色主题
编辑 `src/App.css` 中的 CSS 变量定义，Tailwind 会自动读取这些变量。

### 添加新页面
1. 在 `src/components/` 创建新组件
2. 在 `src/App.jsx` 的 `<Routes>` 中添加路由

## 部署和自动化

### 自动部署流程
推送代码到 main 分支 → GitHub Actions 自动构建 → 部署到 GitHub Pages

### 数据更新
- 每6小时自动从 GitHub API 获取最新的项目数据
- 手动触发：在 Actions 页面运行 "Update Project Data" 工作流

### 本地构建注意事项
- Vite 构建输出到 `dist/` 目录
- 使用 HashRouter 路由，确保在 GitHub Pages 上正常工作
- 所有资源路径都相对于根目录

### 开发服务器网络访问
- 开发服务器配置为 `host: '0.0.0.0'`，支持局域网访问
- 可以通过 `http://localhost:5173` 或 `http://你的局域网IP:5173` 访问
- 便于在移动设备或其他电脑上测试网站

## 性能优化特性

- Framer Motion 提供流畅的页面切换动画
- 粒子背景效果使用 tsparticles 优化
- Markdown 内容预渲染和高亮
- 响应式设计，支持移动端和桌面端
- 深色模式支持，状态持久化