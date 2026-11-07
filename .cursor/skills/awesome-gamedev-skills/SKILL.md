---
name: awesome-gamedev-skills
description: >-
  Full catalog of gamedev-skills/awesome-gamedev-agent-skills (77 skills +
  router) vendored under .cursor/skills/. Use router first to pick engine/task
  skills. Apache-2.0 upstream.
---

# Awesome GameDev Agent Skills (full catalog)

Upstream: [gamedev-skills/awesome-gamedev-agent-skills](https://github.com/gamedev-skills/awesome-gamedev-agent-skills) (Apache-2.0)

**77 skills + `router`** are installed flat under `.cursor/skills/` (names are globally unique). Name list: `docs/references/awesome-gamedev-skills-list.txt`.

## How to use

1. Prefer skill **`router`** at the start of a gamedev request — it detects engine + task and names the minimal skill set.
2. Then read the skills it names (e.g. `threejs-scene-setup`, `godot-gdscript`, `platformer`).
3. Chromaracers shipping runtime remains **Three.js**; Godot is optional lab. Unity/Unreal/Roblox skills are available for reference/prototypes only — do not migrate the race unless the user asks.

## Categories (upstream)

| Group | Examples |
|-------|----------|
| Router | `router` |
| Web | `threejs-*`, `phaser-*`, `pixijs-rendering` |
| Godot | `godot-*` |
| Unity / Unreal | `unity-*`, `unreal-*` |
| Other engines | `bevy-ecs`, `defold-core`, `love2d-core`, `pygame-core`, `ebitengine-game`, `roblox-*` |
| Disciplines | `create-game-assets`, `shader-programming`, `save-systems`, `game-feel`, … |
| Genres | `platformer`, `roguelike`, `rpg`, … |
| Workflows | `game-jam`, `itch-publish`, `steam-publish`, `prototype-fast` |

## Refresh from upstream

```bash
npx skills add gamedev-skills/awesome-gamedev-agent-skills -a cursor -y
# or re-copy skills/*/ and router/ into .cursor/skills/
```

## Offline

- `docs/references/awesome-gamedev-skills.md`
- `docs/references/awesome-gamedev-skills-LICENSE`
- `docs/references/awesome-gamedev-skills-list.txt`
