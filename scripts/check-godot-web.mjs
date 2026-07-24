import { stat } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const runtimeDir = path.join(projectRoot, 'public/runtime/home')
const requiredFiles = [
  'index.html',
  'index.js',
  'index.pck',
  'index.wasm',
  'index.audio.worklet.js',
  'index.audio.position.worklet.js',
]
const maximumWasmBytes = Number(process.env.GODOT_WASM_BUDGET_BYTES || 42 * 1024 * 1024)

const sizes = new Map()
for (const filename of requiredFiles) {
  let metadata
  try {
    metadata = await stat(path.join(runtimeDir, filename))
  } catch {
    throw new Error(`Godot Web runtime is incomplete: missing ${filename}`)
  }
  if (!metadata.isFile() || metadata.size === 0) {
    throw new Error(`Godot Web runtime is invalid: ${filename} is empty`)
  }
  sizes.set(filename, metadata.size)
}

const wasmBytes = sizes.get('index.wasm')
if (wasmBytes > maximumWasmBytes) {
  throw new Error(
    `Godot WASM is ${(wasmBytes / 1024 / 1024).toFixed(1)} MiB, above the ` +
    `${(maximumWasmBytes / 1024 / 1024).toFixed(1)} MiB performance budget`,
  )
}

const totalBytes = [...sizes.values()].reduce((total, size) => total + size, 0)
console.log(
  `Godot Web runtime verified: ${(totalBytes / 1024 / 1024).toFixed(1)} MiB ` +
  `(WASM ${(wasmBytes / 1024 / 1024).toFixed(1)} MiB).`,
)

