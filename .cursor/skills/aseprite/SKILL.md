---
name: aseprite
description: Draw and animate Chromaracers pixel art via Aseprite AI Artist MCP (live Aseprite window or headless). Use for Vita C, Captain Caffeine, Aroma, silica/column tiles, detector props — when Aseprite is available. Prefer SpriteCook only if Aseprite is unavailable.
---

# Aseprite AI Artist → Chromaracers

Upstream: [with-pebbly/aseprite-ai-artist](https://github.com/with-pebbly/aseprite-ai-artist).

Project map: `docs/references/aseprite-ai-artist.md`.

## Hard rules

1. Call MCP tool **`preflight`** first. If not ready → stop and tell the user. **Never** edit `.aseprite` / `.png` on disk as a fallback.
2. Call **`sprite_info`** before assuming canvas size, layers, or palette.
3. Run workflows through MCP prompts / resources: start with **`aseprite:studio`** (or `skill://studio`).
4. After every pixel-changing step: **`look`** (`preview` / `ascii` / `filmstrip`).
5. Before claiming done: **`validate`**, then **`aseprite:review`**.
6. Export finished art into **`assets/`** for the shipping Three.js race — do not invent a second asset root.

## Chromaracers defaults

| Topic | Default |
|-------|---------|
| Engine | Three.js (`index.html`, `assets/main.js`) |
| Characters | Vita C, Captain Caffeine, Aroma |
| Environment | HPLC column, silica beads, UV-Vis detector |
| Export | Spritesheet / PNGs under `assets/` |

## Typical chains

- **New character pose:** `aseprite:studio` → brief/concept → draw → shade → review → export  
- **Run cycle:** open sheet → `aseprite:rig` → `aseprite:animate` → filmstrip look → export  
- **Polish existing PNG:** import/open in Aseprite → `aseprite:fix` → review → export over the target in `assets/`  
- **Tiles / silica:** `aseprite:tileset` → export  

## Setup reminders

```bash
bash scripts/install-aseprite-ai-artist.sh
npx @pebbly/aseprite-ai-artist install-extension   # local Aseprite
bash scripts/aseprite-ai-artist-smoke.sh
```

If MCP tools are missing, reload Cursor MCP after install. If `preflight` fails in Cloud Agents, say Aseprite is not on this machine.
