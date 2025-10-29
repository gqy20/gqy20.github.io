# Qingyu Ge - React 个人主页

## 🚀 炫酷特性

- **🎨 粒子背景动画** - 交互式粒子效果，鼠标悬停和点击特效
- **🌓 深色模式切换** - 支持亮色/暗色主题切换
- **⚡ 流畅动画** - 基于 Framer Motion 的微交互动画
- **📱 完全响应式** - 移动端友好的设计
- **🎯 打字机效果** - 动态文字展示
- **✨ 现代UI** - 玻璃态效果、渐变色彩、悬浮动画

## 🛠️ 技术栈

- **前端**: React 18 + Vite
- **动画**: Framer Motion + React Type Animation
- **粒子效果**: tsparticles
- **样式**: CSS3 + CSS Variables
- **图标**: React Icons
- **部署**: GitHub Pages + GitHub Actions

## 📦 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 🚀 自动部署

**配置完成！** 现在你只需要：

1. 修改代码
2. 推送到 main 分支：
   ```bash
   git add .
   git commit -m "update website"
   git push origin main
   ```

GitHub Actions 会自动：
- 安装依赖
- 构建项目
- 部署到 GitHub Pages

**网站地址**: https://gqy20.github.io

## 📁 项目结构

```
├── src/
│   ├── components/
│   │   ├── Navbar.jsx      # 导航栏 + 深色模式
│   │   ├── Hero.jsx        # 首页英雄区域
│   │   ├── ParticleBackground.jsx  # 粒子背景
│   │   └── ...             # 其他组件
│   ├── App.jsx             # 主应用
│   └── main.jsx            # 入口文件
├── .github/workflows/
│   └── deploy.yml          # 自动部署配置
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