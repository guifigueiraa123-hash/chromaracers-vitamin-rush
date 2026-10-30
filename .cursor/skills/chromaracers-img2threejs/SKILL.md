---
name: chromaracers-img2threejs
description: Rebuild Chromaracers lab props or characters from a reference image as procedural Three.js code via img2threejs. Use when the user attaches a photo/concept and wants a code-only THREE.Group for the Vitamin Rush race (column, silica, detector, Vita C, Captain Caffeine, Aroma).
---

# Chromaracers × img2threejs

Upstream skill: [img2threejs](https://github.com/img2threejs/img2threejs) (linked at `.cursor/skills/img2threejs` after install).  
Map: `docs/references/img2threejs.md`.

## Preconditions

1. If `.cursor/skills/img2threejs/SKILL.md` or `forge/next.py` is missing, run `bash scripts/install-img2threejs.sh` and stop until it succeeds.
2. Read `.cursor/skills/img2threejs/SKILL.md` and follow its pipeline — do not one-shot a mesh.
3. Shipping runtime is **Three.js** (`index.html`, `assets/main.js`). Do not migrate to Godot for this skill.

## Hard rules

- Code-only procedural Three.js — no photogrammetry packs, no silent GLB-as-source-of-truth unless the user explicitly asks for an emission target after the model is built.
- Run `python3 forge/next.py --state .img2threejs/state.json` from the img2threejs skill root at every start/resume/correction.
- Keep local Three (`assets/three.module.js` + `three.core.js`); no CDN.
- Put generated factories where the user asks (default suggestion: `assets/models/`). Wire imports into `assets/main.js` only when asked.
- Prefer **SpriteCook / Aseprite** for 2D spritesheets; use this skill for **3D** rebuilds.

## Chromaracers defaults

| Topic | Default |
|-------|---------|
| Engine | Three.js web race |
| Profiles | `generic` (props), `character` (Vita C / Captain Caffeine / Aroma) |
| Look | Lab HPLC / neon / silica — match reference; say when approximate |

## Typical ask

Attach a reference → invoke this adapter → follow full `img2threejs` gates → report files + how to hook into the race scene.
