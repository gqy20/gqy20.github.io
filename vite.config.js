import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { htmlOptimizePlugin } from './vite-plugin-html-optimize.js'

export default defineConfig({
  plugins: [react(), htmlOptimizePlugin()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 文件名哈希，便于长期缓存
    rollupOptions: {
      output: {
        // 手动代码分割优化
        manualChunks: {
          // 将语法高亮相关代码分割到独立 chunk，延迟加载
          'syntax-highlight': ['shiki'],
          // React 相关库 - 不常变化，长期缓存
          'react-vendor': ['react', 'react-dom'],
          // 其他第三方库 - 相对稳定
          'vendor': ['react-router-dom', 'framer-motion', 'react-markdown']
        },
        // 文件名包含内容哈希，便于缓存策略
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // 启用 source map 用于生产调试
    sourcemap: true,
    // 设置 chunk 大小警告阈值
    chunkSizeWarningLimit: 1000
  },
  assetsInclude: ['**/*.md'],
  css: {
    postcss: './postcss.config.js',
  },
  server: {
    host: '0.0.0.0',
    port: 5173
  },
  // 优化依赖预构建，排除语法高亮库
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['shiki'] // 排除语法高亮库的预构建
  }
})