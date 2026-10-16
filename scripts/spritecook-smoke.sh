#!/usr/bin/env bash
# Smoke-test SpriteCook with SPRITECOOK_API_KEY (Cloud Agents / CI).
# Create a key at https://app.spritecook.ai/api-keys (scopes: generate, read_assets, read_credits).
set -euo pipefail

if [[ -z "${SPRITECOOK_API_KEY:-}" ]]; then
  echo "SPRITECOOK_API_KEY is not set."
  echo "Add it as an environment secret, then re-run."
  exit 1
fi

BASE="${SPRITECOOK_API_URL:-https://api.spritecook.ai}"
echo "GET ${BASE}/v1/api/credits"
curl -fsS "${BASE}/v1/api/credits" \
  -H "Authorization: Bearer ${SPRITECOOK_API_KEY}" \
  -H "Accept: application/json"
echo
