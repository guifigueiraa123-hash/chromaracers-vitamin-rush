#!/usr/bin/env bash
# Install / refresh game-studio + engine reference skills into ~/.cursor/skills
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
USER_SKILLS="${HOME}/.cursor/skills"
PROJECT_SKILLS="${ROOT}/.cursor/skills"
REF_RE='^(ccgs-|game-studio|babylonjs|magictools|playcanvas|phaser|phaser-core|bullet3|spritecook-org|open-higgsfield|awesome-gamedev-skills|router|threejs-|create-game-assets|shader-programming|godot-3d|godot-gdscript|godot-export|godot-shaders)'

mkdir -p "${USER_SKILLS}"

copy_named() {
  local pattern="$1"
  local d
  for d in "${PROJECT_SKILLS}"/${pattern}; do
    [[ -d "$d" ]] || continue
    name="$(basename "$d")"
    mkdir -p "${USER_SKILLS}/${name}"
    cp -a "${d}/." "${USER_SKILLS}/${name}/"
  done
}

echo ""
echo "  Game studio skill installer"
echo ""

if [[ ! -d "${PROJECT_SKILLS}/game-studio" ]]; then
  echo "  [error] Missing ${PROJECT_SKILLS}/game-studio — run from repo with vendored skills."
  exit 1
fi

copy_named "ccgs-*"
copy_named "game-studio"
copy_named "babylonjs"
copy_named "magictools"
copy_named "playcanvas"
copy_named "phaser"
copy_named "bullet3"
copy_named "spritecook-org"
copy_named "open-higgsfield"
copy_named "awesome-gamedev-skills"
copy_named "router"
copy_named "threejs-*"
copy_named "phaser-core"
copy_named "create-game-assets"
copy_named "shader-programming"
copy_named "godot-3d-essentials"
copy_named "godot-gdscript"
copy_named "godot-export"
copy_named "godot-shaders"

echo "  [ok] Installed to ${USER_SKILLS}:"
ls -1 "${USER_SKILLS}" | grep -E "${REF_RE}" | sed 's/^/    - /' | head -36
echo "    ... ($(ls -1 "${USER_SKILLS}" | grep -cE "${REF_RE}") skills)"
echo ""
echo "  Entry skill: game-studio (or router for engine/task dispatch)"
echo "  Engine refs: babylonjs, playcanvas, phaser, threejs-*, godot-*, open-higgsfield, awesome-gamedev-skills"
echo "  Vendor: .cursor/vendor/claude-code-game-studios/"
echo ""
