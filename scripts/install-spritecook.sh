#!/usr/bin/env bash
# Install SpriteCook for Cursor via official spritecook-mcp + plugin skills.
# Upstream: https://github.com/SpriteCook/spritecook-mcp
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PLUGIN_ROOT="${HOME}/.cursor/plugins/local/spritecook"
USER_SKILLS="${HOME}/.cursor/skills"
PROJECT_SKILLS="${ROOT}/.cursor/skills"
PROJECT_COMMANDS="${ROOT}/.cursor/commands"
USER_COMMANDS="${HOME}/.cursor/commands"

echo ""
echo "  SpriteCook installer (official MCP + skills)"
echo ""

# 1) Official Cursor plugin (skills + OAuth-capable MCP for desktop)
if curl -fsSL https://spritecook.ai/install-cursor.sh | bash; then
  echo "  [ok] Cursor plugin installed"
else
  echo "  [warn] Plugin installer failed; continuing with repo skills"
fi

# 2) Optional interactive setup from npm package (skipped if no TTY)
if [[ -t 0 ]] && command -v npx >/dev/null 2>&1; then
  echo "  [info] You can also run: npx spritecook-mcp setup"
fi

mkdir -p "${USER_SKILLS}" "${PROJECT_SKILLS}" "${PROJECT_COMMANDS}" "${USER_COMMANDS}"

copy_tree() {
  local src="$1"
  local dest="$2"
  mkdir -p "$dest"
  cp -a "${src}/." "$dest/"
}

if [[ -d "${PLUGIN_ROOT}/skills" ]]; then
  for d in "${PLUGIN_ROOT}/skills"/*/; do
    [[ -d "$d" ]] || continue
    name="$(basename "$d")"
    copy_tree "$d" "${USER_SKILLS}/${name}"
    copy_tree "$d" "${PROJECT_SKILLS}/${name}"
  done
  if [[ -f "${PLUGIN_ROOT}/commands/connect-spritecook.md" ]]; then
    cp -a "${PLUGIN_ROOT}/commands/connect-spritecook.md" "${PROJECT_COMMANDS}/"
    cp -a "${PLUGIN_ROOT}/commands/connect-spritecook.md" "${USER_COMMANDS}/"
  fi
fi

if [[ -f "${PROJECT_SKILLS}/spritecook/SKILL.md" ]]; then
  copy_tree "${PROJECT_SKILLS}/spritecook" "${USER_SKILLS}/spritecook"
fi

echo ""
echo "  [ok] Skills present:"
ls -1 "${USER_SKILLS}" 2>/dev/null | grep '^spritecook' | sed 's/^/    - /' || true
echo ""
echo "  MCP (.cursor/mcp.json) follows https://github.com/SpriteCook/spritecook-mcp"
echo "    url: https://api.spritecook.ai/mcp/"
echo "    auth: Bearer \${SPRITECOOK_API_KEY}"
echo "  Create key: https://app.spritecook.ai/api-keys"
echo "  Smoke: bash scripts/spritecook-smoke.sh"
echo ""
