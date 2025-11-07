import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // 手动代码分割优化
        manualChunks: {
          // 将语法高亮相关代码分割到独立 chunk，延迟加载
          'syntax-highlight': ['shiki'],
          // React 相关库
          'react-vendor': ['react', 'react-dom'],
          // 其他第三方库
          'vendor': ['react-router-dom', 'framer-motion', 'react-markdown']
        }
      }
    }
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