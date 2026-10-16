#!/usr/bin/env bash
# Install SpriteCook as Cursor skills (+ official plugin).
# - Plugin -> ~/.cursor/plugins/local/spritecook
# - Skills -> ~/.cursor/skills/spritecook* and .cursor/skills/spritecook*
# Repo MCP: .cursor/mcp.json -> https://mcp.spritecook.ai/mcp/cursor
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PLUGIN_SRC=""
PLUGIN_ROOT="${HOME}/.cursor/plugins/local/spritecook"
USER_SKILLS="${HOME}/.cursor/skills"
PROJECT_SKILLS="${ROOT}/.cursor/skills"
PROJECT_COMMANDS="${ROOT}/.cursor/commands"
USER_COMMANDS="${HOME}/.cursor/commands"

echo ""
echo "  SpriteCook skill installer"
echo ""

# Prefer official plugin installer when network is available.
if curl -fsSL https://spritecook.ai/install-cursor.sh | bash; then
  PLUGIN_SRC="${PLUGIN_ROOT}"
else
  echo "  [warn] Upstream plugin installer failed; using repo-vendored skills only."
fi

if [[ -d "${PLUGIN_ROOT}/skills" ]]; then
  PLUGIN_SRC="${PLUGIN_ROOT}"
fi

mkdir -p "${USER_SKILLS}" "${PROJECT_SKILLS}" "${PROJECT_COMMANDS}" "${USER_COMMANDS}"

copy_tree() {
  local src="$1"
  local dest="$2"
  mkdir -p "$dest"
  cp -a "${src}/." "$dest/"
}

if [[ -n "${PLUGIN_SRC}" && -d "${PLUGIN_SRC}/skills" ]]; then
  echo "  [info] Syncing skills from plugin -> user + project"
  for d in "${PLUGIN_SRC}/skills"/*/; do
    [[ -d "$d" ]] || continue
    name="$(basename "$d")"
    copy_tree "$d" "${USER_SKILLS}/${name}"
    copy_tree "$d" "${PROJECT_SKILLS}/${name}"
  done
  if [[ -f "${PLUGIN_SRC}/commands/connect-spritecook.md" ]]; then
    cp -a "${PLUGIN_SRC}/commands/connect-spritecook.md" "${PROJECT_COMMANDS}/"
    cp -a "${PLUGIN_SRC}/commands/connect-spritecook.md" "${USER_COMMANDS}/"
  fi
elif [[ -d "${PROJECT_SKILLS}/spritecook-workflow-essentials" ]]; then
  echo "  [info] Syncing repo skills -> ~/.cursor/skills"
  for d in "${PROJECT_SKILLS}"/spritecook*/; do
    [[ -d "$d" ]] || continue
    name="$(basename "$d")"
    copy_tree "$d" "${USER_SKILLS}/${name}"
  done
else
  echo "  [error] No SpriteCook skills found to install."
  exit 1
fi

# Ensure primary entry skill exists in both places when present in repo.
if [[ -f "${PROJECT_SKILLS}/spritecook/SKILL.md" ]]; then
  copy_tree "${PROJECT_SKILLS}/spritecook" "${USER_SKILLS}/spritecook"
fi

echo ""
echo "  [ok] SpriteCook skills installed:"
ls -1 "${USER_SKILLS}" | grep '^spritecook' | sed 's/^/    - /'
echo ""
echo "  MCP (optional): .cursor/mcp.json -> https://mcp.spritecook.ai/mcp/cursor"
echo "  Cloud without MCP: set secret SPRITECOOK_API_KEY, then bash scripts/spritecook-smoke.sh"
echo ""
