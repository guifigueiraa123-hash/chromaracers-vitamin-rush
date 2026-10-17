# Agent notes — Chromaracers

## Runtimes

| Runtime | Location | Notes |
|---------|----------|--------|
| **Three.js web race** (shipping) | `index.html`, `assets/main.js` | Do not replace with Babylon/PlayCanvas/Phaser unless asked |
| **Godot 4** (optional) | `godot/` when scaffolded | Separate from shipping race |

## Game studio skills (CCGS)

From [Claude Code Game Studios](https://github.com/Donchitos/Claude-Code-Game-Studios) (MIT), adapted for Cursor:

```bash
bash scripts/install-game-studio.sh
```

| Piece | Location |
|-------|----------|
| Entry skill | `.cursor/skills/game-studio` |
| Workflow skills | `.cursor/skills/ccgs-*` (74) |
| Vendor (agents, hooks, docs) | `.cursor/vendor/claude-code-game-studios/` |

Prefer skill **`game-studio`**, then the matching `ccgs-*` skill. Default rigor: **minimal**.

## Engine & resource references

| Skill | Upstream |
|-------|----------|
| `babylonjs` | https://github.com/BabylonJS/Babylon.js |
| `playcanvas` | https://github.com/playcanvas/engine |
| `phaser` | https://github.com/phaserjs/phaser |
| `bullet3` | https://github.com/bulletphysics/bullet3 |
| `magictools` | https://github.com/ellisonleao/magictools |
| `spritecook-org` | https://github.com/SpriteCook |
| `open-higgsfield` | https://github.com/Autom8AI/Open-Higgsfield-AI |
| `modly` | https://github.com/lightningpixel/modly |
| `stable-dreamfusion` | https://github.com/ashawkey/stable-dreamfusion |
| `hunyuan3d` | https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1 |

Offline mirrors: `docs/references/`.

## SpriteCook generation

- Org map: skill `spritecook-org`
- Generation workflows: skill `spritecook` when present (see SpriteCook install PR / `scripts/install-spritecook.sh`)

## Concept art / cinema stills

- Open Higgsfield AI (Muapi BYOK): skill `open-higgsfield`
- Commercial Cursor **Higgsfield** MCP is separate and needs auth — do not use unless asked

## Local 3D mesh generation (user GPU)

- Modly (image→mesh desktop app): skill `modly`
- Stable-Dreamfusion (text/image→3D research; WIP): skill `stable-dreamfusion`
- Hunyuan3D-2.1 (image→3D + PBR; community license / territory limits): skill `hunyuan3d`
- Prefer threestudio for newer DreamFusion-style pipelines; do not run these in Cloud Agents without a suitable GPU
- Review Hunyuan community license (no EU/UK/KR; >1M MAU needs Tencent commercial terms) before shipping assets
