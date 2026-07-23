#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
godot_bin="${GODOT_BIN:-godot}"
output_dir="${project_root}/public/runtime/home"

mkdir -p "${output_dir}"
"${godot_bin}" --headless --path "${project_root}/godot/home-runtime" --export-release Web "${output_dir}/index.html"
