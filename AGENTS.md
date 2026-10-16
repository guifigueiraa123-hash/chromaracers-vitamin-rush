# Agent notes — Chromaracers

## Runtimes in this repo

| Runtime | Location | Notes |
|---------|----------|--------|
| **Three.js web race** (current shipping game) | `index.html`, `assets/main.js` | Primary gameplay |
| **Godot 4** (optional / new games) | `godot/` when scaffolded | Separate from shipping race unless migration is requested |

## SpriteCook (skills-first)

Install and use SpriteCook as **Cursor skills**. MCP is optional.

```bash
bash scripts/install-spritecook.sh
```

| Piece | Location |
|-------|----------|
| Primary skill | `.cursor/skills/spritecook/SKILL.md` (+ `~/.cursor/skills/spritecook`) |
| Workflow skills | `.cursor/skills/spritecook-*` |
| Connect command | `.cursor/commands/connect-spritecook.md` |
| MCP (optional) | `.cursor/mcp.json` → `https://mcp.spritecook.ai/mcp/cursor` |
| REST smoke | `bash scripts/spritecook-smoke.sh` (needs `SPRITECOOK_API_KEY`) |

### How agents should work

1. Read skill `spritecook` when the user asks for sprites / SpriteCook art.
2. If SpriteCook MCP tools exist in this chat, use them (see `spritecook-workflow-essentials`).
3. If MCP is missing (typical Cloud Agent), use REST with env secret `SPRITECOOK_API_KEY` — never ask the user to paste the key into chat.
4. Create a key at https://app.spritecook.ai/api-keys (`generate`, `read_assets`, `read_credits`) and add it as environment secret `SPRITECOOK_API_KEY` when REST is needed.

Do **not** commit API keys. Do **not** use the Claude Code MCP path (`/mcp/claude`) in this repo.
