---
name: awesome-gamedev-skills
description: >-
  Curated Chromaracers subset of gamedev-skills/awesome-gamedev-agent-skills
  (77 Agent Skills + router). Use when routing game tasks, Three.js scene work,
  Godot lab, asset art workflow, or shaders. Prefer router first.
---

# Awesome GameDev Agent Skills (Chromaracers subset)

Upstream: [gamedev-skills/awesome-gamedev-agent-skills](https://github.com/gamedev-skills/awesome-gamedev-agent-skills) (Apache-2.0)

Full catalog: 77 skills + a **router** that detects engine/task. This repo vendors only skills that help Chromaracers — not Unity/Unreal/Roblox/etc.

## Installed here (under `.cursor/skills/`)

| Skill | Role |
|-------|------|
| `router` | Dispatch — start here for gamedev requests |
| `threejs-scene-setup` | Scene / camera / renderer / loop (shipping race) |
| `threejs-materials-lighting` | Materials & lights |
| `threejs-gltf-loading` | glTF/GLB import |
| `create-game-assets` | Art direction → asset families workflow |
| `shader-programming` | Cross-engine shader concepts |
| `phaser-core` | Phaser 3 core (2D reference; do not replace Three.js race) |
| `godot-3d-essentials` | Godot 3D lab |
| `godot-gdscript` | Typed GDScript |
| `godot-export` | Export / Web |
| `godot-shaders` | Godot shaders |

Umbrella skill name: **`awesome-gamedev-skills`** (this file).

## Chromaracers policy

- **Shipping runtime:** Three.js (`index.html`, `assets/main.js`). Prefer `threejs-*` + `router`.
- **Godot lab:** optional; use `godot-*` skills when working under `godot/`.
- Do **not** install the full 77 into this repo by default (keeps noise down). To refresh subset:

```bash
npx skills add gamedev-skills/awesome-gamedev-agent-skills \
  --skill router \
  --skill threejs-scene-setup --skill threejs-materials-lighting --skill threejs-gltf-loading \
  --skill create-game-assets --skill shader-programming \
  --skill phaser-core \
  --skill godot-3d-essentials --skill godot-gdscript --skill godot-export --skill godot-shaders \
  -a cursor -y
```

Or re-copy from upstream into `.cursor/skills/` as in the install PR.

## Offline note

`docs/references/awesome-gamedev-skills.md` · license snapshot `docs/references/awesome-gamedev-skills-LICENSE`
