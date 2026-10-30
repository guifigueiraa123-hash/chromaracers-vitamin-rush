#!/usr/bin/env bash
# Install img2threejs skill for Chromaracers (Cursor + any detected agent hosts).
# Upstream: https://github.com/img2threejs/img2threejs
# Docs: https://github.com/img2threejs/img2threejs/blob/main/docs/INSTALL.md
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo ""
echo "  img2threejs installer (Chromaracers / Cursor)"
echo "  Upstream: https://github.com/img2threejs/img2threejs"
echo ""

if ! command -v npx >/dev/null 2>&1; then
  echo "  [err] npx not found — need Node ≥ 18"
  exit 1
fi
if ! command -v python3 >/dev/null 2>&1; then
  echo "  [err] python3 not found — need Python ≥ 3.10"
  exit 1
fi
if ! command -v git >/dev/null 2>&1; then
  echo "  [err] git not found"
  exit 1
fi

# Official CLI only auto-detects hermes/claude/codex/opencode.
# Ensure at least one host folder exists so the managed release is downloaded.
mkdir -p "${HOME}/.claude" "${HOME}/.codex/skills" "${HOME}/.cursor/skills"

echo "  [1/3] npx img2threejs@latest install"
npx --yes img2threejs@latest install || {
  echo "  [warn] auto-detect install failed; trying --host claude"
  npx --yes img2threejs@latest install --host claude
}

RELEASE=""
if [[ -L "${HOME}/.claude/skills/img2threejs" ]]; then
  RELEASE="$(readlink -f "${HOME}/.claude/skills/img2threejs")"
elif [[ -L "${HOME}/.codex/skills/img2threejs" ]]; then
  RELEASE="$(readlink -f "${HOME}/.codex/skills/img2threejs")"
fi

if [[ -z "${RELEASE}" || ! -d "${RELEASE}" ]]; then
  echo "  [err] managed release not found under ~/.claude or ~/.codex skills"
  exit 1
fi

echo "  [2/3] link Cursor skills → ${RELEASE}"
mkdir -p "${ROOT}/.cursor/skills" "${HOME}/.cursor/skills"
ln -sfn "${RELEASE}" "${ROOT}/.cursor/skills/img2threejs"
ln -sfn "${RELEASE}" "${HOME}/.cursor/skills/img2threejs"

echo "  [3/3] doctor"
npx --yes img2threejs@latest doctor || true

echo ""
echo "  [ok] Cursor project skill: .cursor/skills/img2threejs → managed release"
echo "  [ok] Chromaracers map:     docs/references/img2threejs.md"
echo "  [ok] Adapter skill:        .cursor/skills/chromaracers-img2threejs/"
echo ""
echo "  Restart Cursor / start a new agent session, then attach a reference image and ask:"
echo "    Use img2threejs to rebuild this as a procedural Three.js model for Chromaracers."
echo ""
echo "  Smoke: bash scripts/img2threejs-smoke.sh"
echo "  Plugins (optional): npx --yes @img2threejs/img2@latest install --yes"
echo ""
