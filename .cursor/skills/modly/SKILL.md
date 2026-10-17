---
name: modly
description: >-
  Modly — local open-source desktop app for image-to-3D mesh generation on your
  GPU (Lightning Pixel). Use when turning photos/concept stills into meshes for
  Chromaracers props, silica clusters, or Godot/Three.js imports. Requires a
  local GPU; not a cloud API.
---

# Modly (image → 3D, local)

Upstream: [lightningpixel/modly](https://github.com/lightningpixel/modly) (MIT)

Desktop app (Windows / Linux / Apple Silicon) that turns a **photo into a 3D mesh** using open-source models running **entirely on your GPU**. No cloud generation fee.

## Chromaracers policy

- Useful for **offline mesh assets** (silica clumps, lab props, molecule toys) from stills produced by Open Higgsfield / hand art.
- Do **not** replace the shipping Three.js race or rewrite the Godot lab as a Modly pipeline unless asked.
- Export meshes (e.g. glTF/GLB/OBJ per app) into `assets/` or `godot/assets/` only after license/quality check.
- Cloud Agents usually **lack a suitable GPU** — treat this skill as **local-machine / user-run** guidance; do not assume Modly runs in the cloud VM.

## Quick links

| Resource | URL |
|----------|-----|
| Repo | https://github.com/lightningpixel/modly |
| Releases | https://github.com/lightningpixel/modly/releases |
| Dev | `npm install` → `api/` venv + `pip install -r requirements.txt` → `npm run dev` |
| Launch scripts | `./launch.sh` / `launch.bat` |

## When it helps Chromaracers

- Image-to-mesh from Visual Target / Muapi stills
- Densifying a silica / molecule prop library without paid SpriteCook
- Godot or Three.js import of a single hero prop (not full tunnel generation)

## Offline note

Short mirror: `docs/references/modly.md`
