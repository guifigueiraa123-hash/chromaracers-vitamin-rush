---
name: spritecook-org
description: >-
  SpriteCook GitHub organization map — Cursor plugin, MCP, skills, free assets,
  tileset tools. Use when installing SpriteCook, finding official plugins, or
  locating CC0 assets. Prefer skill spritecook for generation workflows.
---

# SpriteCook organization

Upstream org: [github.com/SpriteCook](https://github.com/SpriteCook)

## Official repos (map)

| Repo | Role |
|------|------|
| [cursor-plugin](https://github.com/SpriteCook/cursor-plugin) | Cursor MCP + skills plugin |
| [spritecook-mcp](https://github.com/SpriteCook/spritecook-mcp) | Hosted / local MCP server package |
| [skills](https://github.com/SpriteCook/skills) | Agent skills for pixel-art generation |
| [claude-plugin](https://github.com/SpriteCook/claude-plugin) | Claude Code plugin |
| [codex-plugin](https://github.com/SpriteCook/codex-plugin) | Codex plugin |
| [opencode-plugin](https://github.com/SpriteCook/opencode-plugin) | OpenCode plugin |
| [grok-plugin](https://github.com/SpriteCook/grok-plugin) | Grok Build plugin |
| [spritecook-free-game-assets](https://github.com/SpriteCook/spritecook-free-game-assets) | Free CC0 game assets |
| [spritecook-tileset-gen](https://github.com/SpriteCook/spritecook-tileset-gen) | Browser tileset base-shape generator |

## Chromaracers install path

1. Prefer project skill **`spritecook`** (when present on branch / PR) for generate workflows.
2. Cursor plugin: `bash scripts/install-spritecook.sh` or upstream  
   `curl -fsSL https://spritecook.ai/install-cursor.sh | bash`
3. MCP URL (Cursor): `https://mcp.spritecook.ai/mcp/cursor` in `.cursor/mcp.json`
4. Cloud Agents without MCP: env secret `SPRITECOOK_API_KEY` + REST (`scripts/spritecook-smoke.sh` when present)

## Do not

- Commit API keys.
- Use Claude-only MCP path `/mcp/claude` in this repo.
- Clone every org repo into Chromaracers — link and install the Cursor plugin/skills only.
