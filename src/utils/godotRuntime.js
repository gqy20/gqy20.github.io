const RUNTIME_ROOT = '/runtime/home'

export const GODOT_RUNTIME_URL = `${RUNTIME_ROOT}/index.html?embed=1`

const SHELL_ASSETS = [
  { href: `${RUNTIME_ROOT}/index.js`, as: 'script' },
  { href: `${RUNTIME_ROOT}/index.pck`, as: 'fetch' },
]

const ENGINE_ASSET = {
  href: `${RUNTIME_ROOT}/index.wasm`,
  as: 'fetch',
  type: 'application/wasm',
}

function appendPrefetch(asset) {
  if (document.head.querySelector(`link[data-godot-prefetch="${asset.href}"]`)) return

  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = asset.href
  link.as = asset.as
  link.dataset.godotPrefetch = asset.href
  if (asset.type) link.type = asset.type
  if (asset.as === 'fetch') link.crossOrigin = 'anonymous'
  document.head.appendChild(link)
}

/**
 * Warm the small loader files while the browser is idle. The 39 MB engine is
 * only prefetched after explicit RUN intent, so mobile/save-data visitors do
 * not pay for Godot while reading the normal homepage.
 */
export function warmGodotRuntime({ includeEngine = false } = {}) {
  if (typeof document === 'undefined') return

  SHELL_ASSETS.forEach(appendPrefetch)
  if (includeEngine) appendPrefetch(ENGINE_ASSET)
}

