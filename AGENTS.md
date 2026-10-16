# Agent notes — Chromaracers

## Runtimes in this repo

| Runtime | Location | Notes |
|---------|----------|--------|
| **Three.js web race** (current shipping game) | `index.html`, `assets/main.js` | Primary gameplay |
| **Godot 4** (optional / new games) | `godot/` when scaffolded | Use Cursor skills below |

## Godot skills (Cursor)

Project skills live in `.cursor/skills/`:

- `godot-game` — build/iterate Godot 4 games from Cursor
- `godot-project-setup` — scaffold a new Godot project

Install the engine binary (not committed, ~140 MB):

```bash
bash scripts/install-godot.sh
godot --version
```

Binary path: `tools/godot/godot` (symlink). Headless smoke:

```bash
godot --headless --path godot --quit-after 1
```

Do **not** replace the Three.js Chromaracers pipeline unless the user explicitly requests a Godot migration.

## SpriteCook MCP

Optional art pipeline via `.cursor/mcp.json` (`https://mcp.spritecook.ai/mcp/claude`).
Cloud Agents must enable + OAuth the MCP in the Cursor Agents UI; `mcp.json` alone is not enough.
