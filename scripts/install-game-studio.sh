#!/usr/bin/env bash
# Install / refresh game-studio skills (CCGS + Babylon + magictools) into ~/.cursor/skills
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
USER_SKILLS="${HOME}/.cursor/skills"
PROJECT_SKILLS="${ROOT}/.cursor/skills"

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

echo "  [ok] Installed to ${USER_SKILLS}:"
ls -1 "${USER_SKILLS}" | grep -E '^(ccgs-|game-studio|babylonjs|magictools)' | sed 's/^/    - /' | head -20
echo "    ... ($(ls -1 "${USER_SKILLS}" | grep -cE '^(ccgs-|game-studio|babylonjs|magictools)') skills)"
echo ""
echo "  Entry skill: game-studio"
echo "  Refs: docs/references/ (Babylon.js, magictools)"
echo "  Vendor: .cursor/vendor/claude-code-game-studios/"
echo ""
