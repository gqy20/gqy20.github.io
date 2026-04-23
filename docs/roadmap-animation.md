# 动画增强 实现计划

> 创建时间: 2026/04/23
> 状态: 规划中

## 背景

用户希望为个人主页增加更多动画优化界面，风格选择：**流畅优雅**。

### 当前动画现状

- Framer Motion 使用广泛，但主要是基础的 fade-in/slide 动画
- CSS keyframes 用于循环动画 (pulse, float, bounce)
- 缺少：页面过渡动画、视差滚动、3D 变换、动态文字动画

### 技术调研

**参考项目**：

| 项目 | 技术栈 | 关键动画 |
|------|--------|---------|
| [Framer Motion Cheatsheet](https://github.com/richawo/framer-motion-cheatsheet) | Next.js + Framer Motion | 页面过渡、拖拽手势、滚动动画、SVG 变形 |
| [Framer Tinder Cards](https://github.com/deep-codes/framer-tinder-cards) | Next.js + Framer Motion | 卡片滑动交互 |
| [react-spring parallax demo](https://github.com/pmndrs/react-spring) | React Spring | 视差滚动、物理弹簧效果 |

**核心动画库**：

| 库 | 特点 | 适用场景 |
|----|------|---------|
| **Framer Motion** | 声明式、Variants 系统、AnimatePresence | 当前项目主力，页面过渡、hover 效果 |
| **React Spring** | 物理弹簧、视差组件 | 需要物理手感、视差效果 |
| **Motion (motion.dev)** | WAAPI 底层、性能优 | 高级 3D 效果、性能敏感场景 |

---

## 1.1 页面过渡动画

**参考**: Framer Motion Cheatsheet 的 `AnimatePresence` 页面切换模式

**修改文件**: `src/App.jsx`

```jsx
import { motion, AnimatePresence } from "framer-motion"

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
  }
}

// 路由切换
<AnimatePresence mode="wait">
  <Routes>
    <Route key="/" path="/" element={
      <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
        <Hero />
      </motion.div>
    } />
  </Routes>
</AnimatePresence>
```

**进阶：滑动方向过渡**

```jsx
const swipeVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 }
  },
  exit: (direction) => ({
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
    transition: { duration: 0.3 }
  })
}
```

---

## 1.2 Hero 区域增强

**参考**: Framer Motion 3D 变换 + 打字机效果

### 1.2.1 头像 3D 翻转

**修改文件**: `src/components/Hero.jsx`

```jsx
import { motion, useMotionValue, useTransform } from "framer-motion"
import { useRef } from "react"

function Avatar3D() {
  const ref = useRef(null)
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    rotateY.set(x * 0.1)
    rotateX.set(-y * 0.1)
  }

  const handleMouseLeave = () => {
    rotateX.set(0, { type: "spring", stiffness: 200, damping: 20 })
    rotateY.set(0, { type: "spring", stiffness: 200, damping: 20 })
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        perspective: 1000
      }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <img src="avatar.jpg" alt="avatar" />
    </motion.div>
  )
}
```

**CSS**:

```css
.hero-avatar {
  transform-style: preserve-3d;
  transition: transform 0.1s ease-out;
}
```

### 1.2.2 打字机效果增强

```jsx
import { motion } from "framer-motion"

function TypewriterText({ text, delay = 0 }) {
  const letters = text.split("")

  return (
    <div style={{ display: "flex", flexWrap: "wrap" }}>
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: delay + i * 0.05,
            type: "spring",
            stiffness: 200,
            damping: 20
          }}
        >
          {letter === " " ? " " : letter}
        </motion.span>
      ))}
    </div>
  )
}
```

### 1.2.3 数字滚动计数器

```jsx
import { motion, useMotionValue, animate } from "framer-motion"
import { useEffect } from "react"

function AnimatedCounter({ value, duration = 2 }) {
  const motionValue = useMotionValue(0)
  const roundedValue = useTransform(motionValue, (v) => Math.round(v))

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      ease: "easeOut"
    })
    return controls.stop
  }, [value])

  return <motion.span>{roundedValue}</motion.span>
}
```

### 1.2.4 标题字母动画

```jsx
const titleLetters = "Qingyu Ge".split("")

const titleVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  })
}

<h1>
  {titleLetters.map((letter, i) => (
    <motion.span
      key={i}
      custom={i}
      variants={titleVariants}
      initial="hidden"
      animate="visible"
    >
      {letter === " " ? " " : letter}
    </motion.span>
  ))}
</h1>
```

---

## 1.3 Projects 区域增强

### 1.3.1 卡片 3D 透视倾斜

**参考**: Motion library 的 3D rotateY 效果

```jsx
function ProjectCard({ project }) {
  const cardRef = useRef(null)
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)

  const handleMouseMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    rotateY.set(x * 0.05)
    rotateX.set(-y * 0.05)
  }

  const handleMouseLeave = () => {
    rotateX.set(0, { type: "spring", stiffness: 200, damping: 25 })
    rotateY.set(0, { type: "spring", stiffness: 200, damping: 25 })
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d"
      }}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* 卡片内容 */}
    </motion.div>
  )
}
```

### 1.3.2 滚动触发动画（Stagger）

```jsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1,
      staggerDirection: 1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
}

<motion.div
  variants={containerVariants}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: "-100px" }}
>
  {projects.map((project) => (
    <motion.div key={project.id} variants={itemVariants}>
      <ProjectCard project={project} />
    </motion.div>
  ))}
</motion.div>
```

### 1.3.3 分类切换 Layout 动画

```jsx
import { motion, LayoutGroup } from "framer-motion"

function CategoryFilter({ categories, selected, onSelect }) {
  return (
    <LayoutGroup>
      <motion.div layout className="category-chips">
        {categories.map((cat) => (
          <motion.button
            key={cat}
            layoutId={cat}
            onClick={() => onSelect(cat)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {cat}
            {selected === cat && (
              <motion.div
                layoutId="active-indicator"
                className="active-indicator"
              />
            )}
          </motion.button>
        ))}
      </motion.div>
    </LayoutGroup>
  )
}
```

### 1.3.4 搜索框光晕效果

```jsx
function SearchInput() {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <motion.div
      animate={isFocused ? {
        boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)"
      } : {}}
      transition={{ duration: 0.3 }}
    >
      <input
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </motion.div>
  )
}
```

---

## 1.4 Blog 区域增强

### 1.4.1 视差滚动效果

**参考**: react-spring Parallax 组件

```jsx
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

function BlogCard({ post }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [50, -50])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.5, 1, 1, 0.5])

  return (
    <motion.div ref={ref} style={{ y, opacity }}>
      {/* 卡片内容 */}
    </motion.div>
  )
}
```

### 1.4.2 日期标签淡入

```jsx
const dateVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
}

<motion.span
  variants={dateVariants}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
>
  {post.date}
</motion.span>
```

### 1.4.3 标签胶囊动画

```jsx
const tagVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: (i) => ({
    scale: 1,
    opacity: 1,
    transition: {
      delay: i * 0.05,
      type: "spring",
      stiffness: 200,
      damping: 15
    }
  })
}

<div className="tags">
  {post.tags.map((tag, i) => (
    <motion.span
      key={tag}
      custom={i}
      variants={tagVariants}
      initial="hidden"
      whileInView="visible"
      whileHover={{ scale: 1.1, y: -2 }}
    >
      {tag}
    </motion.span>
  ))}
</div>
```

---

## 1.5 通用微交互

### 1.5.1 按钮涟漪效果

**修改文件**: `src/components/Button.jsx`

```jsx
import { motion } from "framer-motion"

function RippleButton({ children, onClick }) {
  const [ripples, setRipples] = useState([])

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newRipple = { x, y, id: Date.now() }
    setRipples((prev) => [...prev, newRipple])

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
    }, 600)

    onClick?.(e)
  }

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.98 }}
      className="ripple-button"
    >
      {children}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="ripple"
          initial={{ width: 0, height: 0, opacity: 0.5 }}
          animate={{ width: 300, height: 300, opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{ left: ripple.x, top: ripple.y }}
        />
      ))}
    </motion.button>
  )
}
```

### 1.5.2 链接下划线动画

```css
/* src/components/Link.css */
.link-hover {
  position: relative;
  text-decoration: none;
}

.link-hover::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: currentColor;
  transition: width 0.3s ease;
}

.link-hover:hover::after {
  width: 100%;
}
```

### 1.5.3 玻璃态效果

```css
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
}
```

---

## 1.6 高级动画模式

### 1.6.1 拖拽排序（可选）

```jsx
import { motion, Reorder } from "framer-motion"

function DraggableProject({ project }) {
  return (
    <Reorder.Item
      value={project}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileDrag={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
    >
      {project.name}
    </Reorder.Item>
  )
}
```

### 1.6.2 SVG 路径动画

```jsx
function AnimatedPath() {
  const { scrollYProgress } = useScroll()
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <svg viewBox="0 0 100 100">
      <motion.path
        d="M10 50 Q 50 10, 90 50 T 90 50"
        stroke="url(#gradient)"
        strokeWidth="2"
        fill="none"
        style={{ pathLength }}
      />
    </svg>
  )
}
```

---

## 1.7 性能优化

### 1.7.1 关键 CSS 属性

```css
/* 启用 GPU 加速 */
.animated-element {
  will-change: transform, opacity;
  transform: translateZ(0); /* 强制 GPU 渲染 */
  backface-visibility: hidden;
}

/* 禁用提升 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 1.7.2 Framer Motion 性能模式

```jsx
// 使用 useReducedMotion 监听系统偏好
import { useReducedMotion } from "framer-motion"

function AnimatedComponent() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      animate={shouldReduceMotion ? {} : { x: 100 }}
      transition={shouldReduceMotion ? { duration: 0 } : { type: "spring" }}
    />
  )
}
```

---

## 实现顺序

1. **Phase 1**: App.jsx 页面过渡（AnimatePresence + mode="wait"）
2. **Phase 2**: Hero 区域 3D 头像 + 字母动画
3. **Phase 3**: Projects 卡片 3D 透视 + Stagger 滚动动画
4. **Phase 4**: Blog 视差滚动 + 标签胶囊动画
5. **Phase 5**: 通用微交互（涟漪按钮、玻璃态）

## 验证方式

- 运行 `npm run dev` 查看本地效果
- 测试所有页面过渡、hover 效果、滚动动画
- 使用 `prefers-reduced-motion` 验证降级
- Lighthouse Performance 评分监控

## 参考资源

- [Framer Motion 官方文档](https://www.framer.com/motion/)
- [Framer Motion Cheatsheet](https://github.com/richawo/framer-motion-cheatsheet)
- [React Spring Parallax](https://www.react-spring.dev/library/parallax)
- [Motion (motion.dev)](https://motion.dev/)
