#!/usr/bin/env bash
# Install Aseprite AI Artist for this Chromaracers repo (Cursor project MCP + AGENTS.md).
# Upstream: https://github.com/with-pebbly/aseprite-ai-artist
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo ""
echo "  Aseprite AI Artist installer (Cursor project scope)"
echo "  Upstream: https://github.com/with-pebbly/aseprite-ai-artist"
echo ""

if ! command -v npx >/dev/null 2>&1; then
  echo "  [err] npx not found — need Node 22.6+"
  exit 1
fi

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]" 2>/dev/null || echo 0)"
if [[ "${NODE_MAJOR}" -lt 22 ]]; then
  echo "  [warn] Node ${NODE_MAJOR} detected; upstream requires Node 22.6+"
fi

npx -y @pebbly/aseprite-ai-artist@latest install cursor --project --agents --dir "$ROOT"

echo ""
echo "  Next (on a machine with Aseprite 1.3+):"
echo "    npx @pebbly/aseprite-ai-artist install-extension"
echo "    # restart Aseprite, then reload Cursor MCP"
echo "    bash scripts/aseprite-ai-artist-smoke.sh"
echo ""
echo "  Headless (CI / no window):"
echo "    npx @pebbly/aseprite-ai-artist install cursor --project --headless --aseprite /path/to/aseprite"
echo ""
