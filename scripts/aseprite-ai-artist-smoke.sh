#!/usr/bin/env bash
# Smoke-check Aseprite AI Artist wiring for Chromaracers.
# Does not require a successful Aseprite connection — prints doctor output and
# verifies project MCP + AGENTS markers exist.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
FAIL=0

echo ""
echo "  Aseprite AI Artist smoke"
echo ""

check_file_has() {
  local file="$1"
  local needle="$2"
  if [[ ! -f "$file" ]]; then
    echo "  [fail] missing $file"
    FAIL=1
    return
  fi
  if grep -q "$needle" "$file"; then
    echo "  [ok] $file"
  else
    echo "  [fail] $file missing $needle"
    FAIL=1
  fi
}

check_file_has .cursor/mcp.json 'aseprite-ai-artist'
check_file_has .codex/config.toml 'aseprite-ai-artist'
check_file_has .gemini/settings.json 'aseprite-ai-artist'
check_file_has .mcp.json 'aseprite-ai-artist'
check_file_has .vscode/mcp.json 'aseprite-ai-artist'
check_file_has .opencode/opencode.json 'aseprite-ai-artist'
check_file_has AGENTS.md 'aseprite-ai-artist:start'
check_file_has docs/references/aseprite-ai-artist.md 'aseprite:studio'

echo ""
echo "  Tip: run doctor separately — npx @pebbly/aseprite-ai-artist doctor"
echo ""


if [[ "$FAIL" -ne 0 ]]; then
  echo "  Smoke: FAIL (project wiring)"
  exit 1
fi

echo "  Smoke: PASS (project wiring). Drawing still needs Aseprite + extension."
echo ""
