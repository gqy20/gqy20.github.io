import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { htmlOptimizePlugin } from './vite-plugin-html-optimize.js'
import { rssPlugin } from './vite-plugin-rss.js'

export default defineConfig({
  plugins: [react(), htmlOptimizePlugin(), rssPlugin()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 文件名哈希，便于长期缓存
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 精确匹配 React 包；不要用 `includes('/react/')`，它会误伤 @gsap/react。
          if (/\/node_modules\/(?:react|react-dom|scheduler)\//.test(id)) {
            return 'react-vendor'
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
