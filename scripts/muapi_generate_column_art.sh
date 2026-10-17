#!/usr/bin/env bash
# Generate Godot lab art via Muapi (Open Higgsfield). Requires MUAPI_API_KEY.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
if [[ -z "${MUAPI_API_KEY:-}" ]]; then
  echo "MUAPI_API_KEY missing — add Cloud Agent secret, then re-run."
  exit 2
fi
exec python3 scripts/muapi_generate_column_art.py "$@"
