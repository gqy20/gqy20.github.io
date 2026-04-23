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
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('/prismjs/')) return 'prism'
          if (id.includes('/react/') || id.includes('/react-dom/')) return 'react-vendor'
          if (
            id.includes('/react-router-dom/') ||
            id.includes('/framer-motion/') ||
            id.includes('/react-markdown/')
          ) {
            return 'vendor'
          }
        },
        // 文件名包含内容哈希，便于缓存策略
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // 公开静态站默认不发布 source map，降低发布体积并避免暴露源码映射
    sourcemap: false,
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
  // 优化依赖预构建，包含Prism.js核心以提升开发体验
  optimizeDeps: {
    include: ['react', 'react-dom', 'prismjs'],
  }
})
