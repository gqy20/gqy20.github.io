#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
runtime_dir="${project_root}/public/runtime/home"
runtime_stamp="${runtime_dir}/index.pck"
required_files=(index.html index.js index.pck index.wasm)
needs_export=false

for required_file in "${required_files[@]}"; do
  if [[ ! -s "${runtime_dir}/${required_file}" ]]; then
    needs_export=true
    break
  fi
done

if [[ "${needs_export}" == false ]]; then
  newer_source="$({
    find "${project_root}/godot/home-runtime" \
      -path '*/.godot' -prune -o \
      -type f -newer "${runtime_stamp}" -print -quit
  })"
  if [[ -n "${newer_source}" ]]; then
    needs_export=true
  fi
fi

if [[ "${needs_export}" == true ]]; then
  echo "Godot Web runtime is missing or stale; exporting it now."
  bash "${project_root}/scripts/export-godot-web.sh"
else
  echo "Godot Web runtime is up to date."
fi

node "${project_root}/scripts/check-godot-web.mjs"
