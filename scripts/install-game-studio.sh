#!/usr/bin/env bash
# Install / refresh game-studio + engine reference skills into ~/.cursor/skills
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
USER_SKILLS="${HOME}/.cursor/skills"
PROJECT_SKILLS="${ROOT}/.cursor/skills"
REF_RE='^(ccgs-|game-studio|babylonjs|magictools|playcanvas|bullet3|spritecook-org)'

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
copy_named "bullet3"
copy_named "spritecook-org"

echo "  [ok] Installed to ${USER_SKILLS}:"
ls -1 "${USER_SKILLS}" | grep -E "${REF_RE}" | sed 's/^/    - /' | head -24
echo "    ... ($(ls -1 "${USER_SKILLS}" | grep -cE "${REF_RE}") skills)"
echo ""
echo "  Entry skill: game-studio"
echo "  Engine refs: babylonjs, playcanvas, bullet3, magictools, spritecook-org"
echo "  Vendor: .cursor/vendor/claude-code-game-studios/"
echo ""
