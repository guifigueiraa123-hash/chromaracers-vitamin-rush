#!/usr/bin/env bash
# Smoke-check img2threejs wiring for Chromaracers (does not run a full reconstruction).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
FAIL=0

echo ""
echo "  img2threejs smoke"
echo ""

check() {
  local label="$1"
  shift
  if "$@" >/dev/null 2>&1; then
    echo "  [ok] ${label}"
  else
    echo "  [fail] ${label}"
    FAIL=1
  fi
}

check "Node/npx present" command -v npx
check "Python ≥ 3.10" python3 -c 'import sys; raise SystemExit(0 if sys.version_info >= (3, 10) else 1)'
check "Git present" command -v git
check "Chromaracers map doc" test -f docs/references/img2threejs.md
check "Adapter skill" test -f .cursor/skills/chromaracers-img2threejs/SKILL.md
check "AGENTS.md mentions img2threejs" grep -q img2threejs AGENTS.md

if [[ -L .cursor/skills/img2threejs || -d .cursor/skills/img2threejs ]]; then
  if [[ -f .cursor/skills/img2threejs/SKILL.md && -f .cursor/skills/img2threejs/forge/next.py ]]; then
    echo "  [ok] .cursor/skills/img2threejs (SKILL.md + forge/next.py)"
  else
    echo "  [fail] .cursor/skills/img2threejs incomplete — run bash scripts/install-img2threejs.sh"
    FAIL=1
  fi
else
  echo "  [fail] missing .cursor/skills/img2threejs — run bash scripts/install-img2threejs.sh"
  FAIL=1
fi

echo ""
echo "  --- doctor ---"
npx --yes img2threejs@latest doctor || true
echo "  --------------"
echo ""

if [[ "$FAIL" -ne 0 ]]; then
  echo "  Smoke: FAIL"
  exit 1
fi

echo "  Smoke: PASS (wiring). Full reconstruction still needs a reference image + agent session."
echo ""
