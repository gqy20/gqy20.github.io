# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个使用 GitHub Pages 托管的静态个人网页项目，展示 Qingyu Ge 的个人信息和开源项目。

## 技术架构

- **静态网站**: 纯前端项目，无需构建工具
- **Jekyll**: 使用 Jekyll minimal 主题进行 GitHub Pages 托管
- **核心文件**:
  - `index.html`: 主页面，包含首页、关于我、项目展示和联系方式
  - `style.css`: 使用 CSS 变量和现代布局的响应式样式
  - `script.js`: 处理导航平滑滚动、项目卡片点击、移动端菜单等功能
  - `404.html`: 自定义404错误页面
  - `_config.yml`: Jekyll 配置文件

## 开发和部署

### 本地开发
由于这是纯静态网站，可以直接在浏览器中打开 HTML 文件进行开发：
```bash
# 使用 Python 启动本地服务器（推荐）
python -m http.server 8000
# 然后访问 http://localhost:8000

# 或使用 Node.js
npx serve .
# 然后访问 http://localhost:3000
```

### GitHub Pages 部署
1. 推送到 main 分支即可自动部署
2. 在 GitHub 仓库设置中确保 GitHub Pages 已启用
3. 网站将自动发布到 `https://gqy20.github.io`

### 样式主题
- 使用 CSS 变量定义颜色主题（`:root` 选择器中的颜色配置）
- 响应式设计，支持移动端和桌面端
- 使用 Font Awesome 图标库

## 项目结构要点

### 导航系统
- 固定在顶部的导航栏，支持平滑滚动
- 移动端汉堡菜单功能
- 键盘访问性支持

### 项目展示
- 项目卡片可点击跳转到项目链接
- 每个项目包含标题、描述、技术栈标签
- 支持键盘导航和无障碍访问

### 性能优化
- 关键资源预加载（preload）
- Font Awesome 延迟加载
- 图片懒加载和适当的尺寸设置

## 常见修改任务

### 更新个人信息
在 `index.html` 中修改以下部分：
- 头像链接（Hero Section）
- 个人介绍文本（About Section）
- 统计数据（about-stats）

### 添加新项目
在 `index.html` 的 Projects Section 中添加新的项目卡片：
```html
<div class="project-card" data-url="项目链接">
    <div class="project-content">
        <h3 class="project-title">项目名称</h3>
        <p class="project-description">项目描述</p>
        <div class="project-tags">
            <span class="tag">技术栈1</span>
            <span class="tag">技术栈2</span>
        </div>
    </div>
</div>
```

### 修改颜色主题
在 `style.css` 的 `:root` 选择器中修改 CSS 变量：
- `--primary-color`: 主色调
- `--primary-dark`: 主色调深色版本
- `--text-color`: 文本颜色
- `--bg-color`: 背景颜色

### 更新联系方式
在 `index.html` 的 Contact Section 中修改链接和信息。