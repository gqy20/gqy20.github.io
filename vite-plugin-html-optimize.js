// Vite 插件：优化 HTML 头部标签
export function htmlOptimizePlugin() {
  return {
    name: 'html-optimize',
    transformIndexHtml(html) {
      // 在 </head> 前插入优化标签
      const insertBefore = '</head>'
      const additionalTags = `
    <!-- Resource Hints for Performance -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://avatars.githubusercontent.com">
    <link rel="dns-prefetch" href="https://api.github.com">

    <!-- Security Headers -->
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta http-equiv="X-Frame-Options" content="DENY">
    <meta http-equiv="X-XSS-Protection" content="1; mode=block">
    <meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
  `.trim()

      return html.replace(insertBefore, additionalTags + '\n  ' + insertBefore)
    }
  }
}