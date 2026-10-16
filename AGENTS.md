# Agent notes — Chromaracers

## Runtimes in this repo

| Runtime | Location | Notes |
|---------|----------|--------|
| **Three.js web race** (current shipping game) | `index.html`, `assets/main.js` | Primary gameplay |
| **Godot 4** (optional / new games) | `godot/` when scaffolded | Separate from shipping race unless migration is requested |

## SpriteCook (Cursor MCP + skills)

Official Cursor art pipeline for generating sprites, tilesets, and UI kits.

| Piece | Location |
|-------|----------|
| MCP server | `.cursor/mcp.json` → `https://mcp.spritecook.ai/mcp/cursor` |
| Workflow skills | `.cursor/skills/spritecook-*` |
| Connect command | `.cursor/commands/connect-spritecook.md` |
| Local plugin installer | `bash scripts/install-spritecook.sh` |

### Desktop Cursor

1. Run `bash scripts/install-spritecook.sh` (or the upstream one-liner from https://spritecook.ai/cursor).
2. Fully quit and reopen Cursor.
3. **Settings → Tools & MCP** → enable **spritecook** → complete browser OAuth.
4. Verify with a SpriteCook tool (e.g. credit balance), then generate assets.

### Cloud Agents

`.cursor/mcp.json` alone is not enough. Enable **spritecook** under Agents MCP / Plugins & MCPs for this environment, complete OAuth, then start a new agent turn so the `spritecook` namespace appears.

Do **not** ask for an API key for the hosted Cursor MCP flow. Do **not** use the Claude Code MCP path (`/mcp/claude`) in this repo.
