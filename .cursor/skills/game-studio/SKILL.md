---
name: game-studio
description: >-
  Claude Code Game Studios workflows adapted for Cursor — onboarding, design,
  architecture, art specs, stories, QA, and release. Use when the user wants
  studio process, GDD/epics/stories, art bible, engine setup, or structured
  game-dev workflow. Skills are prefixed ccgs-*.
---

# Game Studio (CCGS → Cursor)

Vendored from [Donchitos/Claude-Code-Game-Studios](https://github.com/Donchitos/Claude-Code-Game-Studios) (MIT).

Config / agents / hooks helpers: `.cursor/vendor/claude-code-game-studios/`  
Workflow guide: `.cursor/vendor/claude-code-game-studios/docs/WORKFLOW-GUIDE.md`

## Chromaracers defaults

| Setting | Value |
|---------|--------|
| Shipping runtime | Three.js web (`index.html`, `assets/main.js`) |
| Optional engine | Godot 4 under `godot/` when scaffolded |
| Rigor | Prefer `minimal` unless the user asks for heavier process |
| Art generation | Prefer skill `spritecook` when available |

Do **not** migrate the race to Babylon.js or replace Three.js unless the user explicitly requests it.

## Entry points (read the matching `ccgs-*` skill)

| Intent | Skill |
|--------|--------|
| First onboarding | `ccgs-start` |
| Pick / pin engine | `ccgs-setup-engine` |
| Detect existing project stage | `ccgs-project-stage-detect` |
| Brainstorm / brief | `ccgs-brainstorm` / `ccgs-quick-design` |
| Design a system | `ccgs-design-system` |
| Art bible / asset specs | `ccgs-art-bible` / `ccgs-asset-spec` / `ccgs-asset-audit` |
| Architecture | `ccgs-create-architecture` / `ccgs-architecture-decision` |
| Epics & stories | `ccgs-create-epics` / `ccgs-create-stories` |
| Implement a story | `ccgs-dev-story` → `ccgs-story-done` |
| QA / smoke | `ccgs-smoke-check` / `ccgs-qa-plan` |
| Help index | `ccgs-help` |

## Cursor adaptations

- Slash commands like `/start` map to reading skill `ccgs-start`.
- `AskUserQuestion` / Claude hooks may be missing — ask in chat or proceed with Chromaracers defaults above.
- Paths that mention `.claude/` resolve under `.cursor/vendor/claude-code-game-studios/` in this repo.
- Prefer writing studio artifacts under `design/` and `production/` only when the user wants that process; for small race tweaks, stay in code.

## Related reference skills

- `babylonjs` — Babylon.js engine reference (not the shipping runtime)
- `playcanvas` — PlayCanvas WebGL2/WebGPU engine reference
- `phaser` — Phaser 3 HTML5 2D framework reference
- `bullet3` — Bullet Physics / PyBullet reference
- `magictools` — curated game-dev resource list (ellisonleao/magictools)
- `spritecook-org` — SpriteCook GitHub org map (plugins, MCP, assets)
- `spritecook` — sprite/tileset generation (when installed)
- `open-higgsfield` — open-source Higgsfield-style image/video studio (Muapi BYOK)
- `modly` — local GPU image→3D mesh desktop app (Lightning Pixel)
- `stable-dreamfusion` — local text/image→3D research (NeRF + SD; WIP)
