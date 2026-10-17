---
name: phaser
description: >-
  Phaser 3 HTML5 game framework reference for Cursor agents. Use when the user
  asks about Phaser, 2D web games, Canvas/WebGL sprites, or comparing Phaser to
  Three.js/Godot. Do not replace Chromaracers Three.js 3D race unless explicitly
  requested.
---

# Phaser (reference)

Upstream: [phaserjs/phaser](https://github.com/phaserjs/phaser)

Fast open-source **HTML5** game framework (WebGL + Canvas) for **2D** games on desktop and mobile browsers. JS/TS; scaffolds via `npm create @phaserjs/game@latest`.

## Chromaracers policy

- **Shipping race is Three.js 3D** (`assets/main.js`) inside the HPLC column.
- Phaser shines for **2D** arcade (HUD overlays, side-view prototypes, jam games).
- Do **not** rewrite Chromaracers in Phaser unless the user explicitly asks.
- OK to prototype a **2D companion** / menu mini-game under `prototypes/phaser/` if requested.

## Quick links

| Resource | URL |
|----------|-----|
| Repo | https://github.com/phaserjs/phaser |
| Docs | https://docs.phaser.io/ |
| Examples | https://phaser.io/examples |
| npm | `npm install phaser` |
| Scaffold | `npm create @phaserjs/game@latest` |

## When it helps Chromaracers

- 2D sprite tooling / sheet tests before dropping into Three.js billboards
- Separate marketing/landing mini-game
- Learning 2D input/animation patterns (not a 3D column replacement)
