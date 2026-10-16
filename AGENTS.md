# Agent notes — Chromaracers

## Runtimes

| Runtime | Location | Notes |
|---------|----------|--------|
| **Three.js web race** (shipping) | `index.html`, `assets/main.js` | Primary gameplay |
| **Godot 4** (optional lab) | `godot/` — see PR `cursor/godot-skill-4691` | Skills + scaffold; **not** a full race migration yet |

## SpriteCook MCP (official)

Upstream package: [SpriteCook/spritecook-mcp](https://github.com/SpriteCook/spritecook-mcp)

```bash
bash scripts/install-spritecook.sh
# or: npx spritecook-mcp setup
```

| Piece | Value |
|-------|--------|
| Config | `.cursor/mcp.json` |
| MCP URL | `https://api.spritecook.ai/mcp/` |
| Auth | `Authorization: Bearer ${SPRITECOOK_API_KEY}` |
| Skills | `.cursor/skills/spritecook*` |
| Smoke | `bash scripts/spritecook-smoke.sh` |

Create a key at https://app.spritecook.ai/api-keys (`generate`, `read_assets`, `read_credits`).  
Add environment secret `SPRITECOOK_API_KEY`. Never commit the key.

Desktop alternative: Cursor plugin OAuth via Settings → Tools & MCP (`mcp.spritecook.ai/mcp/cursor`).

## Godot (status)

| Item | Status |
|------|--------|
| Skills `godot-game`, `godot-project-setup` | Ready on branch/PR #24 |
| Install script `scripts/install-godot.sh` (Godot 4.7.2) | Ready |
| Lab project `godot/` (headless smoke) | Ready |
| Full Three.js → Godot race migration | **Not done** — paused when SpriteCook install resumed |

Do **not** replace the Three.js Chromaracers pipeline unless the user explicitly requests a Godot migration.
