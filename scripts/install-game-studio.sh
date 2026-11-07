#!/usr/bin/env bash
# Install / refresh game-studio + engine reference + awesome-gamedev skills into ~/.cursor/skills
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
USER_SKILLS="${HOME}/.cursor/skills"
PROJECT_SKILLS="${ROOT}/.cursor/skills"
AGAS_LIST="${ROOT}/docs/references/awesome-gamedev-skills-list.txt"
REF_RE='^(ccgs-|game-studio|babylonjs|magictools|playcanvas|phaser|bullet3|spritecook-org|open-higgsfield|awesome-gamedev-skills)'

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

copy_one() {
  local name="$1"
  local d="${PROJECT_SKILLS}/${name}"
  [[ -d "$d" ]] || return 0
  mkdir -p "${USER_SKILLS}/${name}"
  cp -a "${d}/." "${USER_SKILLS}/${name}/"
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

# Full awesome-gamedev-agent-skills catalog (77 + router)
if [[ -f "${AGAS_LIST}" ]]; then
  while IFS= read -r skill_name || [[ -n "${skill_name}" ]]; do
    [[ -z "${skill_name}" || "${skill_name}" =~ ^# ]] && continue
    copy_one "${skill_name}"
  done < "${AGAS_LIST}"
else
  echo "  [warn] Missing ${AGAS_LIST} — skipped AGAS catalog copy"
fi

echo "  [ok] Installed to ${USER_SKILLS}:"
ls -1 "${USER_SKILLS}" | grep -E "${REF_RE}" | sed 's/^/    - /' | head -24
agas_count=0
if [[ -f "${AGAS_LIST}" ]]; then
  agas_count=$(grep -cve '^[[:space:]]*$' "${AGAS_LIST}" || true)
fi
echo "    ... CCGS/engine refs + ${agas_count} awesome-gamedev skills (see list file)"
echo ""
echo "  Entry: game-studio (studio process) or router (engine/task dispatch)"
echo "  Vendor: .cursor/vendor/claude-code-game-studios/"
echo "  AGAS:   gamedev-skills/awesome-gamedev-agent-skills (Apache-2.0)"
echo ""
