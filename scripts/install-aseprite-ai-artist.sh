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

# Project-scoped configs for every supported client (codex, gemini, cursor, …).
# Equivalent to: npx @pebbly/aseprite-ai-artist install codex  # or gemini, cursor, --all
npx -y @pebbly/aseprite-ai-artist@latest install --all --project --agents --dir "$ROOT"

# Drop installer backups; they are machine-local noise in git status.
find "$ROOT" -maxdepth 3 -name '*.bak-*' -type f -print -delete 2>/dev/null || true

echo ""
echo "  Wrote project MCP configs:"
echo "    .cursor/mcp.json   (Cursor — keeps SpriteCook)"
echo "    .codex/config.toml (Codex)"
echo "    .gemini/settings.json"
echo "    .mcp.json          (Claude Code project)"
echo "    .vscode/mcp.json"
echo "    .opencode/opencode.json"
echo "    AGENTS.md"
echo "  Windsurf is user-scope only (~/.codeium/windsurf/mcp_config.json)."
echo ""
echo "  Next (on a machine with Aseprite 1.3+):"
echo "    npx @pebbly/aseprite-ai-artist install-extension"
echo "    # restart Aseprite, then reload the agent MCP"
echo "    bash scripts/aseprite-ai-artist-smoke.sh"
echo ""
echo "  Headless (CI / no window):"
echo "    npx @pebbly/aseprite-ai-artist install --all --project --headless --aseprite /path/to/aseprite"
echo ""
