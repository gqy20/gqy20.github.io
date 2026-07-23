#!/usr/bin/env bash
set -euo pipefail

godot_version="${GODOT_VERSION:-4.7.1}"
release_name="${godot_version}-stable"
install_dir="${GODOT_INSTALL_DIR:-${RUNNER_TEMP:-/tmp}/godot-${godot_version}}"
template_dir="${GODOT_TEMPLATE_DIR:-${HOME}/.local/share/godot/export_templates/${godot_version}.stable}"
godot_bin="${install_dir}/godot"
template_file="${template_dir}/web_nothreads_release.zip"
release_base="https://github.com/godotengine/godot/releases/download/${release_name}"

mkdir -p "${install_dir}" "${template_dir}"

if [[ ! -x "${godot_bin}" ]]; then
  editor_zip="${install_dir}/godot.zip"
  curl --fail --location --retry 3 \
    --output "${editor_zip}" \
    "${release_base}/Godot_v${release_name}_linux.x86_64.zip"
  unzip -q -o "${editor_zip}" -d "${install_dir}"
  install -m 0755 \
    "${install_dir}/Godot_v${release_name}_linux.x86_64" \
    "${godot_bin}"
  rm "${editor_zip}" "${install_dir}/Godot_v${release_name}_linux.x86_64"
fi

if [[ ! -f "${template_file}" ]]; then
  venv_dir="${install_dir}/template-fetcher"
  python3 -m venv "${venv_dir}"
  "${venv_dir}/bin/pip" --quiet install remotezip==0.12.3

  GODOT_TEMPLATE_URL="${release_base}/Godot_v${release_name}_export_templates.tpz" \
  GODOT_TEMPLATE_OUTPUT="${template_file}" \
  "${venv_dir}/bin/python" <<'PY'
import os
import shutil
import tempfile

import requests
from remotezip import RemoteFetcher, RemoteZip


class RedirectAwareFetcher(RemoteFetcher):
    def get_file_size(self):
        response = requests.head(self._url, allow_redirects=True, timeout=60)
        response.raise_for_status()
        return int(response.headers["Content-Length"])


url = os.environ["GODOT_TEMPLATE_URL"]
output = os.environ["GODOT_TEMPLATE_OUTPUT"]
member = "templates/web_nothreads_release.zip"

with tempfile.TemporaryDirectory() as temporary_dir:
    with RemoteZip(
        url,
        fetcher=RedirectAwareFetcher,
        support_suffix_range=False,
    ) as archive:
        archive.extract(member, temporary_dir)
    shutil.move(os.path.join(temporary_dir, member), output)
PY

  rm -rf "${venv_dir}"
fi

"${godot_bin}" --headless --version
