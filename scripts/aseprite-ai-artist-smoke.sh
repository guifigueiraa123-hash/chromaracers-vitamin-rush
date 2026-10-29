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

if [[ ! -f .cursor/mcp.json ]]; then
  echo "  [fail] missing .cursor/mcp.json"
  FAIL=1
else
  if grep -q '"aseprite-ai-artist"' .cursor/mcp.json; then
    echo "  [ok] .cursor/mcp.json has aseprite-ai-artist"
  else
    echo "  [fail] .cursor/mcp.json missing aseprite-ai-artist server"
    FAIL=1
  fi
fi

if [[ -f AGENTS.md ]] && grep -q 'aseprite-ai-artist:start' AGENTS.md; then
  echo "  [ok] AGENTS.md has aseprite-ai-artist section"
else
  echo "  [fail] AGENTS.md missing aseprite-ai-artist markers"
  FAIL=1
fi

if [[ -f docs/references/aseprite-ai-artist.md ]]; then
  echo "  [ok] docs/references/aseprite-ai-artist.md present"
else
  echo "  [fail] missing Chromaracers mapping doc"
  FAIL=1
fi

echo ""
echo "  --- doctor ---"
npx -y @pebbly/aseprite-ai-artist@latest doctor || true
echo "  --------------"
echo ""

if [[ "$FAIL" -ne 0 ]]; then
  echo "  Smoke: FAIL (project wiring)"
  exit 1
fi

echo "  Smoke: PASS (project wiring). Drawing still needs Aseprite + extension."
echo ""
