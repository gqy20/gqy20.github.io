# Qingyu Ge - React 个人主页

![Performance](https://img.shields.io/badge/Performance-54%2F100-orange)

## 🚀 项目特色

- **🎨 粒子背景动画** - 交互式粒子效果，鼠标悬停和点击特效
- **🌓 深色模式切换** - 支持亮色/暗色主题切换
- **⚡ 流畅动画** - 基于 Framer Motion 的微交互动画
- **📱 完全响应式** - 大屏优化设计，移动端友好
- **🎯 博客系统** - 完整的Markdown博客功能
- **📊 动态数据** - 实时GitHub项目统计
- **✨ 现代UI** - 玻璃态效果、渐变色彩、悬浮动画

## 🛠️ 技术栈

- **前端**: React 18 + Vite + HashRouter
- **动画**: Framer Motion + React Type Animation
- **粒子效果**: tsparticles
- **样式**: CSS3 + CSS Variables
- **博客**: react-markdown + remark-gfm + rehype-highlight
- **数据**: GitHub API + JSON
- **图标**: React Icons
- **部署**: GitHub Pages + GitHub Actions
- **性能监控**: Lighthouse + 自动化分析

## 📊 性能监控

- **🚀 自动化分析**: GitHub Actions 每日运行 Lighthouse 性能检测
- **📈 Core Web Vitals**: 监控 FCP、LCP、CLS、TBT 等关键指标
- **🎯 多设备测试**: 移动端和桌面端性能全覆盖
- **📋 优化建议**: 自动生成性能优化建议和趋势分析

```bash
# 本地性能检查
npm run perf:check    # 完整分析
npm run perf:quick    # 快速检查
```

## 📦 本地开发

首次运行需要 Node.js 24 和 Godot 4.7.1（或通过 `GODOT_BIN` 指定可执行文件）。`dev` 和 `build` 会检查 Godot Web Runtime，只在产物缺失或源文件更新时重新导出。

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 仅重新导出 / 校验 Godot Runtime
npm run godot:export
npm run godot:check

# 特殊场景下只构建 React（要求 Runtime 已存在）
npm run build:web

# 预览构建结果
npm run preview
```

## 🚀 部署指南

### 方法一：使用 GitHub Actions（推荐）
**自动部署配置已完成！** 你只需要：

1. 修改代码
2. 推送到 main 分支：
   ```bash
   git add .
   git commit -m "update website"
   git push origin main
   ```

GitHub Actions 会自动：
- ✅ 安装依赖（Node.js 24）
- ✅ 构建项目
- ✅ 部署到 GitHub Pages
- ✅ 更新项目统计数据（每6小时）

### 监控工作流运行
可以在仓库的 Actions 标签页查看工作流运行状态：
- **deploy.yml**: 每次代码推送时触发
- **update-data.yml**: 每6小时自动更新项目数据

### 常见问题排除
1. **部署失败**: 检查 Node.js 版本是否为 24
2. **页面空白**: 确认部署源选择了 "GitHub Actions"
3. **数据不更新**: 检查 update-data.yml 工作流是否正常运行

### 方法二：手动部署
```bash
# 1. 安装依赖
npm install

# 2. 构建项目
npm run build

# 3. 手动部署到 GitHub Pages
# 将 dist/ 目录内容推送到 gh-pages 分支
```

## ⚙️ GitHub Pages 配置

### 部署源设置（重要）
在 GitHub 仓库设置中必须选择正确的部署源：

1. 进入仓库 Settings → Pages
2. 在 "Source" 部分选择 **"GitHub Actions"**（不是 Deploy from a branch）
3. 这会让 GitHub Pages 自动运行 Actions 工作流进行部署

### 部署源对比
- **GitHub Actions**（推荐）：自动运行构建和部署，支持 Node.js 24
- **Deploy from a branch**：从特定分支直接部署静态文件，不支持构建过程

## 🌐 自定义域名

### 更换网站地址

**步骤 1：配置 CNAME 文件**
```bash
# 在根目录创建 CNAME 文件
echo "your-domain.com" > CNAME
git add CNAME
git commit -m "Add custom domain"
git push origin main
```

**步骤 2：配置 DNS**
在域名提供商处添加 CNAME 记录：
- 主机记录：`your-domain.com`
- 值向：`gqy20.github.io`

**步骤 3：启用 HTTPS**
在 GitHub 仓库设置中：
1. Settings → Pages
2. 在 "Custom domain" 中输入你的域名
3. GitHub 会自动配置 HTTPS

### GitHub Pages 配置要求
- ✅ **必须保留** `.nojekyll` 文件（阻止 Jekyll 处理）
- ✅ 使用 `gh-pages` 分支或默认分支的 `/docs` 目录
- ✅ 仓库必须是公开的
- ✅ 启用 GitHub Pages 功能
- ✅ 部署源选择 **"GitHub Actions"**

### 重要文件说明
- **`.nojekyll`**: **必要文件** - 告诉 GitHub Pages这不是 Jekyll 项目，避免处理冲突
- **`CNAME`**: 可选 - 用于自定义域名配置
- **`.github/workflows/`**: GitHub Actions 配置目录
  - `deploy.yml`: 自动部署工作流
  - `update-data.yml`: 数据更新工作流（每6小时）

**网站地址**: https://home.gqy20.top（当前配置）
**GitHub 地址**: https://gqy20.github.io

## 📁 项目结构

```
├── src/
│   ├── components/
│   │   ├── Hero.jsx              # 首页英雄区域 + 动态统计
│   │   ├── Navbar.jsx            # 导航栏 + 深色模式
│   │   ├── Blog.jsx              # 博客列表页面
│   │   ├── BlogPost.jsx          # 博客详情页面
│   │   ├── Projects.jsx          # 项目展示页面
│   │   ├── MarkdownRenderer.jsx  # Markdown渲染组件
│   │   └── ParticleBackground.jsx # 粒子背景效果
│   ├── data/
│   │   ├── projects.json          # GitHub项目数据（自动更新）
│   │   └── blog/
│   │       ├── index.json        # 博客索引
│   │       └── *.md           # 博客文章
│   ├── App.jsx                 # 主应用（路由配置）
│   ├── main.jsx                # 入口文件
│   └── App.css                 # 全局样式
├── .github/workflows/
│   ├── deploy.yml              # 自动部署工作流
│   └── update-data.yml         # 数据更新工作流（每6小时）
├── scripts/
│   └── update-projects.js      # GitHub数据获取脚本
├── public/
│   ├── favicon-*.svg           # 网站图标
│   └── logo.svg               # Logo文件
├── .nojekyll                  # GitHub Pages配置（必要）
├── CNAME                      # 自定义域名配置
├── package.json
├── vite.config.js
└── README.md
```

## 🎨 自定义

### 修改粒子效果
编辑 `src/components/ParticleBackground.jsx` 中的配置

### 修改颜色主题
编辑 `src/App.css` 中的 CSS 变量

### 添加新页面
1. 在 `src/components/` 创建新组件
2. 在 `src/App.jsx` 中添加路由

## 🌟 炫酷功能说明

### 粒子背景
- 🖱️ 鼠标悬停：粒子连线效果
- 🎯 点击效果：生成新粒子
- 🌈 多彩粒子：蓝紫色调
- ⚡ 流畅动画：60fps 渲染

### 动画效果
- 🔄 页面切换动画
- 💫 悬浮效果
- 📱 移动端手势
- 🎪 打字机文字

### 深色模式
- 🌙 一键切换
- 🎨 平滑过渡
- 💾 状态记忆
- 📱 全端支持

---

**现在开始你的炫酷个人网站之旅！** 🚀
