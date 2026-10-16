#!/usr/bin/env bash
# Install the official SpriteCook Cursor plugin into ~/.cursor/plugins/local/spritecook
# Repo MCP config lives in .cursor/mcp.json (Cursor endpoint, OAuth — no API key).
set -euo pipefail

curl -fsSL https://spritecook.ai/install-cursor.sh | bash

echo ""
echo "Repo MCP config: .cursor/mcp.json → https://mcp.spritecook.ai/mcp/cursor"
echo "Next: Cursor Settings → Tools & MCP → enable spritecook → complete OAuth."
echo "Cloud Agents: enable spritecook under Agents MCP / Plugins & MCPs, then authenticate."
